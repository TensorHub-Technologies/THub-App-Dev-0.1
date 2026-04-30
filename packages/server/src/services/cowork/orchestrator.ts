import Redis from 'ioredis'
import { DataSource, Repository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { CoworkTaskStatus, CoworkSessionStatus } from './status'
import { CoworkSession } from '../../database/entities/CoworkSession'
import { CoworkTask } from '../../database/entities/CoworkTask'
import { User } from '../../database/entities/User'
import { InternalTHubError } from '../../errors/internalTHubError'
import logger from '../../utils/logger'
import { buildSystemPrompt } from './promptGenerator'
import { TaskDAG, TaskNode } from './CoworkTypes'

const SHARED_MEMORY_TTL_SECONDS = 7 * 24 * 60 * 60
const FREE_PLAN_MONTHLY_LIMIT = 3
const MAX_UNBLOCKED_TASKS_PER_TICK = 1

type SelectedChatModel = Record<string, any>

type RedisClientLike = {
    set(key: string, value: string, mode: 'EX', ttlSeconds: number): Promise<unknown>
    get(key: string): Promise<string | null>
    keys(pattern: string): Promise<string[]>
    del(...keys: string[]): Promise<number>
}

type QueueJob = { id?: string | number }

type CoworkQueueLike = {
    addJob(data: Record<string, any>): Promise<QueueJob>
}

type EventStreamerLike = {
    streamCustomEvent(chatId: string, eventType: string, data: any): void
}

type TaskExecutionResult = {
    content: string
    tokensUsed?: number
    costUsd?: number
    latencyMs?: number
    model?: string
    type?: 'text' | 'code' | 'markdown' | 'json'
}

type ExecuteWithAgentflowFn = (params: {
    task: CoworkTask
    systemPrompt: string
    question: string
    selectedChatModel: SelectedChatModel
}) => Promise<TaskExecutionResult>

type BuildPromptFn = (
    persona: string,
    taskName: string,
    taskDescription: string,
    inputContext: string,
    appDataSource: DataSource,
    targetModel?: string
) => Promise<string>

type DecomposeGoalFn = (goal: string, selectedChatModel: SelectedChatModel) => Promise<TaskDAG>

type OrchestratorDeps = {
    appDataSource?: DataSource
    redisClient?: RedisClientLike | null
    queue?: CoworkQueueLike
    eventStreamer?: EventStreamerLike
    executeWithAgentflow?: ExecuteWithAgentflowFn
    buildPrompt?: BuildPromptFn
    decomposeGoalFn?: DecomposeGoalFn
    now?: () => Date
}

type CreateCoworkSessionInput = {
    tenantId: string
    userId: string
    goal: string
    selectedChatModel: SelectedChatModel
    maxTokenBudget?: number | null
    maxCostBudget?: number | null
}

type CreateCoworkSessionResult = {
    session: CoworkSession
    tasks: CoworkTask[]
}

type SessionCompletionResult = {
    completed: boolean
    partial: boolean
    status: CoworkSessionStatus
}

let redisSingleton: RedisClientLike | null | undefined

const safeJsonParse = <T>(value: string | null | undefined, fallback: T): T => {
    if (!value) return fallback
    try {
        return JSON.parse(value) as T
    } catch {
        return fallback
    }
}

const toISOStringSafe = (date: Date | undefined): string => {
    if (!date || Number.isNaN(date.getTime())) return new Date().toISOString()
    return date.toISOString()
}

const getMonthBoundsUTC = (now: Date) => {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0))
    return { start, end }
}

const normalizeTaskOutputContent = (outputArtifact: string | null | undefined): string => {
    const parsed = safeJsonParse<Record<string, any>>(outputArtifact, {})
    if (typeof parsed?.content === 'string') return parsed.content
    return ''
}

const getSelectedModelName = (selectedChatModelRaw: string | null | undefined): string | undefined => {
    const parsed = safeJsonParse<Record<string, any>>(selectedChatModelRaw, {})
    return typeof parsed?.modelName === 'string' ? parsed.modelName : undefined
}

