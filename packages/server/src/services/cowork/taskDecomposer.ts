import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import { InternalTHubError } from '../../errors/internalTHubError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { MODE } from '../../Interface'
import { databaseEntities } from '../../utils'
import logger from '../../utils/logger'
import { TaskDAG, TaskNode } from './CoworkTypes'

// ── Zod schema ──────────────────────────────────────
const TaskNodeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    agentPersona: z.enum(['coder', 'researcher', 'analyst', 'reviewer', 'architect', 'writer']),
    dependencies: z.array(z.string()).default([]),
    outputSchema: z.string().optional(),
    status: z.enum(['pending', 'completed']).default('pending')
})

const TaskDAGSchema = z.object({
    goal: z.string(),
    tasks: z.array(TaskNodeSchema).min(1)
})

// ── Prompt ──────────────────────────────────────────
const PLANNER_SYSTEM_PROMPT = `You are a task decomposition expert... (keep as-is from doc)`

// ── Main function ───────────────────────────────────
export const decomposeGoal = async (goal: string, selectedChatModel: Record<string, any>): Promise<TaskDAG> => {
    try {
        const appServer = getRunningExpressApp()
        const prompt = PLANNER_SYSTEM_PROMPT
        let response: any

        if (process.env.MODE === MODE.QUEUE) {
            const predictionQueue = appServer.queueManager.getQueue('prediction')
            const job = await predictionQueue.addJob({
                prompt,
                question: goal,
                toolNodes: {},
                selectedChatModel,
                isAgentFlowGenerator: true
            })
            const queueEvents = predictionQueue.getQueueEvents()
            response = await job.waitUntilFinished(queueEvents)
        } else {
            const { generateAgentflowv2 } = await import('thub-components')
            response = await generateAgentflowv2(
                { prompt, componentNodes: appServer.nodesPool.componentNodes, toolNodes: {}, selectedChatModel },
                goal,
                { appDataSource: appServer.AppDataSource, databaseEntities, logger }
            )
        }

        const rawText = typeof response === 'string' ? response : JSON.stringify(response)
        const jsonMatch = rawText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No valid JSON found in LLM response')

        const parsed = JSON.parse(jsonMatch[0])
        const validated = TaskDAGSchema.parse(parsed)

        validateNoCycles(validated.tasks)

        logger.info(`[cowork]: Goal decomposed into ${validated.tasks.length} tasks`)
        return validated as TaskDAG
    } catch (error) {
        if (error instanceof InternalTHubError) throw error
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: taskDecomposer.decomposeGoal - ${getErrorMessage(error)}`)
    }
}

// ── Helpers ─────────────────────────────────────────
export const getReadyTasks = (tasks: TaskNode[]): TaskNode[] => {
    const completedIds = new Set(tasks.filter((t) => t.status === 'completed').map((t) => t.id))
    return tasks.filter((task) => task.status === 'pending' && task.dependencies.every((depId) => completedIds.has(depId)))
}

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

const validateNoCycles = (tasks: TaskNode[]): void => {
    const visited = new Set<string>()
    const stack = new Set<string>()
    const taskMap = new Map(tasks.map((t) => [t.id, t]))

    const dfs = (id: string): void => {
        if (stack.has(id)) throw new Error(`Circular dependency detected involving task ${id}`)
        if (visited.has(id)) return
        stack.add(id)
        const task = taskMap.get(id)
        if (task) task.dependencies.forEach((depId) => dfs(depId))
        stack.delete(id)
        visited.add(id)
    }

    tasks.forEach((t) => dfs(t.id))
}
