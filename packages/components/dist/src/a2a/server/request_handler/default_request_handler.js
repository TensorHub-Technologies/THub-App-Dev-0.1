"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultRequestHandler = void 0;
const uuid_1 = require("uuid"); // For generating unique IDs
const request_context_js_1 = require("../agent_execution/request_context.js");
const error_js_1 = require("../error.js");
const execution_event_bus_manager_js_1 = require("../events/execution_event_bus_manager.js");
const execution_event_queue_js_1 = require("../events/execution_event_queue.js");
const result_manager_js_1 = require("../result_manager.js");
const terminalStates = ['completed', 'failed', 'canceled', 'rejected'];
class DefaultRequestHandler {
    agentCard;
    extendedAgentCard;
    taskStore;
    agentExecutor;
    eventBusManager;
    // Store for push notification configurations (could be part of TaskStore or separate)
    pushNotificationConfigs = new Map();
    constructor(agentCard, taskStore, agentExecutor, eventBusManager = new execution_event_bus_manager_js_1.DefaultExecutionEventBusManager(), extendedAgentCard) {
        this.agentCard = agentCard;
        this.taskStore = taskStore;
        this.agentExecutor = agentExecutor;
        this.eventBusManager = eventBusManager;
        this.extendedAgentCard = extendedAgentCard;
    }
    async getAgentCard() {
        return this.agentCard;
    }
    async getAuthenticatedExtendedAgentCard() {
        if (!this.extendedAgentCard) {
            throw error_js_1.A2AError.authenticatedExtendedCardNotConfigured();
        }
        return this.extendedAgentCard;
    }
    async _createRequestContext(incomingMessage, taskId, isStream) {
        let task;
        let referenceTasks;
        // incomingMessage would contain taskId, if a task already exists.
        if (incomingMessage.taskId) {
            task = await this.taskStore.load(incomingMessage.taskId);
            if (!task) {
                throw error_js_1.A2AError.taskNotFound(incomingMessage.taskId);
            }
            if (terminalStates.includes(task.status.state)) {
                // Throw an error that conforms to the JSON-RPC Invalid Request error specification.
                throw error_js_1.A2AError.invalidRequest(`Task ${task.id} is in a terminal state (${task.status.state}) and cannot be modified.`);
            }
        }
        if (incomingMessage.referenceTaskIds && incomingMessage.referenceTaskIds.length > 0) {
            referenceTasks = [];
            for (const refId of incomingMessage.referenceTaskIds) {
                const refTask = await this.taskStore.load(refId);
                if (refTask) {
                    referenceTasks.push(refTask);
                }
                else {
                    console.warn(`Reference task ${refId} not found.`);
                    // Optionally, throw an error or handle as per specific requirements
                }
            }
        }
        // Ensure contextId is present
        const contextId = incomingMessage.contextId || task?.contextId || (0, uuid_1.v4)();
        const messageForContext = {
            ...incomingMessage,
            contextId
        };
        return new request_context_js_1.RequestContext(messageForContext, taskId, contextId, task, referenceTasks);
    }
    async _processEvents(taskId, resultManager, eventQueue, options) {
        let firstResultSent = false;
        try {
            for await (const event of eventQueue.events()) {
                await resultManager.processEvent(event);
                if (options?.firstResultResolver && !firstResultSent) {
                    if (event.kind === 'message' || event.kind === 'task') {
                        options.firstResultResolver(event);
                        firstResultSent = true;
                    }
                }
            }
            if (options?.firstResultRejector && !firstResultSent) {
                options.firstResultRejector(error_js_1.A2AError.internalError('Execution finished before a message or task was produced.'));
            }
        }
        catch (error) {
            console.error(`Event processing loop failed for task ${taskId}:`, error);
            if (options?.firstResultRejector && !firstResultSent) {
                options.firstResultRejector(error);
            }
            // re-throw error for blocking case to catch
            throw error;
        }
        finally {
            this.eventBusManager.cleanupByTaskId(taskId);
        }
    }
    async sendMessage(params) {
        const incomingMessage = params.message;
        if (!incomingMessage.messageId) {
            throw error_js_1.A2AError.invalidParams('message.messageId is required.');
        }
        // Default to blocking behavior if 'blocking' is not explicitly false.
        const isBlocking = params.configuration?.blocking !== false;
        const taskId = incomingMessage.taskId || (0, uuid_1.v4)();
        // Instantiate ResultManager before creating RequestContext
        const resultManager = new result_manager_js_1.ResultManager(this.taskStore);
        resultManager.setContext(incomingMessage); // Set context for ResultManager
        const requestContext = await this._createRequestContext(incomingMessage, taskId, false);
        // Use the (potentially updated) contextId from requestContext
        const finalMessageForAgent = requestContext.userMessage;
        const eventBus = this.eventBusManager.createOrGetByTaskId(taskId);
        // EventQueue should be attached to the bus, before the agent execution begins.
        const eventQueue = new execution_event_queue_js_1.ExecutionEventQueue(eventBus);
        // Start agent execution (non-blocking).
        // It runs in the background and publishes events to the eventBus.
        this.agentExecutor.execute(requestContext, eventBus).catch((err) => {
            console.error(`Agent execution failed for message ${finalMessageForAgent.messageId}:`, err);
            // Publish a synthetic error event, which will be handled by the ResultManager
            // and will also settle the firstResultPromise for non-blocking calls.
            const errorTask = {
                id: requestContext.task?.id || (0, uuid_1.v4)(), // Use existing task ID or generate new
                contextId: finalMessageForAgent.contextId,
                status: {
                    state: 'failed',
                    message: {
                        kind: 'message',
                        role: 'agent',
                        messageId: (0, uuid_1.v4)(),
                        parts: [{ kind: 'text', text: `Agent execution error: ${err.message}` }],
                        taskId: requestContext.task?.id,
                        contextId: finalMessageForAgent.contextId
                    },
                    timestamp: new Date().toISOString()
                },
                history: requestContext.task?.history ? [...requestContext.task.history] : [],
                kind: 'task'
            };
            if (finalMessageForAgent) {
                // Add incoming message to history
                if (!errorTask.history?.find((m) => m.messageId === finalMessageForAgent.messageId)) {
                    errorTask.history?.push(finalMessageForAgent);
                }
            }
            eventBus.publish(errorTask);
            eventBus.publish({
                // And publish a final status update
                kind: 'status-update',
                taskId: errorTask.id,
                contextId: errorTask.contextId,
                status: errorTask.status,
                final: true
            });
            eventBus.finished();
        });
        if (isBlocking) {
            // In blocking mode, wait for the full processing to complete.
            await this._processEvents(taskId, resultManager, eventQueue);
            const finalResult = resultManager.getFinalResult();
            if (!finalResult) {
                throw error_js_1.A2AError.internalError('Agent execution finished without a result, and no task context found.');
            }
            return finalResult;
        }
        else {
            // In non-blocking mode, return a promise that will be settled by fullProcessing.
            return new Promise((resolve, reject) => {
                this._processEvents(taskId, resultManager, eventQueue, {
                    firstResultResolver: resolve,
                    firstResultRejector: reject
                });
            });
        }
    }
    async *sendMessageStream(params) {
        const incomingMessage = params.message;
        if (!incomingMessage.messageId) {
            // For streams, messageId might be set by client, or server can generate if not present.
            // Let's assume client provides it or throw for now.
            throw error_js_1.A2AError.invalidParams('message.messageId is required for streaming.');
        }
        const taskId = incomingMessage.taskId || (0, uuid_1.v4)();
        // Instantiate ResultManager before creating RequestContext
        const resultManager = new result_manager_js_1.ResultManager(this.taskStore);
        resultManager.setContext(incomingMessage); // Set context for ResultManager
        const requestContext = await this._createRequestContext(incomingMessage, taskId, true);
        const finalMessageForAgent = requestContext.userMessage;
        const eventBus = this.eventBusManager.createOrGetByTaskId(taskId);
        const eventQueue = new execution_event_queue_js_1.ExecutionEventQueue(eventBus);
        // Start agent execution (non-blocking)
        this.agentExecutor.execute(requestContext, eventBus).catch((err) => {
            console.error(`Agent execution failed for stream message ${finalMessageForAgent.messageId}:`, err);
            // Publish a synthetic error event if needed
            const errorTaskStatus = {
                kind: 'status-update',
                taskId: requestContext.task?.id || (0, uuid_1.v4)(), // Use existing or a placeholder
                contextId: finalMessageForAgent.contextId,
                status: {
                    state: 'failed',
                    message: {
                        kind: 'message',
                        role: 'agent',
                        messageId: (0, uuid_1.v4)(),
                        parts: [{ kind: 'text', text: `Agent execution error: ${err.message}` }],
                        taskId: requestContext.task?.id,
                        contextId: finalMessageForAgent.contextId
                    },
                    timestamp: new Date().toISOString()
                },
                final: true // This will terminate the stream for the client
            };
            eventBus.publish(errorTaskStatus);
        });
        try {
            for await (const event of eventQueue.events()) {
                await resultManager.processEvent(event); // Update store in background
                yield event; // Stream the event to the client
            }
        }
        finally {
            // Cleanup when the stream is fully consumed or breaks
            this.eventBusManager.cleanupByTaskId(taskId);
        }
    }
    async getTask(params) {
        const task = await this.taskStore.load(params.id);
        if (!task) {
            throw error_js_1.A2AError.taskNotFound(params.id);
        }
        if (params.historyLength !== undefined && params.historyLength >= 0) {
            if (task.history) {
                task.history = task.history.slice(-params.historyLength);
            }
        }
        else {
            // Negative or invalid historyLength means no history
            task.history = [];
        }
        return task;
    }
    async cancelTask(params) {
        const task = await this.taskStore.load(params.id);
        if (!task) {
            throw error_js_1.A2AError.taskNotFound(params.id);
        }
        if (!task.history) {
            throw error_js_1.A2AError.taskNotFound(params.id);
        }
        if (!task.status.message) {
            throw error_js_1.A2AError.taskNotFound(params.id);
        }
        // Check if task is in a cancelable state
        const nonCancelableStates = ['completed', 'failed', 'canceled', 'rejected'];
        if (nonCancelableStates.includes(task.status.state)) {
            throw error_js_1.A2AError.taskNotCancelable(params.id);
        }
        const eventBus = this.eventBusManager.getByTaskId(params.id);
        if (eventBus) {
            await this.agentExecutor.cancelTask(params.id, eventBus);
        }
        else {
            // Here we are marking task as cancelled. We are not waiting for the executor to actually cancel processing.
            task.status = {
                state: 'canceled',
                message: {
                    // Optional: Add a system message indicating cancellation
                    kind: 'message',
                    role: 'agent',
                    messageId: (0, uuid_1.v4)(),
                    parts: [{ kind: 'text', text: 'Task cancellation requested by user.' }],
                    taskId: task.id,
                    contextId: task.contextId
                },
                timestamp: new Date().toISOString()
            };
            if (!task.status.message) {
                throw error_js_1.A2AError.internalError(`Task ${params.id} does not have a status message.`);
            }
            if (!task.status.message) {
                throw error_js_1.A2AError.internalError(`Task ${params.id} does not have a status message.`);
            }
            const message = {
                kind: task.status.message.kind,
                role: task.status.message.role,
                messageId: task.status.message.messageId,
                parts: task.status.message.parts,
                taskId: task.id,
                contextId: task.contextId
            };
            // Add cancellation message to history
            task.history = [...(task.history || []), message];
            await this.taskStore.save(task);
        }
        const latestTask = await this.taskStore.load(params.id);
        if (!latestTask) {
            throw error_js_1.A2AError.taskNotFound(params.id);
        }
        return latestTask;
    }
    async setTaskPushNotificationConfig(params) {
        if (!this.agentCard.capabilities.pushNotifications) {
            throw error_js_1.A2AError.pushNotificationNotSupported();
        }
        const task = await this.taskStore.load(params.taskId);
        if (!task) {
            throw error_js_1.A2AError.taskNotFound(params.taskId);
        }
        const { taskId, pushNotificationConfig } = params;
        // Default the config ID to the task ID if not provided for backward compatibility.
        if (!pushNotificationConfig.id) {
            pushNotificationConfig.id = taskId;
        }
        const configs = this.pushNotificationConfigs.get(taskId) || [];
        // Remove existing config with the same ID to replace it
        const updatedConfigs = configs.filter((c) => c.id !== pushNotificationConfig.id);
        updatedConfigs.push(pushNotificationConfig);
        this.pushNotificationConfigs.set(taskId, updatedConfigs);
        return params;
    }
    async getTaskPushNotificationConfig(params) {
        if (!this.agentCard.capabilities.pushNotifications) {
            throw error_js_1.A2AError.pushNotificationNotSupported();
        }
        const task = await this.taskStore.load(params.id);
        if (!task) {
            throw error_js_1.A2AError.taskNotFound(params.id);
        }
        const configs = this.pushNotificationConfigs.get(params.id) || [];
        if (configs.length === 0) {
            throw error_js_1.A2AError.internalError(`Push notification config not found for task ${params.id}.`);
        }
        let configId;
        if ('pushNotificationConfigId' in params && params.pushNotificationConfigId) {
            configId = params.pushNotificationConfigId;
        }
        else {
            // For backward compatibility, if no config ID is given, assume it's the task ID.
            configId = params.id;
        }
        const config = configs.find((c) => c.id === configId);
        if (!config) {
            throw error_js_1.A2AError.internalError(`Push notification config with id '${configId}' not found for task ${params.id}.`);
        }
        return { taskId: params.id, pushNotificationConfig: config };
    }
    async listTaskPushNotificationConfigs(params) {
        if (!this.agentCard.capabilities.pushNotifications) {
            throw error_js_1.A2AError.pushNotificationNotSupported();
        }
        const task = await this.taskStore.load(params.id);
        if (!task) {
            throw error_js_1.A2AError.taskNotFound(params.id);
        }
        const configs = this.pushNotificationConfigs.get(params.id) || [];
        return configs.map((config) => ({
            taskId: params.id,
            pushNotificationConfig: config
        }));
    }
    async deleteTaskPushNotificationConfig(params) {
        if (!this.agentCard.capabilities.pushNotifications) {
            throw error_js_1.A2AError.pushNotificationNotSupported();
        }
        const task = await this.taskStore.load(params.id);
        if (!task) {
            throw error_js_1.A2AError.taskNotFound(params.id);
        }
        const { id: taskId, pushNotificationConfigId } = params;
        const configs = this.pushNotificationConfigs.get(taskId);
        if (!configs) {
            return;
        }
        const updatedConfigs = configs.filter((c) => c.id !== pushNotificationConfigId);
        if (updatedConfigs.length === 0) {
            this.pushNotificationConfigs.delete(taskId);
        }
        else if (updatedConfigs.length < configs.length) {
            this.pushNotificationConfigs.set(taskId, updatedConfigs);
        }
    }
    async *resubscribe(params) {
        if (!this.agentCard.capabilities.streaming) {
            throw error_js_1.A2AError.unsupportedOperation('Streaming (and thus resubscription) is not supported.');
        }
        const task = await this.taskStore.load(params.id);
        if (!task) {
            throw error_js_1.A2AError.taskNotFound(params.id);
        }
        // Yield the current task state first
        yield task;
        // If task is already in a final state, no more events will come.
        const finalStates = ['completed', 'failed', 'canceled', 'rejected'];
        if (finalStates.includes(task.status.state)) {
            return;
        }
        const eventBus = this.eventBusManager.getByTaskId(params.id);
        if (!eventBus) {
            // No active execution for this task, so no live events.
            console.warn(`Resubscribe: No active event bus for task ${params.id}.`);
            return;
        }
        // Attach a new queue to the existing bus for this resubscription
        const eventQueue = new execution_event_queue_js_1.ExecutionEventQueue(eventBus);
        // Note: The ResultManager part is already handled by the original execution flow.
        // Resubscribe just listens for new events.
        try {
            for await (const event of eventQueue.events()) {
                // We only care about updates related to *this* task.
                // The event bus might be shared if messageId was reused, though
                // ExecutionEventBusManager tries to give one bus per original message.
                if (event.kind === 'status-update' && event.taskId === params.id) {
                    yield event;
                }
                else if (event.kind === 'artifact-update' && event.taskId === params.id) {
                    yield event;
                }
                else if (event.kind === 'task' && event.id === params.id) {
                    // This implies the task was re-emitted, yield it.
                    yield event;
                }
                // We don't yield 'message' events on resubscribe typically,
                // as those signal the end of an interaction for the *original* request.
                // If a 'message' event for the original request terminates the bus, this loop will also end.
            }
        }
        finally {
            eventQueue.stop();
        }
    }
}
exports.DefaultRequestHandler = DefaultRequestHandler;
//# sourceMappingURL=default_request_handler.js.map