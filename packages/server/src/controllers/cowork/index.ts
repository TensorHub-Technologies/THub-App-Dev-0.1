import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { CoworkSession } from '../../database/entities/CoworkSession'
import { InternalTHubError } from '../../errors/internalTHubError'
import { CoworkSessionStatus } from '../../services/cowork/status'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { listModelProfiles, updateModelProfile } from '../../services/cowork/ModelRouter'
import {
    assertSessionAccess,
    emitCoworkEvent,
    getAuthenticatedTenantId,
    getCoworkOrchestrator,
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
        const updatedSession = await sessionRepo.findOneBy({ id: session.id })

        return res.status(StatusCodes.OK).json({
            success: true,
            sessionId: session.id,
            status: updatedSession?.status || CoworkSessionStatus.RUNNING
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

        const orchestrator = getCoworkOrchestrator(appServer)
        const task = await orchestrator.retryCoworkTask(sessionId, taskId, tenantId)

        return res.json({
            success: true,
            task: serializeTask(task)
        })
    } catch (error) {
        next(error)
    }
}

/**
 * List model profiles used by cowork model routing.
 */
const getModelProfiles = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const appServer = getRunningExpressApp()
        const models = await listModelProfiles(appServer.AppDataSource)
        return res.json(models)
    } catch (error) {
        next(error)
    }
}

/**
 * Update a cowork model profile.
 */
const updateModelProfileById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, 'model profile id is required')
        }

        const appServer = getRunningExpressApp()
        const model = await updateModelProfile(req.params.id, req.body || {}, appServer.AppDataSource)
        return res.json(model)
    } catch (error) {
        next(error)
    }
}

export default {
    getModelProfiles,
    updateModelProfileById,
    createSession,
    getSessions,
    getSessionById,
    startSession,
    deleteSession,
    streamSession,
    retryTask
}
