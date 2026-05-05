import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { CoworkSession } from '../../database/entities/CoworkSession'
import { CoworkTask } from '../../database/entities/CoworkTask'
import { InternalTHubError } from '../../errors/internalTHubError'
import { CoworkSessionStatus, CoworkTaskStatus } from '../../services/cowork/status'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import {
    assertSessionAccess,
    emitCoworkEvent,
    getAuthenticatedTenantId,
    getCoworkOrchestrator,
    getCoworkQueueOrThrow,
    getSessionTasks,
    isSessionRunning,
    parsePositiveInt,
    serializeTask
} from './utils'

/**
 * Create a new cowork session and return created tasks with parsed dependencies.
 */
const createSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getAuthenticatedTenantId(req)
        const { goal, selectedChatModel, maxTokenBudget, maxCostBudget } = req.body || {}

        if (!goal || !selectedChatModel) {
            throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'goal and selectedChatModel are required')
        }

        const appServer = getRunningExpressApp()
        const orchestrator = getCoworkOrchestrator(appServer)
        const created = await orchestrator.createCoworkSession({
            tenantId,
            userId: tenantId,
            goal: String(goal),
            selectedChatModel,
            maxTokenBudget: maxTokenBudget ?? null,
            maxCostBudget: maxCostBudget ?? null
        })

        return res.status(StatusCodes.CREATED).json({
            session: created.session,
            tasks: created.tasks.map(serializeTask)
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get paginated cowork sessions for the authenticated tenant only.
 */
const getSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getAuthenticatedTenantId(req)
        const page = parsePositiveInt(req.query.page, 1, 'page')
        const limit = parsePositiveInt(req.query.limit, 20, 'limit')

        const appServer = getRunningExpressApp()
        const sessionRepo = appServer.AppDataSource.getRepository(CoworkSession)

        const [sessions, total] = await sessionRepo.findAndCount({
            where: { tenantId },
            order: { createdDate: 'DESC' },
            skip: (page - 1) * limit,
            take: limit
        })

        return res.json({
            page,
            limit,
            total,
            sessions
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get a single cowork session with all tasks and parsed dependencies.
 */
const getSessionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, 'session id is required')
        }

        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const session = await assertSessionAccess(appServer, req.params.id, tenantId)
        const tasks = await getSessionTasks(appServer, session.id)

        return res.json({
            session,
            tasks: tasks.map(serializeTask)
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Start a cowork session by queueing ready tasks.
 */
const startSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, 'session id is required')
        }

        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const sessionRepo = appServer.AppDataSource.getRepository(CoworkSession)
        const session = await assertSessionAccess(appServer, req.params.id, tenantId)

        if (isSessionRunning(session.status)) {
            throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'Session is already running')
        }

        const orchestrator = getCoworkOrchestrator(appServer)
        await orchestrator.startCoworkSession(session.id)

        session.status = CoworkSessionStatus.RUNNING
        await sessionRepo.save(session)

        return res.status(StatusCodes.OK).json({
            success: true,
            sessionId: session.id,
            status: session.status
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Cancel a cowork session, clean memory, and broadcast cancellation.
 */
const deleteSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, 'session id is required')
        }

        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const sessionRepo = appServer.AppDataSource.getRepository(CoworkSession)
        const session = await assertSessionAccess(appServer, req.params.id, tenantId)

        session.status = CoworkSessionStatus.CANCELLED
        session.completedDate = new Date()
        await sessionRepo.save(session)

        const orchestrator = getCoworkOrchestrator(appServer)
        await orchestrator.cleanupSessionMemory(session.id)

        emitCoworkEvent(appServer, session.id, 'cowork.session.cancelled', {
            status: session.status
        })

        return res.json({
            success: true,
            sessionId: session.id,
            status: session.status
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Stream cowork session events over SSE and immediately push current state.
 */
const streamSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, 'session id is required')
        }

        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const session = await assertSessionAccess(appServer, req.params.id, tenantId)
        const tasks = await getSessionTasks(appServer, session.id)
        const serializedTasks = tasks.map(serializeTask)

        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no')
        res.flushHeaders()

        appServer.sseStreamer.addClient(session.id, res)
        emitCoworkEvent(appServer, session.id, 'cowork.session.state', {
            session,
            tasks: serializedTasks
        })

        serializedTasks
            .filter((task) => task.humanInputRequired)
            .forEach((task) => {
                emitCoworkEvent(appServer, session.id, 'cowork.task.awaiting_approval', {
                    taskId: task.id,
                    name: task.name,
                    pendingAction: task.pendingAction
                })
            })

        req.on('close', () => {
            appServer.sseStreamer.removeClient(session.id)
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Retry a failed task by re-queueing it and clearing previous error state.
 */
const retryTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId, taskId } = req.params || {}
        if (!sessionId || !taskId) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, 'sessionId and taskId are required')
        }

        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        await assertSessionAccess(appServer, sessionId, tenantId)

        const taskRepo = appServer.AppDataSource.getRepository(CoworkTask)
        const task = await taskRepo.findOneBy({ id: taskId, sessionId })
        if (!task) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork task ${taskId} not found`)
        }

        if (task.status !== CoworkTaskStatus.FAILED) {
            throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'Only failed tasks can be retried')
        }

        const coworkQueue = getCoworkQueueOrThrow(appServer)
        const job = await coworkQueue.addJob({
            jobType: 'cowork-task',
            sessionId,
            taskId,
            tenantId
        })

        task.status = CoworkTaskStatus.RUNNING
        task.errorMessage = null as any
        task.completedDate = null as any
        task.startedDate = new Date()
        task.bullJobId = job?.id != null ? String(job.id) : task.bullJobId
        task.retryCount = (task.retryCount || 0) + 1
        await taskRepo.save(task)

        emitCoworkEvent(appServer, sessionId, 'cowork.task.retrying', {
            taskId: task.id,
            name: task.name
        })

        return res.json({
            success: true,
            task: serializeTask(task)
        })
    } catch (error) {
        next(error)
    }
}

export default {
    createSession,
    getSessions,
    getSessionById,
    startSession,
    deleteSession,
    streamSession,
    retryTask
}