const getSelectedChatModelObject = (selectedChatModelRaw: string | null | undefined): Record<string, any> => {
    return safeJsonParse<Record<string, any>>(selectedChatModelRaw, {})
}

const resolvePlannerTaskId = (task: CoworkTask): string => {
    return task.skillId || task.id
}

const toDependencyIds = (task: CoworkTask): string[] => {
    const parsed = safeJsonParse<string[]>(task.dependencies, [])
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
}

const coercePersona = (persona: string | null | undefined): string => {
    if (!persona) return 'researcher'
    return persona
}

const buildSharedMemoryKey = (sessionId: string, key: string) => `cowork:${sessionId}:${key}`

const isTokenBudgetExceeded = (session: CoworkSession): boolean => {
    if (!session.maxTokenBudget || session.maxTokenBudget <= 0) return false
    return (session.totalTokensUsed || 0) >= session.maxTokenBudget
}

const nowUtc = () => new Date()

const getRunningApp = () => {
    const mod = require('../../utils/getRunningExpressApp') as typeof import('../../utils/getRunningExpressApp')
    return mod.getRunningExpressApp()
}

const defaultDecomposeGoalFn: DecomposeGoalFn = async (goal, selectedChatModel) => {
    const mod = await import('./taskDecomposer')
    return mod.decomposeGoal(goal, selectedChatModel)
}

const defaultExecuteWithAgentflow: ExecuteWithAgentflowFn = async ({ systemPrompt, question, selectedChatModel }) => {
    const { generateAgentflowv2 } = await import('thub-components')
    const { databaseEntities } = await import('../../utils')
    const appServer = getRunningApp()
    const response = await generateAgentflowv2(
        {
            prompt: systemPrompt,
            componentNodes: appServer.nodesPool.componentNodes,
            toolNodes: {},
            selectedChatModel
        },
        question,
        {
            appDataSource: appServer.AppDataSource,
            databaseEntities,
            logger
        }
    )

    const content = typeof response === 'string' ? response : JSON.stringify(response)

    return {
        type: 'markdown',
        content,
        model: selectedChatModel?.modelName
    }
}

const defaultEventStreamer = (): EventStreamerLike | null => {
    try {
        return getRunningApp().sseStreamer
    } catch {
        return null
    }
}

const defaultQueue = (): CoworkQueueLike | null => {
    try {
        const app = getRunningApp()
        return app.queueManager.getQueue('cowork') as unknown as CoworkQueueLike
    } catch {
        return null
    }
}

const defaultDataSource = (): DataSource => {
    return getRunningApp().AppDataSource
}

const defaultRedisClient = (): RedisClientLike | null => {
    if (redisSingleton !== undefined) return redisSingleton

    try {
        if (process.env.REDIS_URL) {
            redisSingleton = new Redis(process.env.REDIS_URL, {
                lazyConnect: true,
                maxRetriesPerRequest: 1
            }) as unknown as RedisClientLike
            return redisSingleton
        }

        redisSingleton = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            username: process.env.REDIS_USERNAME || undefined,
            password: process.env.REDIS_PASSWORD || undefined,
            tls:
                process.env.REDIS_TLS === 'true'
                    ? {
                          cert: process.env.REDIS_CERT ? Buffer.from(process.env.REDIS_CERT, 'base64') : undefined,
                          key: process.env.REDIS_KEY ? Buffer.from(process.env.REDIS_KEY, 'base64') : undefined,
                          ca: process.env.REDIS_CA ? Buffer.from(process.env.REDIS_CA, 'base64') : undefined
                      }
                    : undefined,
            lazyConnect: true,
            maxRetriesPerRequest: 1
        }) as unknown as RedisClientLike

        return redisSingleton
    } catch {
        redisSingleton = null
        return null
    }
}

