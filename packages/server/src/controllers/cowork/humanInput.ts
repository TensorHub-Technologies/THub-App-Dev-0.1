import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { CoworkTask } from '../../database/entities/CoworkTask'
import { InternalTHubError } from '../../errors/internalTHubError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { assertSessionAccess, getAuthenticatedTenantId, getCoworkOrchestrator, parseJsonUnknown } from './utils'

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
        const orchestrator = getCoworkOrchestrator(appServer)
        const task = await orchestrator.approveTask(sessionId, taskId, tenantId)

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

        const reason = String(req.body?.reason || 'No reason provided').trim()
        const orchestrator = getCoworkOrchestrator(appServer)
        const task = await orchestrator.rejectTask(sessionId, taskId, reason, tenantId)

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
