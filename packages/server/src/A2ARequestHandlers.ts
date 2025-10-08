import { AgentCard } from './a2a/types'
import { A2ARequestHandler, InMemoryTaskStore, TaskStore, AgentExecutor, DefaultRequestHandler } from './a2a/server/index'

export class A2ARequestHandlers {
    private static taskStore: TaskStore = new InMemoryTaskStore()

    private static requestHandlers: Record<string, A2ARequestHandler> = {} // Kept for getAgentCard

    // register request handlers here
    public static registerRequestHandler(workflowId: string, agentCard: AgentCard, executor: AgentExecutor): DefaultRequestHandler {
        //loop through workflowIds and set in record
        const requestHandler = new DefaultRequestHandler(agentCard, this.taskStore, executor)

        // check if already registered
        if (this.requestHandlers[workflowId]) {
            console.warn(`Request handler for workflowId ${workflowId} is already registered. Overwriting.`)
        }

        this.requestHandlers[workflowId] = requestHandler
        return requestHandler
    }

    public static getRequestHandler(workflowId: string): A2ARequestHandler | undefined {
        if (!workflowId) {
            throw new Error('workflowId is required to get request handler')
        }

        // Check if valid workflowId
        if (!Object.prototype.hasOwnProperty.call(this.requestHandlers, workflowId)) {
            console.warn(`Request handler for workflowId ${workflowId} is not registered.`)
            return undefined
        }

        return this.requestHandlers[workflowId]
    }
}