const emitCoworkEvent = (eventStreamer: EventStreamerLike | null, sessionId: string, type: string, data: Record<string, any> = {}) => {
    if (!eventStreamer) return
    eventStreamer.streamCustomEvent(sessionId, type, {
        type,
        sessionId,
        ...data
    })
}

const sortTasksByCreated = (tasks: CoworkTask[]): CoworkTask[] => {
    return [...tasks].sort((a, b) => {
        const aTs = new Date(a.createdDate || 0).getTime()
        const bTs = new Date(b.createdDate || 0).getTime()
        if (aTs !== bTs) return aTs - bTs
        return String(a.id).localeCompare(String(b.id))
    })
}

export class CoworkOrchestratorService {
    private appDataSource: DataSource
    private redisClient: RedisClientLike | null
    private queue: CoworkQueueLike | null
    private eventStreamer: EventStreamerLike | null
    private executeWithAgentflow: ExecuteWithAgentflowFn
    private buildPromptFn: BuildPromptFn
    private decomposeGoalFn: DecomposeGoalFn
    private now: () => Date

    constructor(deps: OrchestratorDeps = {}) {
        this.appDataSource = deps.appDataSource || defaultDataSource()
        this.redisClient = deps.redisClient ?? defaultRedisClient()
        this.queue = deps.queue || defaultQueue()
        this.eventStreamer = deps.eventStreamer || defaultEventStreamer()
        this.executeWithAgentflow = deps.executeWithAgentflow || defaultExecuteWithAgentflow
        this.buildPromptFn = deps.buildPrompt || buildSystemPrompt
        this.decomposeGoalFn = deps.decomposeGoalFn || defaultDecomposeGoalFn
        this.now = deps.now || nowUtc
    }

    private getSessionRepo(): Repository<CoworkSession> {
        return this.appDataSource.getRepository(CoworkSession)
    }

    private getTaskRepo(): Repository<CoworkTask> {
        return this.appDataSource.getRepository(CoworkTask)
    }

    private getUserRepo(): Repository<User> {
        return this.appDataSource.getRepository(User)
    }

    private async enforceFreePlanLimit(userId: string): Promise<void> {
        const user = await this.getUserRepo().findOneBy({ uid: userId })
        const plan = String(user?.subscription_type || 'free').toLowerCase()
        if (plan !== 'free') return

        const { start, end } = getMonthBoundsUTC(this.now())
        const userSessions = await this.getSessionRepo().findBy({ userId })
        const sessionsThisMonth = userSessions.filter((session) => {
            const created = new Date(session.createdDate)
            return created >= start && created < end
        })

        if (sessionsThisMonth.length >= FREE_PLAN_MONTHLY_LIMIT) {
            throw new InternalTHubError(
                StatusCodes.PAYMENT_REQUIRED,
                `Free plan monthly session limit reached (${FREE_PLAN_MONTHLY_LIMIT}). Upgrade to continue.`
            )
        }
    }

    async createCoworkSession(input: CreateCoworkSessionInput): Promise<CreateCoworkSessionResult> {
        await this.enforceFreePlanLimit(input.userId)

        const dag = await this.decomposeGoalFn(input.goal, input.selectedChatModel)
        const sessionRepo = this.getSessionRepo()
        const taskRepo = this.getTaskRepo()

        const session = (await sessionRepo.save(
            sessionRepo.create({
                tenantId: input.tenantId,
                userId: input.userId,
                goal: dag.goal,
                status: CoworkSessionStatus.PENDING,
                selectedChatModel: JSON.stringify(input.selectedChatModel || {}),
                totalTokensUsed: 0,
                totalCostUsd: 0,
                maxTokenBudget: input.maxTokenBudget ?? null,
                maxCostBudget: input.maxCostBudget ?? null,
                completedDate: null as any
            } as Partial<CoworkSession>)
        )) as CoworkSession

        const tasksToCreate = dag.tasks.map((taskNode) => this.buildTaskEntityFromDagNode(taskNode, session.id))
        const savedTasks = await taskRepo.save(tasksToCreate)

        return {
            session,
            tasks: sortTasksByCreated(savedTasks)
        }
    }

