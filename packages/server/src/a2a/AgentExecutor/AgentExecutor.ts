import { Task, TaskStatusUpdateEvent } from '../types'
import { v4 as uuidv4 } from 'uuid'

import { TaskState, TextPart, Message } from '../types'
import { AgentExecutor, RequestContext, ExecutionEventBus } from '../server/index'
import { MessageData } from 'genkit'
import { workflowTool } from '../../utils/a2aTools'
//import { searchMovies, searchPeople } from "../tools";
import { googleAI } from '@genkit-ai/googleai'
import { genkit } from 'genkit'
import { join } from 'path'

const contexts: Map<string, Message[]> = new Map()
//const movieAgent = readFileSync("./dist/movie_agent.prompt", "utf8");

//const movieAgentPrompt = ai.prompt('movie_agent');

// 1. Define your agent's logic as a AgentExecutor
export class MyAgentExecutor implements AgentExecutor {
    private workflow_id: string

    constructor(workflow_id: string) {
        this.workflow_id = workflow_id
    }

    private cancelledTasks = new Set<string>()

    public cancelTask = async (taskId: string, eventBus: ExecutionEventBus): Promise<void> => {
        this.cancelledTasks.add(taskId)
        // The execute loop is responsible for publishing the final state
    }

    async execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void> {
        const userMessage = requestContext.userMessage
        const existingTask = requestContext.task

        // Determine IDs for the task and context, from requestContext.
        const taskId = requestContext.taskId
        const contextId = requestContext.contextId

        console.log(`[MyAgentExecutor] Processing message ${userMessage.messageId} for task ${taskId} (context: ${contextId})`)

        // 1. Publish initial Task event if it's a new task
        if (!existingTask) {
            const initialTask: Task = {
                kind: 'task',
                id: taskId,
                contextId: contextId,
                status: {
                    state: 'submitted',
                    timestamp: new Date().toISOString()
                },
                history: [userMessage],
                metadata: userMessage.metadata,
                artifacts: [] // Initialize artifacts array
            }
            eventBus.publish(initialTask)
        }

        // 2. Publish "working" status update
        const workingStatusUpdate: TaskStatusUpdateEvent = {
            kind: 'status-update',
            taskId: taskId,
            contextId: contextId,
            status: {
                state: 'working',
                message: {
                    kind: 'message',
                    role: 'agent',
                    messageId: uuidv4(),
                    parts: [{ kind: 'text', text: 'Generating code...' }],
                    taskId: taskId,
                    contextId: contextId
                },
                timestamp: new Date().toISOString()
            },
            final: false
        }
        eventBus.publish(workingStatusUpdate)

        //---------------------------------------------------------------------------------not in sample A2A
        // Simulate work...
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check for request cancellation
        if (this.cancelledTasks.has(taskId)) {
            console.log(`[MyAgentExecutor] Request cancelled for task: ${taskId}`)
            const cancelledUpdate: TaskStatusUpdateEvent = {
                kind: 'status-update',
                taskId: taskId,
                contextId: contextId,
                status: {
                    state: 'canceled',
                    timestamp: new Date().toISOString()
                },
                final: true
            }
            eventBus.publish(cancelledUpdate)
            eventBus.finished()
            return
        }

        //---------------------------------------------------------------------------------not in sample A2A
        //--------------------------------------------------------------------------------- code replaced with A2A sample
        /*
    // 3. Publish artifact update
    const artifactUpdate: TaskArtifactUpdateEvent = {
      kind: "artifact-update",
      taskId: taskId,
      contextId: contextId,
      artifact: {
        artifactId: "artifact-1",
        name: "artifact-1",
        parts: [{ kind: "text", text: `Task ${taskId} completed.` }],
      },
      append: false, // Each emission is a complete file snapshot
      lastChunk: true, // True for this file artifact
    };
    eventBus.publish(artifactUpdate);

    // 4. Publish final status update
    const finalUpdate: TaskStatusUpdateEvent = {
      kind: "status-update",
      taskId: taskId,
      contextId: contextId,
      status: {
        state: "completed",
        message: {
          kind: "message",
          role: "agent",
          messageId: uuidv4(),
          taskId: taskId,
          contextId: contextId,
          parts: [{ kind: "text", text: "Task completed successfully." }],
          metadata: { "a2a-js/sdk": "1.0.0"},
        },
        timestamp: new Date().toISOString(),
      },
      final: true,
    };
    eventBus.publish(finalUpdate);
    eventBus.finished();
    */

        //----------------------------------------------------------------------------------code from sample A2A
        // 3. Prepare messages for Genkit prompt
        const historyForGenkit = contexts.get(contextId) || []
        if (!historyForGenkit.find((m) => m.messageId === userMessage.messageId)) {
            historyForGenkit.push(userMessage)
        }
        contexts.set(contextId, historyForGenkit)

        const messages: MessageData[] = historyForGenkit
            .map((m) => ({
                role: (m.role === 'agent' ? 'model' : 'user') as 'user' | 'model',
                content: m.parts
                    .filter((p): p is TextPart => p.kind === 'text' && !!(p as TextPart).text)
                    .map((p) => ({
                        text: (p as TextPart).text
                    }))
            }))
            .filter((m) => m.content.length > 0)

        if (messages.length === 0) {
            console.warn(`[MovieAgentExecutor] No valid text messages found in history for task ${taskId}.`)
            const failureUpdate: TaskStatusUpdateEvent = {
                kind: 'status-update',
                taskId: taskId,
                contextId: contextId,
                status: {
                    state: 'failed',
                    message: {
                        kind: 'message',
                        role: 'agent',
                        messageId: uuidv4(),
                        parts: [{ kind: 'text', text: 'No message found to process.' }],
                        taskId: taskId,
                        contextId: contextId
                    },
                    timestamp: new Date().toISOString()
                },
                final: true
            }
            eventBus.publish(failureUpdate)
            return
        }

        const goal = (existingTask?.metadata?.goal as string | undefined) || (userMessage.metadata?.goal as string | undefined)

        try {
            // 4. Run the Genkit prompt
            /*      
      const response = await movieAgentPrompt(
        { goal: goal, now: new Date().toISOString() },
        {
          messages,
          tools: [searchMovies, searchPeople],
        }
      );


      //TODO: services create prompt in the file system and use it
*/

            const promptdirname = join('/', '/prompts')
            console.log('promptdirname:', promptdirname)
            const ai = genkit({
                plugins: [googleAI()],
                model: googleAI.model('gemini-2.0-flash'),
                promptDir: promptdirname,
                context: {}
            })

            const movieAgentPrompt = ai.prompt(this.workflow_id)

            const response = await movieAgentPrompt(
                {
                    goal,
                    now: new Date().toISOString()
                },
                {
                    tools: [workflowTool(this.workflow_id, ai)],
                    messages
                }
            )
            // Check if the request has been cancelled
            if (this.cancelledTasks.has(taskId)) {
                console.log(`[MovieAgentExecutor] Request cancelled for task: ${taskId}`)

                const cancelledUpdate: TaskStatusUpdateEvent = {
                    kind: 'status-update',
                    taskId: taskId,
                    contextId: contextId,
                    status: {
                        state: 'canceled',
                        timestamp: new Date().toISOString()
                    },
                    final: true // Cancellation is a final state
                }
                eventBus.publish(cancelledUpdate)
                return
            }

            const responseText = response.text // Access the text property using .text()
            console.info(`[MovieAgentExecutor] Prompt response: ${responseText}`)
            const lines = responseText.trim().split('\n')
            let finalStateLine = lines[lines.length - 1].trim().toUpperCase()
            // const finalStateLine = lines.at(-1)?.trim().toUpperCase();
            const agentReplyText = lines
                .slice(0, lines.length - 1)
                .join('\n')
                .trim()

            let finalA2AState: TaskState = 'unknown'

            if (finalStateLine === 'COMPLETED') {
                finalA2AState = 'completed'
            } else {
                console.warn(`[MovieAgentExecutor] Unexpected final state line from prompt: ${finalStateLine}. Defaulting to 'completed'.`)
                finalA2AState = 'completed' // Default if LLM deviates
            }

            // 5. Publish final task status update
            const agentMessage: Message = {
                kind: 'message',
                role: 'agent',
                messageId: uuidv4(),
                parts: [{ kind: 'text', text: agentReplyText || 'Completed.' }], // Ensure some text
                taskId: taskId,
                contextId: contextId
            }
            historyForGenkit.push(agentMessage)
            contexts.set(contextId, historyForGenkit)

            const finalUpdate: TaskStatusUpdateEvent = {
                kind: 'status-update',
                taskId: taskId,
                contextId: contextId,
                status: {
                    state: finalA2AState,
                    message: agentMessage,
                    timestamp: new Date().toISOString()
                },
                final: true
            }
            eventBus.publish(finalUpdate)

            console.log(`[MovieAgentExecutor] Task ${taskId} finished with state: ${finalA2AState}`)
        } catch (error: any) {
            console.error(`[MovieAgentExecutor] Error processing task ${taskId}:`, error)
            const errorUpdate: TaskStatusUpdateEvent = {
                kind: 'status-update',
                taskId: taskId,
                contextId: contextId,
                status: {
                    state: 'failed',
                    message: {
                        kind: 'message',
                        role: 'agent',
                        messageId: uuidv4(),
                        parts: [{ kind: 'text', text: `Agent error: ${error.message}` }],
                        taskId: taskId,
                        contextId: contextId
                    },
                    timestamp: new Date().toISOString()
                },
                final: true
            }
            eventBus.publish(errorUpdate)
        }
    }
}
