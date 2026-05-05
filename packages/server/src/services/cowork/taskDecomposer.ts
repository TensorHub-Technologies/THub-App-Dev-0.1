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
    id:           z.string(),
    name:         z.string(),
    description:  z.string(),
    agentPersona: z.enum(['coder', 'researcher', 'analyst', 'reviewer', 'architect', 'writer']),
    dependencies: z.array(z.string()).default([]),
    outputSchema: z.string().optional(),
    status:       z.enum(['pending','ready','running','completed','failed','skipped']).default('pending'),
})

const TaskDAGSchema = z.object({
    goal:  z.string(),
    tasks: z.array(TaskNodeSchema).min(1),
})

// ── Prompt ──────────────────────────────────────────
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


// ── Main function ───────────────────────────────────
export const decomposeGoal = async (

    goal: string,

    selectedChatModel: Record<string, any>

): Promise<TaskDAG> => {

    try {
        const appServer = getRunningExpressApp()
        const prompt = PLANNER_SYSTEM_PROMPT
        let response: any
        if (process.env.MODE === MODE.QUEUE) {
            // Reuse the existing prediction queue — same pattern as agentflowv2-generator
            const predictionQueue = appServer.queueManager.getQueue('prediction')
            const job = await predictionQueue.addJob({
                prompt,
                question: goal,
                toolNodes: {},
                selectedChatModel,
                isAgentFlowGenerator: true, // reuses PredictionQueue's generator path
            })
            const queueEvents = predictionQueue.getQueueEvents()
            response = await job.waitUntilFinished(queueEvents)
        } else {

            // Direct execution for non-queue mode
            const { generateAgentflowv2 } = await import('thub-components')
            response = await generateAgentflowv2(
                { prompt, componentNodes: appServer.nodesPool.componentNodes, toolNodes: {}, selectedChatModel },
                goal,
                { appDataSource: appServer.AppDataSource, databaseEntities, logger }
            )
        }

        // Parse and validate
        const rawText = typeof response === 'string' ? response : JSON.stringify(response)

        // Extract JSON from response (LLM sometimes wraps in markdown)
        const jsonMatch = rawText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No valid JSON found in LLM response')
        const parsed = JSON.parse(jsonMatch[0])
        const validated = TaskDAGSchema.parse(parsed) as TaskDAG

        // Validate no circular deps
        validateNoCycles(validated.tasks)
        logger.info(`[cowork]: Goal decomposed into ${validated.tasks.length} tasks`)
        return validated as TaskDAG

    } catch (error) {
        if (error instanceof InternalTHubError) throw error
        throw new InternalTHubError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: taskDecomposer.decomposeGoal - ${getErrorMessage(error)}`
        )
    }
}

// ── Dependency resolution (Ticket 1.3) ───────────────────────────────────────
export const getReadyTasks = (tasks: TaskNode[]): TaskNode[] => {
    const completedIds = new Set(
        tasks.filter(t => t.status === 'completed').map(t => t.id)
    )

    return tasks.filter(task =>
        task.status === 'pending' &&
        task.dependencies.every(depId => completedIds.has(depId))
    )
}

export const buildDependencyMap = (tasks: TaskNode[]): Map<string, string[]> => {
    // Returns a map of taskId -> [taskIds that depend on it]
    const map = new Map<string, string[]>()
    tasks.forEach(t => {
        if (!map.has(t.id)) map.set(t.id, [])
        t.dependencies.forEach(depId => {
            if (!map.has(depId)) map.set(depId, [])
            map.get(depId)!.push(t.id)
        })
    })
    return map
}

 

// ── Cycle detection (Ticket 1.4 support) ─────────────────────────────────────

 

const validateNoCycles = (tasks: TaskNode[]): void => {
    const visited = new Set<string>()
    const stack = new Set<string>()
    const taskMap = new Map(tasks.map(t => [t.id, t]))

    const dfs = (id: string): void => {
        if (stack.has(id)) throw new Error(`Circular dependency detected involving task ${id}`)
        if (visited.has(id)) return
        stack.add(id)
        const task = taskMap.get(id)
        if (task) {
            task.dependencies.forEach(depId => dfs(depId))
        }
        stack.delete(id)
        visited.add(id)
    }
    tasks.forEach(t => dfs(t.id))
}