    private buildTaskEntityFromDagNode(taskNode: TaskNode, sessionId: string): CoworkTask {
        // Note: skillId is used as planner task ID until dedicated column is introduced.
        return this.getTaskRepo().create({
            sessionId,
            name: taskNode.name,
            description: taskNode.description,
            agentPersona: taskNode.agentPersona,
            status: taskNode.dependencies.length > 0 ? CoworkTaskStatus.PENDING : CoworkTaskStatus.READY,
            dependencies: JSON.stringify(taskNode.dependencies || []),
            skillId: taskNode.id,
            retryCount: 0
        })
    }

    private async enqueueTask(task: CoworkTask, tenantId: string): Promise<CoworkTask> {
        if (!this.queue) {
            throw new InternalTHubError(StatusCodes.SERVICE_UNAVAILABLE, 'Cowork queue is not available')
        }

        const job = await this.queue.addJob({
            jobType: 'cowork-task',
            sessionId: task.sessionId,
            taskId: task.id,
            tenantId,
            payload: {
                plannerTaskId: resolvePlannerTaskId(task)
            }
        })

        task.status = CoworkTaskStatus.RUNNING
        task.startedDate = this.now()
        task.bullJobId = (job?.id != null ? String(job.id) : undefined) as any

        return task
    }

    async startCoworkSession(sessionId: string): Promise<void> {
        const sessionRepo = this.getSessionRepo()
        const taskRepo = this.getTaskRepo()

        const session = await sessionRepo.findOneBy({ id: sessionId })
        if (!session) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
        }

        const readyTasks = await taskRepo.findBy({ sessionId, status: CoworkTaskStatus.READY })
        const updatedTasks: CoworkTask[] = []

        for (const task of sortTasksByCreated(readyTasks)) {
            updatedTasks.push(await this.enqueueTask(task, session.tenantId))
        }

        if (updatedTasks.length > 0) {
            await taskRepo.save(updatedTasks)
        }

        session.status = CoworkSessionStatus.RUNNING
        await sessionRepo.save(session)

