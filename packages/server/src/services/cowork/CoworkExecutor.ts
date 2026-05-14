import { StatusCodes } from 'http-status-codes'
import { DataSource, Repository } from 'typeorm'
import { buildSystemPrompt } from './promptGenerator'
import { TaskDAG, TaskNode, SUBSCRIPTION_LIMITS } from './CoworkTypes'
import { CoworkSessionStatus, CoworkTaskStatus } from './status'
import { CoworkSession } from '../../database/entities/CoworkSession'
import { CoworkTask } from '../../database/entities/CoworkTask'
import { User } from '../../database/entities/User'
import { InternalTHubError } from '../../errors/internalTHubError'
import logger from '../../utils/logger'
import { CoworkContextManager, RedisClientLike } from './CoworkContextManager'
import { recordModelFailure, RoutingStrategy, RoutedModelSelection, selectModel } from './ModelRouter'

type SelectedChatModel = Record<string, any>

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

type CoworkExecutorDeps = {
    appDataSource?: DataSource
    redisClient?: RedisClientLike | null
    contextManager?: CoworkContextManager
    queue?: CoworkQueueLike
    eventStreamer?: EventStreamerLike
    executeWithAgentflow?: ExecuteWithAgentflowFn
    buildPrompt?: BuildPromptFn
    decomposeGoalFn?: DecomposeGoalFn
    now?: () => Date
    maxContextChars?: number
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

type ExecuteAttemptResult = {
    execution: TaskExecutionResult
    latencyMs: number
    selectedModelName: string
}

const DEFAULT_MAX_CONTEXT_CHARS = process.env.COWORK_MAX_CONTEXT_CHARS ? Number.parseInt(process.env.COWORK_MAX_CONTEXT_CHARS, 10) : 20000

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

const nowUtc = () => new Date()

const getMonthBoundsUTC = (now: Date) => {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0))
    return { start, end }
}

const sortTasksByCreated = (tasks: CoworkTask[]): CoworkTask[] => {
    return [...tasks].sort((a, b) => {
        const aTs = new Date(a.createdDate || 0).getTime()
        const bTs = new Date(b.createdDate || 0).getTime()
        if (aTs !== bTs) return aTs - bTs
        return String(a.id).localeCompare(String(b.id))
    })
}

const coercePersona = (persona: string | null | undefined): string => {
    if (!persona) return 'researcher'
    return persona
}

const getSelectedChatModelObject = (selectedChatModelRaw: string | null | undefined): Record<string, any> => {
    return safeJsonParse<Record<string, any>>(selectedChatModelRaw, {})
}

const toRoutingStrategy = (value: unknown): RoutingStrategy => {
    switch (value) {
        case 'cost_optimized':
        case 'latency_optimized':
        case 'local_first':
        case 'balanced':
            return value
        default:
            return 'balanced'
    }
}

const getRoutingStrategy = (sessionConfig: Record<string, any>): RoutingStrategy => {
    const strategy =
        (typeof sessionConfig?.routingStrategy === 'string' && sessionConfig.routingStrategy) ||
        (typeof sessionConfig?.config?.routingStrategy === 'string' && sessionConfig.config.routingStrategy) ||
        undefined
    return toRoutingStrategy(strategy)
}

const applyRoutedModelToSessionConfig = (sessionConfig: Record<string, any>, routedModel: RoutedModelSelection): SelectedChatModel => {
    const merged: SelectedChatModel = { ...sessionConfig }
    merged.provider = routedModel.provider
    merged.modelName = routedModel.modelName

    if (typeof routedModel.apiBase === 'string') {
        merged.apiBase = routedModel.apiBase
    }
    if (typeof routedModel.temperature === 'number') {
        merged.temperature = routedModel.temperature
    }
    if (typeof routedModel.maxTokens === 'number') {
        merged.maxTokens = routedModel.maxTokens
    }

    return merged
}

const parseDependencyIds = (task: CoworkTask): string[] => {
    const parsed = safeJsonParse<string[]>(task.dependencies, [])
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => typeof item === 'string')
}

const normalizeTaskOutputContent = (outputArtifact: string | null | undefined): string => {
    const parsed = safeJsonParse<Record<string, any>>(outputArtifact, {})
    if (typeof parsed?.content === 'string') return parsed.content
    return ''
}

const resolvePlannerTaskId = (task: CoworkTask): string => {
    return task.skillId || task.id
}

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

