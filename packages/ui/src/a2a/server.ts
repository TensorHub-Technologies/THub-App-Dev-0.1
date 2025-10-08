//import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
//import type { TaskStore, AgentExecutor } from "@a2a-js/sdk/server";
import { MyAgentExecutor } from '../a2a/AgentExecutor/AgentExecutor.js'
import { ToolExecutor } from '../a2a/AgentExecutor/ToolExecutor.js'
//import type { AgentCard } from "@a2a-js/sdk";
import { A2AExpressApp } from './server/express/a2a_express_app.js'
import express from 'express'
import { InMemoryTaskStore, TaskStore, AgentExecutor, DefaultRequestHandler } from '../../src/a2a/server/index'
import { AgentCard, Message } from '../a2a/types'

type workflowIds = '3d239914-8d89-4697-99cb-dc5fa314f5e2' | 'c7042ede-96ab-4b5a-91c6-dd9570f45258'
type RequestHandlers = Record<workflowIds, DefaultRequestHandler>

// Simple store for contexts
const contexts: Map<string, Message[]> = new Map()
const movieAgentCard: AgentCard = {
    protocolVersion: '1.0', // Added protocolVersion as required by AgentCard type
    name: 'Movie Agent',
    description: 'An agent that can answer questions about movies and actors using TMDB.',
    // Adjust the base URL and port as needed. /a2a is the default base in A2AExpressApp

    url: 'http://localhost:3000/3d239914-8d89-4697-99cb-dc5fa314f5e2', // Example: if baseUrl in A2AExpressApp
    provider: {
        organization: 'A2A Samples',
        url: 'https://example.com/a2a-samples' // Added provider URL
    },
    version: '0.0.2', // Incremented version
    capabilities: {
        streaming: true, // The new framework supports streaming
        pushNotifications: false, // Assuming not implemented for this agent yet
        stateTransitionHistory: true // Agent uses history
    },
    // authentication: null, // Property 'authentication' does not exist on type 'AgentCard'.
    securitySchemes: undefined, // Or define actual security schemes if any
    security: undefined,
    defaultInputModes: ['text'],
    defaultOutputModes: ['text', 'task-status'], // task-status is a common output mode
    skills: [
        {
            id: 'general_movie_chat',
            name: 'General Movie Chat',
            description: 'Answer general questions or chat about movies, actors, directors.',
            tags: ['movies', 'actors', 'directors'],
            examples: [
                'Tell me about the plot of Inception.',
                'Recommend a good sci-fi movie.',
                'Who directed The Matrix?',
                'What other movies has Scarlett Johansson been in?',
                'Find action movies starring Keanu Reeves',
                'Which came out first, Jurassic Park or Terminator 2?'
            ],
            inputModes: ['text'], // Explicitly defining for skill
            outputModes: ['text', 'task-status'] // Explicitly defining for skill
        }
    ],
    supportsAuthenticatedExtendedCard: false
}

const toolAgentCard: AgentCard = {
    protocolVersion: '1.0', // Added protocolVersion as required by AgentCard type
    name: 'Tool Agent',
    description: 'An agent that can answer questions about movies and actors using TMDB.',
    // Adjust the base URL and port as needed. /a2a is the default base in A2AExpressApp
    url: 'http://localhost:3000/c7042ede-96ab-4b5a-91c6-dd9570f45258', // Example: if baseUrl in A2AExpressApp
    provider: {
        organization: 'A2A Samples',
        url: 'https://example.com/a2a-samples' // Added provider URL
    },
    version: '0.0.2', // Incremented version
    capabilities: {
        streaming: true, // The new framework supports streaming
        pushNotifications: false, // Assuming not implemented for this agent yet
        stateTransitionHistory: true // Agent uses history
    },
    // authentication: null, // Property 'authentication' does not exist on type 'AgentCard'.
    securitySchemes: undefined, // Or define actual security schemes if any
    security: undefined,
    defaultInputModes: ['text'],
    defaultOutputModes: ['text', 'task-status'], // task-status is a common output mode
    skills: [
        {
            id: 'general_tool_chat',
            name: 'General Tool Chat',
            description: 'Answer general questions or chat about tools.',
            tags: ['tools', 'web', 'app'],
            examples: [
                'Explain how the tools can be used.',
                'Explain all the tools that you have access to.',
                'Ask if they like to build a custom tool'
            ],
            inputModes: ['text'], // Explicitly defining for skill
            outputModes: ['text', 'task-status'] // Explicitly defining for skill
        }
    ],
    supportsAuthenticatedExtendedCard: false
}

// --- Server Setup ---
async function main() {
    // 1. Create TaskStore
    const taskStore: TaskStore = new InMemoryTaskStore()

    // 2. Create AgentExecutor
    const agentExecutor: AgentExecutor = new MyAgentExecutor()
    const toolExecutor: AgentExecutor = new ToolExecutor()

    //loop through workflowIds and set in record
    const requestHandler = new DefaultRequestHandler(movieAgentCard, taskStore, agentExecutor)

    const toolRequestHandler = new DefaultRequestHandler(toolAgentCard, taskStore, toolExecutor)

    const requestHandlers: RequestHandlers = {
        '3d239914-8d89-4697-99cb-dc5fa314f5e2': requestHandler,
        'c7042ede-96ab-4b5a-91c6-dd9570f45258': toolRequestHandler
    }

    const appBuilder = new A2AExpressApp(requestHandlers)
    const expressApp = appBuilder.setupRoutes(express())

    const PORT = process.env.CODER_AGENT_PORT || 3000 // Different port for coder agent
    expressApp.listen(PORT, () => {
        console.log(`[MyAgent] Server using new framework started on http://localhost:${PORT}`)
        /*console.log(
    `[MyAgent] Agent Card: http://localhost:${PORT}/.well-known/agent-card.json`
  );*/
        console.log('[MyAgent] Press Ctrl+C to stop the server')
    })
}

main().catch(console.error)
