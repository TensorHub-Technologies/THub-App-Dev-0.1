import { A2ARequestHandlers } from '../../A2ARequestHandlers'
import { JsonRpcTransportHandler } from '../../a2a/server/transports/jsonrpc_transport_handler'
import { Request, Response } from 'express'
import { JSONRPCErrorResponse, JSONRPCSuccessResponse, JSONRPCResponse } from '@a2a-js/sdk'
import { A2AError } from '../../a2a/server/error'
import { writeFile } from 'fs/promises'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { AgentCards } from '../../database/entities/AgentCards'
import path from 'path'
import fs from 'fs'

const saveAgentCard = async (req: Request): Promise<any> => {
    console.log('service.saveAgentCard:', req.body)

    const appServer = getRunningExpressApp()

    const card = appServer.AppDataSource.getRepository(AgentCards).create({
        workflow_id: req.body.workflow_id,
        is_agent_enabled: true,
        protocol_version: req.body.protocolVersion,
        name: req.body.name,
        description: req.body.description,
        version: req.body.version,
        provider_organization: req.body.provider?.organization,
        provider_url: req.body.provider?.url,
        capabilities_streaming: req.body.capabilities?.streaming,
        capabilities_push_notifications: req.body.capabilities?.pushNotifications,
        capabilities_state_transition_history: req.body.capabilities?.stateTransitionHistory,
        authentication: req.body.authentication,
        security_schemes: req.body.securitySchemes?.join(', '),
        security: req.body.security?.join(', '),
        default_input_modes: req.body.defaultInputModes?.join(','),
        default_output_modes: req.body.defaultOutputModes?.join(','),
        supports_authenticated_extended_card: req.body.supportsAuthenticatedExtendedCard,
        prompt: req.body.prompt
    })
    await appServer.AppDataSource.getRepository(AgentCards).save(card)

    return { status: 'success' }
}

const createPromptFile = async (workflowId: string): Promise<any> => {
    const appServer = getRunningExpressApp()
    const agentCard = await appServer.AppDataSource.getRepository(AgentCards).findOneBy({ workflow_id: workflowId })

    console.log('createPromptFile workflowId:', workflowId)
    const promptdirname = path.join('/', '/prompts')
    const promptFileName = workflowId + '.prompt'
    if (!fs.existsSync(promptdirname)) fs.mkdirSync(promptdirname, { recursive: true })

    const promptFilePath = path.join(promptdirname, promptFileName)

    console.log('createPromptFile:', promptFilePath)
    console.log('agentCard:', agentCard?.prompt)
    await writeFile(promptFilePath, agentCard?.prompt ?? '', 'utf-8')
    return promptFileName
}

const getAgentCard = async (workflowId: string): Promise<any> => {
    try {
        const handler = A2ARequestHandlers.getRequestHandler(workflowId)
        if (!handler) {
            return `error: No handler found for workflowId: ${workflowId}`
        }
        // getAgentCard is on A2ARequestHandler, which DefaultRequestHandler implements
        const agentCard = await handler.getAgentCard()
        return agentCard
    } catch (error: any) {
        return 'Error fetching agent card: ' + error
    }
}

const getAgentResponse = async (workflowId: string, req: Request, res: Response): Promise<any> => {
    try {
        const handler = A2ARequestHandlers.getRequestHandler(workflowId)
        if (!handler) {
            return `error: No handler found for workflowId: ${workflowId}`
        }
        const jsonRpcTransportHandler = new JsonRpcTransportHandler(handler)
        const rpcResponseOrStream = await jsonRpcTransportHandler.handle(req.body)

        // Check if it's an AsyncGenerator (stream)
        if (typeof (rpcResponseOrStream as any)?.[Symbol.asyncIterator] === 'function') {
            const stream = rpcResponseOrStream as AsyncGenerator<JSONRPCSuccessResponse, void, undefined>

            res.setHeader('Content-Type', 'text/event-stream')
            res.setHeader('Cache-Control', 'no-cache')
            res.setHeader('Connection', 'keep-alive')
            res.flushHeaders()

            try {
                for await (const event of stream) {
                    // Each event from the stream is already a JSONRPCResult
                    res.write(`id: ${new Date().getTime()}\n`)
                    res.write(`data: ${JSON.stringify(event)}\n\n`)

                    console.log('client pinged!')
                }
            } catch (streamError: any) {
                console.error(`Error during SSE streaming (request ${req.body?.id}):`, streamError)
                // If the stream itself throws an error, send a final JSONRPCErrorResponse
                const a2aError =
                    streamError instanceof A2AError ? streamError : A2AError.internalError(streamError.message || 'Streaming error.')
                const errorResponse: JSONRPCErrorResponse = {
                    jsonrpc: '2.0',
                    id: req.body?.id || null, // Use original request ID if available
                    error: a2aError.toJSONRPCError()
                }
                if (!res.headersSent) {
                    // Should not happen if flushHeaders worked
                    res.status(500).json(errorResponse) // Should be JSON, not SSE here
                } else {
                    // Try to send as last SSE event if possible, though client might have disconnected
                    res.write(`id: ${new Date().getTime()}\n`)
                    res.write(`event: error\n`) // Custom event type for client-side handling
                    res.write(`data: ${JSON.stringify(errorResponse)}\n\n`)
                }
            } finally {
                if (!res.writableEnded) {
                    res.end()
                }
            }
        } else {
            // Single JSON-RPC response
            const rpcResponse = rpcResponseOrStream as JSONRPCResponse
            res.status(200).json(rpcResponse)
        }
    } catch (error: any) {
        // Catch errors from jsonRpcTransportHandler.handle itself (e.g., initial parse error)
        console.error('Unhandled error in A2AExpressApp POST handler:', error)
        const a2aError = error instanceof A2AError ? error : A2AError.internalError('General processing error.')
        const errorResponse: JSONRPCErrorResponse = {
            jsonrpc: '2.0',
            id: req.body?.id || null,
            error: a2aError.toJSONRPCError()
        }
        if (!res.headersSent) {
            res.status(500).json(errorResponse)
        } else if (!res.writableEnded) {
            // If headers sent (likely during a stream attempt that failed early), try to end gracefully
            res.end()
        }
    }
    return res
}

export default {
    getAgentCard,
    getAgentResponse,
    createPromptFile,
    saveAgentCard
}
