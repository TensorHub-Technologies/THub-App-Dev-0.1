import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { CoworkTask } from '../../database/entities/CoworkTask'
import { InternalTHubError } from '../../errors/internalTHubError'
import { CoworkTaskStatus } from '../../services/cowork/status'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import {
    assertSessionAccess,
    emitCoworkEvent,
    getAuthenticatedTenantId,
    getCoworkOrchestrator,
    getCoworkQueueOrThrow,
    parseJsonUnknown
} from './utils'

/**
 * Approve a task waiting for human input and re-queue it for execution.
 */
const approveTask = async (req: Request, res: Response, next: NextFunction) => {
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

        if (!task.humanInputRequired) {
            throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'Task is not awaiting human approval')
        }

        const coworkQueue = getCoworkQueueOrThrow(appServer)
        const job = await coworkQueue.addJob({
            jobType: 'cowork-task',
            sessionId,
            taskId,
            tenantId
        })

        task.humanInputRequired = false
        task.pendingAction = null as any
        task.status = CoworkTaskStatus.RUNNING
        task.errorMessage = null as any
        task.startedDate = new Date()
        task.completedDate = null as any
        task.bullJobId = job?.id != null ? String(job.id) : task.bullJobId
        await taskRepo.save(task)

        emitCoworkEvent(appServer, sessionId, 'cowork.task.approved', {
            taskId: task.id,
            name: task.name
        })

        return res.json({
            success: true,
            taskId: task.id
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Reject a task that requires human input, mark it skipped, and continue session progress checks.
 */
const rejectTask = async (req: Request, res: Response, next: NextFunction) => {
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

        const reason = String(req.body?.reason || 'No reason provided').trim()
        task.status = CoworkTaskStatus.SKIPPED
        task.humanInputRequired = false
        task.pendingAction = null as any
        task.errorMessage = `Rejected by user: ${reason}`
        task.completedDate = new Date()
        await taskRepo.save(task)

        emitCoworkEvent(appServer, sessionId, 'cowork.task.rejected', {
            taskId: task.id,
            name: task.name,
            reason
        })

        const orchestrator = getCoworkOrchestrator(appServer)
        await orchestrator.checkCompletion(sessionId)

        return res.json({
            success: true,
            taskId: task.id,
            status: task.status
        })
    } catch (error) {
        next(error)
    }
}

/**
 * List all pending task approvals for a session.
 */
const getPendingApprovals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.params || {}
        if (!sessionId) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, 'sessionId is required')
        }

        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        await assertSessionAccess(appServer, sessionId, tenantId)

        const taskRepo = appServer.AppDataSource.getRepository(CoworkTask)
        const pendingTasks = await taskRepo.findBy({
            sessionId,
            humanInputRequired: true
        })

        const pending = pendingTasks.map((task) => ({
            taskId: task.id,
            name: task.name,
            pendingAction: parseJsonUnknown(task.pendingAction)
        }))

        pending.forEach((item) => {
            emitCoworkEvent(appServer, sessionId, 'cowork.task.awaiting_approval', item)
        })

        return res.json({ pending })
    } catch (error) {
        next(error)
    }
}

export default {
    approveTask,
    rejectTask,
    getPendingApprovals
}
