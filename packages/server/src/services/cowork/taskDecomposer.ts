import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import { InternalTHubError } from '../../errors/internalTHubError'
import { getErrorMessage } from '../../errors/utils'
import 'dotenv/config'
import { ChatOpenAI, AzureChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatGroq } from '@langchain/groq'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import logger from '../../utils/logger'
import { TaskDAG, TaskNode } from './CoworkTypes'

// ── Zod schema — unchanged ────────────────────────────────────────────────────
const TaskNodeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    agentPersona: z.enum(['coder', 'researcher', 'analyst', 'reviewer', 'architect', 'writer']),
    dependencies: z.array(z.string()).default([]),
    outputSchema: z.string().optional(),
    status: z.enum(['pending', 'ready', 'running', 'completed', 'failed']).default('pending')
})

const TaskDAGSchema = z.object({
    goal: z.string(),
    tasks: z.array(TaskNodeSchema).min(1)
})

// ── System prompt — unchanged ─────────────────────────────────────────────────
const PLANNER_SYSTEM_PROMPT = `You are a task decomposition expert. Given a user goal, break it into a directed acyclic graph (DAG) of subtasks that can be executed by specialized AI agents.

Rules:
1. Each task must have a unique id (t1, t2, t3...)
2. dependencies[] lists task IDs that must complete before this task starts
3. No circular dependencies
4. agentPersona must be one of: coder, researcher, analyst, reviewer, architect, writer
5. Keep tasks focused — one clear deliverable per task
6. Maximum 10 tasks for any goal
7. The first task(s) must have empty dependencies[]

Output ONLY valid JSON matching this schema — no other text:
{
  "goal": "string",
  "tasks": [
    {
      "id": "t1",
      "name": "string",
      "description": "string",
      "agentPersona": "coder|researcher|analyst|reviewer|architect|writer",
      "dependencies": [],
      "outputSchema": "description of expected output format"
    }
  ]
}`

// ── Build LangChain model directly from selectedChatModel config ───────────────
// No Canvas. No component nodes. No queue dependency for decomposition.
const buildChatModel = (selectedChatModel: Record<string, any>) => {
    let { provider, modelName, temperature = 0 } = selectedChatModel

    // VERIFICATION LOG: See if the server is seeing your key
    const currentKey = process.env.ANTHROPIC_API_KEY || ''
    logger.info(`[cowork-decomposer]: API Key Check: "${currentKey.substring(0, 7)}..."`)

    // Map deprecated/incorrect model identifiers to current stable versions
    logger.info(`[cowork-decomposer]: Received modelName: "${modelName}" for provider: "${provider}"`)
    if (modelName === 'claude-3-5-sonnet-20241022') {
        logger.info(`[cowork-decomposer]: Mapping deprecated model to "claude-3-haiku-20240307"`)
        modelName = 'claude-3-haiku-20240307'
    }
    if (modelName === 'gemini-2.5-flash' || modelName === 'gemini-1.5-flash') {
        logger.info(`[cowork-decomposer]: Mapping to "gemini-2.5-flash"`)
        modelName = 'gemini-2.5-flash'
    }

    switch (provider?.toLowerCase()) {
        case 'openai':
            return new ChatOpenAI({
                model: modelName || 'gpt-4o',
                temperature,
                apiKey: process.env.OPENAI_APIKEY || process.env.OPENAI_API_KEY,
                openAIApiKey: process.env.OPENAI_APIKEY || process.env.OPENAI_API_KEY
            })
        case 'azure':
        case 'azureopenai':
            return new AzureChatOpenAI({
                azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
                azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
                azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
                azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
                temperature
            })
        case 'anthropic':
            return new ChatAnthropic({
                model: modelName || 'claude-3-haiku-20240307',
                temperature,
                apiKey: process.env.ANTHROPIC_API_KEY,
                anthropicApiKey: process.env.ANTHROPIC_API_KEY
            })
        case 'google':
        case 'googlegenerativeai':
            return new ChatGoogleGenerativeAI({
                model: modelName || 'gemini-2.5-flash',
                temperature,
                apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
            })
        case 'groq':
            return new ChatGroq({
                model: modelName || 'llama-3.1-70b-versatile',
                temperature,
                apiKey: process.env.GROQ_API_KEY
            })
        default:
            // Fall back to GPT-4o-mini — cheapest reliable option
            logger.warn(`[cowork-decomposer]: Unknown provider "${provider}", falling back to gpt-4o-mini`)
            return new ChatOpenAI({
                model: 'gpt-4o-mini',
                temperature: 0,
                apiKey: process.env.OPENAI_APIKEY || process.env.OPENAI_API_KEY,
                openAIApiKey: process.env.OPENAI_APIKEY || process.env.OPENAI_API_KEY
            })
    }
}

// ── decomposeGoal — direct LangChain call, no Canvas dependency ───────────────
export const decomposeGoal = async (goal: string, selectedChatModel: Record<string, any>): Promise<TaskDAG> => {
    try {
        const model = buildChatModel(selectedChatModel)

        const response = await model.invoke([new SystemMessage(PLANNER_SYSTEM_PROMPT), new HumanMessage(goal)])

        const rawText = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

        // Strip markdown code fences if LLM wraps response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error(`No valid JSON in LLM response. Got: ${rawText.slice(0, 200)}`)

        const parsed = JSON.parse(jsonMatch[0])
        const validated = TaskDAGSchema.parse(parsed)

        validateNoCycles(validated.tasks)

        logger.info(`[cowork-decomposer]: "${goal.slice(0, 50)}..." decomposed into ${validated.tasks.length} tasks`)
        return validated as TaskDAG
    } catch (error: any) {
        logger.error(`[cowork-decomposer]: Error during decomposition:`, error)
        const detailedMessage = error?.message || getErrorMessage(error)
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: taskDecomposer.decomposeGoal - ${detailedMessage}`)
    }
}

// ── getReadyTasks — unchanged ─────────────────────────────────────────────────
export const getReadyTasks = (tasks: TaskNode[]): TaskNode[] => {
    const completedIds = new Set(tasks.filter((t) => t.status === 'completed').map((t) => t.id))
    return tasks.filter((task) => task.status === 'pending' && task.dependencies.every((depId) => completedIds.has(depId)))
}

// ── buildDependencyMap — unchanged ────────────────────────────────────────────
export const buildDependencyMap = (tasks: TaskNode[]): Map<string, string[]> => {
    const map = new Map<string, string[]>()
    tasks.forEach((t) => {
        if (!map.has(t.id)) map.set(t.id, [])
        t.dependencies.forEach((depId) => {
            if (!map.has(depId)) map.set(depId, [])
            map.get(depId)!.push(t.id)
        })
    })
    return map
}

// ── validateNoCycles — unchanged ──────────────────────────────────────────────
const validateNoCycles = (tasks: TaskNode[]): void => {
    const visited = new Set<string>()
    const stack = new Set<string>()
    const taskMap = new Map(tasks.map((t) => [t.id, t]))

    const dfs = (id: string): void => {
        if (stack.has(id)) throw new Error(`Circular dependency detected involving task ${id}`)
        if (visited.has(id)) return
        stack.add(id)
        taskMap.get(id)?.dependencies.forEach((depId) => dfs(depId))
        stack.delete(id)
        visited.add(id)
    }
    tasks.forEach((t) => dfs(t.id))
}