        emitCoworkEvent(this.eventStreamer, sessionId, 'cowork.session.started', {
            status: session.status,
            queuedTaskIds: updatedTasks.map((t) => t.id)
        })
    }

    async executeCoworkTask(sessionId: string, taskId: string): Promise<CoworkTask | null> {
        const sessionRepo = this.getSessionRepo()
        const taskRepo = this.getTaskRepo()

        const session = await sessionRepo.findOneBy({ id: sessionId })
        if (!session) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
        }

        const task = await taskRepo.findOneBy({ id: taskId, sessionId })
        if (!task) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork task ${taskId} not found`)
        }

        if (isTokenBudgetExceeded(session)) {
            await this.handleBudgetExceeded(session)
            return null
        }

        try {
            task.status = CoworkTaskStatus.RUNNING
            task.startedDate = task.startedDate || this.now()
            await taskRepo.save(task)

            emitCoworkEvent(this.eventStreamer, sessionId, 'cowork.task.started', {
                taskId: task.id,
                plannerTaskId: resolvePlannerTaskId(task),
                name: task.name
            })

            const inputContext = await this.buildTaskInputContext(task, sessionId)
            task.inputContext = inputContext

            const selectedChatModel = getSelectedChatModelObject(session.selectedChatModel)
            const systemPrompt = await this.buildPromptFn(
                coercePersona(task.agentPersona),
                task.name,
                task.description || '',
                inputContext,
                this.appDataSource,
                getSelectedModelName(session.selectedChatModel)
            )

            task.systemPrompt = systemPrompt

            const startMs = Date.now()
            const execution = await this.executeWithAgentflow({
                task,
                systemPrompt,
                question: task.description || task.name,
                selectedChatModel
            })
            const latencyMs = Date.now() - startMs

            const outputArtifact = {
                type: execution.type || 'markdown',
                content: execution.content,
                model: execution.model || selectedChatModel?.modelName,
                plannerTaskId: resolvePlannerTaskId(task)
            }

            task.outputArtifact = JSON.stringify(outputArtifact)
            task.status = CoworkTaskStatus.COMPLETED
            task.tokensUsed = execution.tokensUsed || 0
            task.costUsd = execution.costUsd || 0
            task.latencyMs = execution.latencyMs || latencyMs
            task.model = execution.model || selectedChatModel?.modelName || task.model
            task.completedDate = this.now()
            task.errorMessage = null as any

            session.totalTokensUsed = (session.totalTokensUsed || 0) + (task.tokensUsed || 0)
            session.totalCostUsd = (session.totalCostUsd || 0) + (task.costUsd || 0)

            await taskRepo.save(task)
            await sessionRepo.save(session)

            await this.setSharedMemory(sessionId, `task_output:${resolvePlannerTaskId(task)}`, execution.content)

            emitCoworkEvent(this.eventStreamer, sessionId, 'cowork.task.completed', {
                taskId: task.id,
                plannerTaskId: resolvePlannerTaskId(task),
                name: task.name,
                tokensUsed: task.tokensUsed,
                costUsd: task.costUsd,
                latencyMs: task.latencyMs
            })

            await this.queueUnblocked(sessionId)
            await this.checkCompletion(sessionId)

            return task
        } catch (error: any) {
            task.status = CoworkTaskStatus.FAILED
            task.errorMessage = error?.message || String(error)
            task.completedDate = this.now()
            await taskRepo.save(task)

            emitCoworkEvent(this.eventStreamer, sessionId, 'cowork.task.failed', {
                taskId: task.id,
                plannerTaskId: resolvePlannerTaskId(task),
                name: task.name,
                error: task.errorMessage
            })

            await this.checkCompletion(sessionId)
            throw error
        }
    }

    async queueUnblocked(sessionId: string): Promise<CoworkTask[]> {
        const sessionRepo = this.getSessionRepo()
        const taskRepo = this.getTaskRepo()

        const session = await sessionRepo.findOneBy({ id: sessionId })
        if (!session) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
        }

        if (isTokenBudgetExceeded(session)) {
            await this.handleBudgetExceeded(session)
            return []
        }

        const allTasks = sortTasksByCreated(await taskRepo.findBy({ sessionId }))
        const statusByPlannerId = new Map<string, CoworkTaskStatus>()
        allTasks.forEach((t) => statusByPlannerId.set(resolvePlannerTaskId(t), t.status))

        const unblockedPending = allTasks.filter((task) => {
            if (task.status !== CoworkTaskStatus.PENDING) return false
            const deps = toDependencyIds(task)
            return deps.every((depId) => statusByPlannerId.get(depId) === CoworkTaskStatus.COMPLETED)
        })

        const toQueue = unblockedPending.slice(0, MAX_UNBLOCKED_TASKS_PER_TICK)
        const queued: CoworkTask[] = []

        for (const task of toQueue) {
            queued.push(await this.enqueueTask(task, session.tenantId))
        }

        if (queued.length > 0) {
            await taskRepo.save(queued)
        }

        return queued
    }

    async checkCompletion(sessionId: string): Promise<SessionCompletionResult> {
        const sessionRepo = this.getSessionRepo()
        const taskRepo = this.getTaskRepo()

        const session = await sessionRepo.findOneBy({ id: sessionId })
        if (!session) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
        }

        const tasks = await taskRepo.findBy({ sessionId })
        const hasFailures = tasks.some((task) => task.status === CoworkTaskStatus.FAILED)
        const allCompleted = tasks.length > 0 && tasks.every((task) => task.status === CoworkTaskStatus.COMPLETED)

        if (allCompleted) {
            session.status = CoworkSessionStatus.COMPLETED
            session.completedDate = this.now()
            await sessionRepo.save(session)
            emitCoworkEvent(this.eventStreamer, sessionId, 'cowork.session.done', {
                status: CoworkSessionStatus.COMPLETED,
                completedDate: toISOStringSafe(session.completedDate)
            })
            return { completed: true, partial: false, status: CoworkSessionStatus.COMPLETED }
        }

        if (hasFailures || session.status === CoworkSessionStatus.PARTIAL) {
            session.status = CoworkSessionStatus.PARTIAL
            session.completedDate = this.now()
            await sessionRepo.save(session)
            emitCoworkEvent(this.eventStreamer, sessionId, 'cowork.session.done', {
                status: CoworkSessionStatus.PARTIAL,
                completedDate: toISOStringSafe(session.completedDate)
            })
            return { completed: false, partial: true, status: CoworkSessionStatus.PARTIAL }
        }

        return { completed: false, partial: false, status: session.status }
    }

    private async handleBudgetExceeded(session: CoworkSession): Promise<void> {
        if (session.status !== CoworkSessionStatus.PARTIAL) {
            session.status = CoworkSessionStatus.PARTIAL
            session.completedDate = this.now()
            await this.getSessionRepo().save(session)
        }

        emitCoworkEvent(this.eventStreamer, session.id, 'cowork.session.budget_exceeded', {
            status: session.status,
            maxTokenBudget: session.maxTokenBudget,
            totalTokensUsed: session.totalTokensUsed || 0
        })

        emitCoworkEvent(this.eventStreamer, session.id, 'cowork.session.done', {
            status: CoworkSessionStatus.PARTIAL,
            reason: 'budget_exceeded'
        })
    }

    private async buildTaskInputContext(task: CoworkTask, sessionId: string): Promise<string> {
        const dependencyIds = toDependencyIds(task)
        if (dependencyIds.length === 0) return ''

        const sections: string[] = []

        for (const depPlannerId of dependencyIds) {
            const content = await this.getSharedMemory(sessionId, `task_output:${depPlannerId}`)
            if (!content) continue
            sections.push(`## Output from ${depPlannerId}\n${content}`)
        }

        return sections.join('\n\n')
    }

    async setSharedMemory(sessionId: string, key: string, value: unknown): Promise<void> {
        if (!this.redisClient) return
        const redisKey = buildSharedMemoryKey(sessionId, key)
        await this.redisClient.set(redisKey, JSON.stringify(value), 'EX', SHARED_MEMORY_TTL_SECONDS)
    }

    async getSharedMemory(sessionId: string, key: string): Promise<string | null> {
        const redisKey = buildSharedMemoryKey(sessionId, key)

        if (this.redisClient) {
            const cached = await this.redisClient.get(redisKey)
            if (cached !== null) {
                const parsed = safeJsonParse<any>(cached, cached)
                if (typeof parsed === 'string') return parsed
                return JSON.stringify(parsed)
            }
        }

        if (key.startsWith('task_output:')) {
            const plannerTaskId = key.replace('task_output:', '')
            const task = await this.getTaskRepo().findOne({
                where: [
                    { sessionId, skillId: plannerTaskId },
                    { sessionId, id: plannerTaskId },
                    { sessionId, name: plannerTaskId }
                ]
            })

            if (task?.outputArtifact) {
                const content = normalizeTaskOutputContent(task.outputArtifact)
                return content || null
            }
        }

        return null
    }

    async cleanupSessionMemory(sessionId: string): Promise<void> {
        if (!this.redisClient) return
        const keys = await this.redisClient.keys(buildSharedMemoryKey(sessionId, '*'))
        if (!keys.length) return
        await this.redisClient.del(...keys)
    }
}

export const createCoworkOrchestrator = (deps: OrchestratorDeps = {}) => new CoworkOrchestratorService(deps)

export default {
    createCoworkOrchestrator,
    CoworkOrchestratorService
}