const emitCoworkEvent = (eventStreamer: EventStreamerLike | null, sessionId: string, type: string, data: Record<string, any> = {}) => {
    if (!eventStreamer) return
    eventStreamer.streamCustomEvent(sessionId, type, {
        type,
        sessionId,
        ...data
    })
}

const isTerminalTaskStatus = (status: CoworkTaskStatus) => {
    return status === CoworkTaskStatus.COMPLETED || status === CoworkTaskStatus.FAILED || status === CoworkTaskStatus.SKIPPED
}

const isTaskRunningLike = (status: CoworkTaskStatus) => {
    return status === CoworkTaskStatus.RUNNING || status === CoworkTaskStatus.PENDING || status === CoworkTaskStatus.READY
}

const truncateText = (value: string, maxChars: number): string => {
    if (!maxChars || maxChars <= 0) return value
    if (value.length <= maxChars) return value
    const head = value.slice(0, Math.max(0, maxChars - 64))
    return `${head}\n\n[Truncated for context size limit]`
}

const getPlanLimit = (planRaw: string | null | undefined): { sessionsPerMonth: number; maxTasksPerSession: number } => {
    const plan = String(planRaw || 'free').toLowerCase()
    if (SUBSCRIPTION_LIMITS[plan]) return SUBSCRIPTION_LIMITS[plan]
    return SUBSCRIPTION_LIMITS.free
}

const limitDagTasks = (dag: TaskDAG, maxTasksPerSession: number): TaskNode[] => {
    if (!Number.isFinite(maxTasksPerSession) || maxTasksPerSession <= 0) return []
    if (dag.tasks.length <= maxTasksPerSession) return dag.tasks

    const selected = dag.tasks.slice(0, maxTasksPerSession)
    const selectedIds = new Set(selected.map((task) => task.id))
    const pruned = selected.filter((task) => task.dependencies.every((depId) => selectedIds.has(depId)))
    if (pruned.length === maxTasksPerSession) {
        return pruned.map((task) => ({
            ...task,
            dependencies: task.dependencies.filter((depId) => selectedIds.has(depId))
        }))
    }

    const retainedIds = new Set(pruned.map((task) => task.id))
    const result = [...pruned]
    for (const task of dag.tasks) {
        if (result.length >= maxTasksPerSession) break
        if (retainedIds.has(task.id)) continue
        const canInclude = task.dependencies.every((depId) => retainedIds.has(depId))
        if (!canInclude) continue
        retainedIds.add(task.id)
        result.push(task)
    }

    return result.map((task) => ({
        ...task,
        dependencies: task.dependencies.filter((depId) => retainedIds.has(depId))
    }))
}

type CheckCompletionDeps = {
    sessionRepo: Repository<CoworkSession>
    taskRepo: Repository<CoworkTask>
    eventStreamer: EventStreamerLike | null
    now: () => Date
}

export const checkCompletion = async (
    sessionId: string,
    { sessionRepo, taskRepo, eventStreamer, now }: CheckCompletionDeps
): Promise<SessionCompletionResult> => {
    const session = await sessionRepo.findOneBy({ id: sessionId })
    if (!session) {
        throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
    }

    const tasks = await taskRepo.findBy({ sessionId })
    if (tasks.length === 0) {
        return {
            completed: false,
            partial: false,
            status: session.status
        }
    }

    const allCompleted = tasks.every((task) => task.status === CoworkTaskStatus.COMPLETED)
    if (allCompleted) {
        if (session.status !== CoworkSessionStatus.COMPLETED || !session.completedDate) {
            session.status = CoworkSessionStatus.COMPLETED
            session.completedDate = now()
            await sessionRepo.save(session)
            emitCoworkEvent(eventStreamer, sessionId, 'cowork.session.done', {
                status: CoworkSessionStatus.COMPLETED,
                completedDate: toISOStringSafe(session.completedDate)
            })
        }

        return {
            completed: true,
            partial: false,
            status: CoworkSessionStatus.COMPLETED
        }
    }

    const hasFailures = tasks.some((task) => task.status === CoworkTaskStatus.FAILED)
    const hasSkipped = tasks.some((task) => task.status === CoworkTaskStatus.SKIPPED)
    const allTerminal = tasks.every((task) => isTerminalTaskStatus(task.status))

    if (hasFailures || (hasSkipped && allTerminal) || session.status === CoworkSessionStatus.PARTIAL) {
        if (session.status !== CoworkSessionStatus.PARTIAL || !session.completedDate) {
            session.status = CoworkSessionStatus.PARTIAL
            session.completedDate = now()
            await sessionRepo.save(session)
            emitCoworkEvent(eventStreamer, sessionId, 'cowork.session.done', {
                status: CoworkSessionStatus.PARTIAL,
                completedDate: toISOStringSafe(session.completedDate)
            })
        }

        return {
            completed: false,
            partial: true,
            status: CoworkSessionStatus.PARTIAL
        }
    }

    return {
        completed: false,
        partial: false,
        status: session.status
    }
}

