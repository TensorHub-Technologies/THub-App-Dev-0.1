import { INode, INodeData, INodeParams } from '../../../src/Interface.js'
import { A2AClient } from '../../../src/a2a/client/index.js'
import { Tool } from '@langchain/core/tools'
import type {
    Message,
    MessageSendParams,
    Task,
    TaskQueryParams,
    SendMessageResponse,
    GetTaskResponse,
    SendMessageSuccessResponse,
    GetTaskSuccessResponse
} from '../../../src/a2a/types.js'
import { v4 as uuidv4 } from 'uuid'
import { forEach } from 'lodash'

class A2AClientTool extends Tool {
    name = 'a2a_client'
    description = `client for A2A server`

    private serverUrl: string

    constructor(serverUrl: string) {
        super()

        this.serverUrl = serverUrl
    }

    async _call(initialInput: string): Promise<string> {
        let result_A2A = ''
        if (!initialInput || typeof initialInput !== 'string') {
            return JSON.stringify({ error: 'Input must be a single URL string.' })
        }

        try {
            const client = new A2AClient(this.serverUrl)
            const messageId = uuidv4()
            let taskId: string | undefined

            // 1. Send a message to the agent.
            const sendParams: MessageSendParams = {
                message: {
                    messageId: messageId,
                    role: 'user',
                    parts: [{ kind: 'text', text: initialInput }],
                    kind: 'message'
                },
                configuration: {
                    blocking: true,
                    acceptedOutputModes: ['text/plain']
                }
            }

            const agentCard = await client.getAgentCard()
            //console.log("Agent Card:", agentCard);

            const sendResponse: SendMessageResponse = await client.sendMessage(sendParams)

            //console.log("Send Message Response:", sendResponse);

            // On success, the result can be a Task or a Message. Check which one it is.
            const result = (sendResponse as SendMessageSuccessResponse).result

            if (result.kind === 'task') {
                const taskResult = result as Task
                const getParams: TaskQueryParams = { id: taskResult.id }
                const getResponse: GetTaskResponse = await client.getTask(getParams)
                const getTaskResult = (getResponse as GetTaskSuccessResponse).result

                console.log('getTaskResult.status.message.parts:', getTaskResult.status?.message?.parts)
                //console.log("getTaskResult.status.message.part:", getTaskResult.status?.message?.parts?.[0]);

                forEach(getTaskResult.status?.message?.parts, (part) => {
                    if (part.kind === 'text' && part.text) {
                        result_A2A += part.text
                    }
                })

                if (getTaskResult.status?.message?.parts) {
                    ;(getTaskResult.status.message.parts as Array<{ kind: string; text?: string }>).forEach((part) => {
                        if (part.kind === 'text' && part.text) {
                            console.log('Task output:', part.text)
                            return part.text
                        }
                    })
                }
            } else if (result.kind === 'message') {
                const messageResult = result as Message
                messageResult.parts.forEach((part) => {
                    if (part.kind === 'text') {
                        console.log('Agent says:', part.text)
                    }
                })
            }

            // 2. If a task was created, get its status.
            if (taskId) {
                const getParams: TaskQueryParams = { id: taskId }
                const getResponse: GetTaskResponse = await client.getTask(getParams)

                const getTaskResult = (getResponse as GetTaskSuccessResponse).result
                forEach(getTaskResult.status?.message?.parts, (part) => {
                    if (part.kind === 'text' && part.text) {
                        result_A2A += part.text
                    }
                })
            }

            if (result_A2A && result_A2A.length > 0) {
                return result_A2A
            } else {
                return `A2A client called with input: ${initialInput}`
            }
        } catch (error: any) {
            return JSON.stringify({ error: `Failed scrape operation: ${error?.message || 'Unknown error'}` })
        }
    }
}

class A2A implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    documentation: string
    credential: INodeParams
    inputs: INodeParams[]

    constructor() {
        this.label = 'A2A Client'
        this.name = 'A2A Client'
        this.version = 1.1
        this.type = 'A2A Client'
        this.icon = 'google.svg'
        this.category = 'Tools'
        this.description = 'A2A Client'
        this.documentation = 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search'
        this.inputs = [
            {
                label: 'A2A Server url',
                name: 'A2AServerurl',
                type: 'string',
                placeholder: 'A2A Server Url'
            }
        ]
        this.baseClasses = ['Tool']
    }

    async init(nodeData: INodeData, _: string): Promise<any> {
        console.log('A2AServerurl: ', nodeData.inputs?.A2AServerurl)

        const tool = new A2AClientTool(nodeData.inputs?.A2AServerurl)

        return tool
    }
}

export const nodeClass = A2A