export class CoworkExecutor {
    private appDataSource: DataSource
    private queue: CoworkQueueLike | null
    private eventStreamer: EventStreamerLike | null
    private executeWithAgentflow: ExecuteWithAgentflowFn
    private buildPromptFn: BuildPromptFn
    private decomposeGoalFn: DecomposeGoalFn
    private contextManager: CoworkContextManager
    private now: () => Date
    private maxContextChars: number

    constructor(deps: CoworkExecutorDeps = {}) {
        this.appDataSource = deps.appDataSource || defaultDataSource()
        this.queue = deps.queue || defaultQueue()
        this.eventStreamer = deps.eventStreamer || defaultEventStreamer()
        this.executeWithAgentflow = deps.executeWithAgentflow || defaultExecuteWithAgentflow
        this.buildPromptFn = deps.buildPrompt || buildSystemPrompt
        this.decomposeGoalFn = deps.decomposeGoalFn || defaultDecomposeGoalFn
        this.contextManager = deps.contextManager || new CoworkContextManager({ redisClient: deps.redisClient })
        this.now = deps.now || nowUtc
        this.maxContextChars = deps.maxContextChars || DEFAULT_MAX_CONTEXT_CHARS
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

    private isExecutionBudgetExceeded(session: CoworkSession): boolean {
        if (session.maxTokenBudget && session.maxTokenBudget > 0 && (session.totalTokensUsed || 0) >= session.maxTokenBudget) {
            return true
        }

        if (session.maxCostBudget && session.maxCostBudget > 0 && (session.totalCostUsd || 0) >= session.maxCostBudget) {
            return true
        }

        return false
    }

    private async enforcePlanLimits(userId: string): Promise<{ plan: string; maxTasksPerSession: number }> {
        const user = await this.getUserRepo().findOneBy({ uid: userId })
        const plan = String(user?.subscription_type || 'free').toLowerCase()
        const planLimit = getPlanLimit(plan)

        if (Number.isFinite(planLimit.sessionsPerMonth)) {
            const { start, end } = getMonthBoundsUTC(this.now())
            const sessions = await this.getSessionRepo().findBy({ userId })
            const sessionsThisMonth = sessions.filter((session) => {
                const created = new Date(session.createdDate)
                return created >= start && created < end
            })

            if (sessionsThisMonth.length >= planLimit.sessionsPerMonth) {
                throw new InternalTHubError(
                    StatusCodes.PAYMENT_REQUIRED,
                    `Free plan monthly session limit reached (${planLimit.sessionsPerMonth}). Upgrade to continue.`
                )
            }
        }

        return {
            plan,
            maxTasksPerSession: planLimit.maxTasksPerSession
        }
    }

    private buildTaskEntityFromDagNode(taskNode: TaskNode, sessionId: string): CoworkTask {
        return this.getTaskRepo().create({
            sessionId,
            name: taskNode.name,
            description: taskNode.description,
            agentPersona: taskNode.agentPersona,
            status: taskNode.dependencies.length > 0 ? CoworkTaskStatus.PENDING : CoworkTaskStatus.READY,
            dependencies: JSON.stringify(taskNode.dependencies || []),
            skillId: taskNode.id,
            retryCount: 0,
            humanInputRequired: false
        })
    }

    async createCoworkSession(input: CreateCoworkSessionInput): Promise<CreateCoworkSessionResult> {
        const { maxTasksPerSession } = await this.enforcePlanLimits(input.userId)
        const dag = await this.decomposeGoalFn(input.goal, input.selectedChatModel)
        const limitedTasks = limitDagTasks(dag, maxTasksPerSession)

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

        const tasksToCreate = limitedTasks.map((taskNode) => this.buildTaskEntityFromDagNode(taskNode, session.id))
        const savedTasks = await taskRepo.save(tasksToCreate)

        return {
            session,
            tasks: sortTasksByCreated(savedTasks)
        }
    }

    private async claimTaskForQueue(taskId: string, fromStatuses: CoworkTaskStatus[]): Promise<boolean> {
        const taskRepo = this.getTaskRepo() as Repository<CoworkTask> & {
            createQueryBuilder?: Repository<CoworkTask>['createQueryBuilder']
        }

        if (typeof taskRepo.createQueryBuilder === 'function') {
            const updateResult = await taskRepo
                .createQueryBuilder()
                .update(CoworkTask)
                .set({
                    status: CoworkTaskStatus.RUNNING,
                    startedDate: this.now(),
                    completedDate: null as any
                })
                .where('id = :taskId', { taskId })
                .andWhere('status IN (:...statuses)', { statuses: fromStatuses })
                .execute()

            return (updateResult.affected || 0) > 0
        }

        const task = await taskRepo.findOneBy({ id: taskId })
        if (!task || !fromStatuses.includes(task.status)) return false
        task.status = CoworkTaskStatus.RUNNING
        task.startedDate = this.now()
        task.completedDate = null as any
        await taskRepo.save(task)
        return true
    }

    private async patchTaskById(taskId: string, patch: Partial<CoworkTask>): Promise<void> {
        const taskRepo = this.getTaskRepo() as Repository<CoworkTask> & {
            update?: Repository<CoworkTask>['update']
        }

        if (typeof taskRepo.update === 'function') {
            await taskRepo.update({ id: taskId }, patch)
            return
        }

        const task = await taskRepo.findOneBy({ id: taskId })
        if (!task) return
        Object.assign(task, patch)
        await taskRepo.save(task)
    }

    private async queueTask(
        task: CoworkTask,
        tenantId: string,
        fromStatuses: CoworkTaskStatus[],
        fallbackStatus: CoworkTaskStatus
    ): Promise<CoworkTask | null> {
        if (!this.queue) {
            throw new InternalTHubError(StatusCodes.SERVICE_UNAVAILABLE, 'Cowork queue is not available')
        }

        const claimed = await this.claimTaskForQueue(task.id, fromStatuses)
        if (!claimed) return null

        try {
            const job = await this.queue.addJob({
                jobType: 'cowork-task',
                sessionId: task.sessionId,
                taskId: task.id,
                tenantId,
                payload: {
                    plannerTaskId: resolvePlannerTaskId(task)
                }
            })

            await this.patchTaskById(task.id, {
                bullJobId: job?.id != null ? String(job.id) : task.bullJobId
            })

            const queuedTask = await this.getTaskRepo().findOneBy({ id: task.id })
            if (!queuedTask) return null

            emitCoworkEvent(this.eventStreamer, task.sessionId, 'cowork.task.started', {
                taskId: queuedTask.id,
                plannerTaskId: resolvePlannerTaskId(queuedTask),
                name: queuedTask.name
            })

            return queuedTask
        } catch (error: any) {
            await this.patchTaskById(task.id, {
                status: fallbackStatus,
                errorMessage: error?.message || String(error)
            })
            throw error
        }
    }

    private async executeTaskWithModelFallback(
        task: CoworkTask,
        systemPrompt: string,
        question: string,
        sessionConfig: Record<string, any>,
        selectedModel: RoutedModelSelection,
        fallbackChain: RoutedModelSelection[]
    ): Promise<ExecuteAttemptResult> {
        const modelAttempts = [selectedModel, ...fallbackChain]

        for (let index = 0; index < modelAttempts.length; index += 1) {
            const candidate = modelAttempts[index]
            const routedChatModel = applyRoutedModelToSessionConfig(sessionConfig, candidate)

            try {
                const startedAt = Date.now()
                const execution = await this.executeWithAgentflow({
                    task,
                    systemPrompt,
                    question,
                    selectedChatModel: routedChatModel
                })
                const latencyMs = Date.now() - startedAt

                if (index > 0) {
                    logger.info(`[model-router]: fallback success model=${candidate.modelName}`)
                }

                return {
                    execution,
                    latencyMs,
                    selectedModelName: candidate.modelName
                }
            } catch (error) {
                try {
                    await recordModelFailure(candidate.modelName, this.appDataSource)
                } catch (recordError) {
                    logger.warn(`[model-router]: failed to record failure model=${candidate.modelName} error=${String(recordError)}`)
                }

                const nextCandidate = modelAttempts[index + 1]
                if (nextCandidate) {
                    logger.warn(`[model-router]: model=${candidate.modelName} failed, trying fallback=${nextCandidate.modelName}`)
                    continue
                }

                logger.error('[model-router]: all fallback models failed')
                throw new Error('All models in fallback chain failed')
            }
        }

        logger.error('[model-router]: all fallback models failed')
        throw new Error('All models in fallback chain failed')
    }

    async startCoworkSession(sessionId: string): Promise<void> {
        const sessionRepo = this.getSessionRepo()
        const taskRepo = this.getTaskRepo()

        const session = await sessionRepo.findOneBy({ id: sessionId })
        if (!session) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
        }
        if (session.status === CoworkSessionStatus.RUNNING) {
            throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'Session is already running')
        }

        session.status = CoworkSessionStatus.RUNNING
        session.completedDate = null as any
        await sessionRepo.save(session)

        const readyTasks = sortTasksByCreated(await taskRepo.findBy({ sessionId, status: CoworkTaskStatus.READY }))
        const queuedTaskIds: string[] = []

        for (const task of readyTasks) {
            const queuedTask = await this.queueTask(task, session.tenantId, [CoworkTaskStatus.READY], CoworkTaskStatus.READY)
            if (queuedTask) queuedTaskIds.push(queuedTask.id)
        }

        emitCoworkEvent(this.eventStreamer, sessionId, 'cowork.session.started', {
            status: session.status,
            queuedTaskIds
        })
    }

    async executeCoworkTask(sessionId: string, taskId: string): Promise<CoworkTask | null> {
        const sessionRepo = this.getSessionRepo()
        const taskRepo = this.getTaskRepo()

        const session = await sessionRepo.findOneBy({ id: sessionId })
        if (!session) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
        }
        if (session.status === CoworkSessionStatus.CANCELLED || session.status === CoworkSessionStatus.COMPLETED) {
            return null
        }

        const task = await taskRepo.findOneBy({ id: taskId, sessionId })
        if (!task) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork task ${taskId} not found`)
        }
        if (task.status === CoworkTaskStatus.COMPLETED || task.status === CoworkTaskStatus.SKIPPED) {
            return task
        }
        if (task.humanInputRequired) {
            return task
        }

        if (this.isExecutionBudgetExceeded(session)) {
            await this.handleBudgetExceeded(session)
            return null
        }

        try {
            if (task.status !== CoworkTaskStatus.RUNNING) {
                task.status = CoworkTaskStatus.RUNNING
                task.startedDate = task.startedDate || this.now()
                await taskRepo.save(task)
            }

            const inputContext = await this.buildTaskContext(task, sessionId)
            task.inputContext = inputContext

            const sessionConfig = getSelectedChatModelObject(session.selectedChatModel)
            const routingStrategy = getRoutingStrategy(sessionConfig)
            const { selectedModel, fallbackChain } = await selectModel({
                routingStrategy,
                sessionConfig,
                appDataSource: this.appDataSource
            })
            logger.info(`[model-router]: strategy=${routingStrategy} selected=${selectedModel.modelName}`)

            const systemPrompt = await this.buildPromptFn(
                coercePersona(task.agentPersona),
                task.name,
                task.description || '',
                inputContext,
                this.appDataSource,
                selectedModel.modelName
            )
            task.systemPrompt = systemPrompt

            const { execution, latencyMs, selectedModelName } = await this.executeTaskWithModelFallback(
                task,
                systemPrompt,
                task.description || task.name,
                sessionConfig,
                selectedModel,
                fallbackChain
            )

            const outputContent = typeof execution.content === 'string' ? execution.content : JSON.stringify(execution.content)
            const outputArtifact = {
                type: execution.type || 'markdown',
                content: outputContent,
                model: execution.model || selectedModelName,
                plannerTaskId: resolvePlannerTaskId(task)
            }

            task.outputArtifact = JSON.stringify(outputArtifact)
            task.status = CoworkTaskStatus.COMPLETED
            task.tokensUsed = execution.tokensUsed || 0
            task.costUsd = execution.costUsd || 0
            task.latencyMs = execution.latencyMs || latencyMs
            task.model = execution.model || selectedModelName || task.model
            task.completedDate = this.now()
            task.errorMessage = null as any

            session.totalTokensUsed = (session.totalTokensUsed || 0) + (task.tokensUsed || 0)
            session.totalCostUsd = (session.totalCostUsd || 0) + (task.costUsd || 0)

            await taskRepo.save(task)
            await sessionRepo.save(session)

            await this.setSharedMemory(sessionId, `task:${task.id}:output`, outputContent)
            await this.setSharedMemory(sessionId, `task_output:${resolvePlannerTaskId(task)}`, outputContent)

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

    private async getTaskOutputForContext(sessionId: string, dependencyTask: CoworkTask): Promise<string | null> {
        const fromRedis = await this.getSharedMemory(sessionId, `task:${dependencyTask.id}:output`)
        if (fromRedis) return fromRedis

        const fromLegacyRedis = await this.getSharedMemory(sessionId, `task_output:${resolvePlannerTaskId(dependencyTask)}`)
        if (fromLegacyRedis) return fromLegacyRedis

        if (dependencyTask.outputArtifact) {
            const content = normalizeTaskOutputContent(dependencyTask.outputArtifact)
            if (content) return content
        }

        return null
    }

    async buildTaskContext(task: CoworkTask, sessionId: string): Promise<string> {
        const dependencyIds = parseDependencyIds(task)
        if (dependencyIds.length === 0) return ''

        const tasks = await this.getTaskRepo().findBy({ sessionId })
        const taskByPlannerId = new Map<string, CoworkTask>()
        const taskById = new Map<string, CoworkTask>()
        for (const item of tasks) {
            taskById.set(item.id, item)
            taskByPlannerId.set(resolvePlannerTaskId(item), item)
        }

        const sections: string[] = []
        for (const depId of dependencyIds) {
            const dependencyTask = taskByPlannerId.get(depId) || taskById.get(depId)
            if (!dependencyTask) continue
            const content = await this.getTaskOutputForContext(sessionId, dependencyTask)
            if (!content) continue
            sections.push(`## Output from task ${dependencyTask.id}\n${content}`)
        }

        return truncateText(sections.join('\n\n'), this.maxContextChars)
    }

    async queueUnblocked(sessionId: string): Promise<CoworkTask[]> {
        const session = await this.getSessionRepo().findOneBy({ id: sessionId })
        if (!session) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
        }
        if (session.status === CoworkSessionStatus.CANCELLED || session.status === CoworkSessionStatus.COMPLETED) {
            return []
        }

        if (this.isExecutionBudgetExceeded(session)) {
            await this.handleBudgetExceeded(session)
            return []
        }

        const tasks = sortTasksByCreated(await this.getTaskRepo().findBy({ sessionId }))
        const statusById = new Map<string, CoworkTaskStatus>()
        const statusByPlannerId = new Map<string, CoworkTaskStatus>()
        tasks.forEach((task) => {
            statusById.set(task.id, task.status)
            statusByPlannerId.set(resolvePlannerTaskId(task), task.status)
        })

        const unblocked = tasks.filter((task) => {
            if (task.status !== CoworkTaskStatus.PENDING) return false
            const dependencyIds = parseDependencyIds(task)
            return dependencyIds.every((depId) => {
                const status = statusByPlannerId.get(depId) || statusById.get(depId)
                return status === CoworkTaskStatus.COMPLETED
            })
        })

        const queued: CoworkTask[] = []
        for (const task of unblocked) {
            const queuedTask = await this.queueTask(task, session.tenantId, [CoworkTaskStatus.PENDING], CoworkTaskStatus.PENDING)
            if (queuedTask) queued.push(queuedTask)
        }

        return queued
    }

    async checkCompletion(sessionId: string): Promise<SessionCompletionResult> {
        return checkCompletion(sessionId, {
            sessionRepo: this.getSessionRepo(),
            taskRepo: this.getTaskRepo(),
            eventStreamer: this.eventStreamer,
            now: this.now
        })
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
            totalTokensUsed: session.totalTokensUsed || 0,
            maxCostBudget: session.maxCostBudget,
            totalCostUsd: session.totalCostUsd || 0
        })

        emitCoworkEvent(this.eventStreamer, session.id, 'cowork.session.done', {
            status: CoworkSessionStatus.PARTIAL,
            reason: 'budget_exceeded'
        })
    }

    async retryCoworkTask(sessionId: string, taskId: string, tenantId?: string): Promise<CoworkTask> {
        const session = await this.getSessionRepo().findOneBy({ id: sessionId })
        if (!session) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
        }
        if (tenantId && session.tenantId !== tenantId) {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Forbidden: session does not belong to the authenticated tenant')
        }

        const taskRepo = this.getTaskRepo()
        const task = await taskRepo.findOneBy({ id: taskId, sessionId })
        if (!task) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork task ${taskId} not found`)
        }
        if (task.status !== CoworkTaskStatus.FAILED) {
            throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'Only failed tasks can be retried')
        }

        task.retryCount = (task.retryCount || 0) + 1
        task.errorMessage = null as any
        task.completedDate = null as any
        task.humanInputRequired = false
        task.pendingAction = null as any
        await taskRepo.save(task)

        const queued = await this.queueTask(task, session.tenantId, [CoworkTaskStatus.FAILED], CoworkTaskStatus.FAILED)
        if (!queued) {
            throw new InternalTHubError(StatusCodes.CONFLICT, 'Task is already queued or running')
        }

        emitCoworkEvent(this.eventStreamer, sessionId, 'cowork.task.retrying', {
            taskId: queued.id,
            name: queued.name
        })

        return queued
    }

    async approveTask(sessionId: string, taskId: string, tenantId?: string): Promise<CoworkTask> {
        const session = await this.getSessionRepo().findOneBy({ id: sessionId })
        if (!session) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
        }
        if (tenantId && session.tenantId !== tenantId) {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Forbidden: session does not belong to the authenticated tenant')
        }

        const taskRepo = this.getTaskRepo()
        const task = await taskRepo.findOneBy({ id: taskId, sessionId })
        if (!task) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork task ${taskId} not found`)
        }
        if (!task.humanInputRequired) {
            throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'Task is not awaiting human approval')
        }

        task.humanInputRequired = false
        task.pendingAction = null as any
        task.errorMessage = null as any
        task.completedDate = null as any
        await taskRepo.save(task)

        const fromStatuses = isTaskRunningLike(task.status)
            ? [task.status]
            : [CoworkTaskStatus.PENDING, CoworkTaskStatus.FAILED, CoworkTaskStatus.READY]
        const queued = await this.queueTask(task, session.tenantId, fromStatuses, task.status)
        if (!queued) {
            throw new InternalTHubError(StatusCodes.CONFLICT, 'Task is already queued or running')
        }

        emitCoworkEvent(this.eventStreamer, sessionId, 'cowork.task.approved', {
            taskId: queued.id,
            name: queued.name
        })

        return queued
    }

    async rejectTask(sessionId: string, taskId: string, reason: string, tenantId?: string): Promise<CoworkTask> {
        const session = await this.getSessionRepo().findOneBy({ id: sessionId })
        if (!session) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
        }
        if (tenantId && session.tenantId !== tenantId) {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Forbidden: session does not belong to the authenticated tenant')
        }

        const taskRepo = this.getTaskRepo()
        const task = await taskRepo.findOneBy({ id: taskId, sessionId })
        if (!task) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork task ${taskId} not found`)
        }

        task.status = CoworkTaskStatus.SKIPPED
        task.humanInputRequired = false
        task.pendingAction = null as any
        task.errorMessage = `Rejected by user: ${reason}`
        task.completedDate = this.now()
        await taskRepo.save(task)

        emitCoworkEvent(this.eventStreamer, sessionId, 'cowork.task.rejected', {
            taskId: task.id,
            name: task.name,
            reason
        })

        await this.checkCompletion(sessionId)
        return task
    }

    async setSharedMemory(sessionId: string, key: string, value: unknown): Promise<void> {
        await this.contextManager.setSharedMemory(sessionId, key, value)
    }

    async getSharedMemory(sessionId: string, key: string): Promise<string | null> {
        return this.contextManager.getSharedMemory(sessionId, key)
    }

    async cleanupSessionMemory(sessionId: string): Promise<void> {
        await this.contextManager.cleanupSessionMemory(sessionId)
    }
}

export const createCoworkExecutor = (deps: CoworkExecutorDeps = {}) => new CoworkExecutor(deps)

export const executeCoworkTask = async (sessionId: string, taskId: string, deps: CoworkExecutorDeps = {}) => {
    const executor = createCoworkExecutor(deps)
    return executor.executeCoworkTask(sessionId, taskId)
}
