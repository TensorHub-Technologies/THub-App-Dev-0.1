import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { DataSource } from 'typeorm'
import { CoworkSession } from '../../database/entities/CoworkSession'
import { CoworkTask } from '../../database/entities/CoworkTask'
import { InternalTHubError } from '../../errors/internalTHubError'
import { CoworkSessionStatus } from '../../services/cowork/status'
import { createCoworkOrchestrator } from '../../services/cowork/orchestrator'

type CoworkQueueLike = {
    addJob(data: Record<string, any>): Promise<{ id?: string | number }>
}

type AppServerLike = {
    AppDataSource: DataSource
    queueManager?: {
        getQueue(name: 'cowork'): CoworkQueueLike
    }
    sseStreamer?: {
        streamCustomEvent(chatId: string, eventType: string, data: any): void
    }
}

export type SerializedCoworkTask = Omit<CoworkTask, 'dependencies' | 'pendingAction'> & {
    dependencies: string[]
    pendingAction: unknown
}

export const parseJsonArray = (value: string | null | undefined): string[] => {
    if (!value) return []
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((item) => typeof item === 'string')
    } catch {
        return []
    }
}

export const parseJsonUnknown = (value: string | null | undefined): unknown => {
    if (!value) return null
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

export const serializeTask = (task: CoworkTask): SerializedCoworkTask => {
    return {
        ...task,
        dependencies: parseJsonArray(task.dependencies),
        pendingAction: parseJsonUnknown(task.pendingAction)
    }
}

export const sortTasks = (tasks: CoworkTask[]): CoworkTask[] => {
    return [...tasks].sort((a, b) => {
        const left = new Date(a.createdDate || 0).getTime()
        const right = new Date(b.createdDate || 0).getTime()
        if (left !== right) return left - right
        return String(a.id).localeCompare(String(b.id))
    })
}

export const getAuthenticatedTenantId = (req: Request): string => {
    const tenantId = req.user?.id
    if (!tenantId) {
        throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authentication required')
    }
    return tenantId
}

export const assertSessionAccess = async (appServer: AppServerLike, sessionId: string, tenantId: string): Promise<CoworkSession> => {
    const sessionRepo = appServer.AppDataSource.getRepository(CoworkSession)
    const session = await sessionRepo.findOneBy({ id: sessionId })
    if (!session) {
        throw new InternalTHubError(StatusCodes.NOT_FOUND, `Cowork session ${sessionId} not found`)
    }
    if (session.tenantId !== tenantId) {
        throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Forbidden: session does not belong to the authenticated tenant')
    }
    return session
}

export const getSessionTasks = async (appServer: AppServerLike, sessionId: string): Promise<CoworkTask[]> => {
    const taskRepo = appServer.AppDataSource.getRepository(CoworkTask)
    const tasks = await taskRepo.findBy({ sessionId })
    return sortTasks(tasks)
}

export const getCoworkQueueOrThrow = (appServer: AppServerLike): CoworkQueueLike => {
    if (!appServer.queueManager) {
        throw new InternalTHubError(StatusCodes.SERVICE_UNAVAILABLE, 'Cowork queue is not available')
    }
    try {
        return appServer.queueManager.getQueue('cowork')
    } catch {
        throw new InternalTHubError(StatusCodes.SERVICE_UNAVAILABLE, 'Cowork queue is not available')
    }
}

export const getCoworkOrchestrator = (appServer: AppServerLike) => {
    const queue = appServer.queueManager?.getQueue('cowork')
    return createCoworkOrchestrator({
        appDataSource: appServer.AppDataSource,
        queue: queue as CoworkQueueLike,
        eventStreamer: appServer.sseStreamer
    })
}

export const emitCoworkEvent = (
    appServer: AppServerLike,
    sessionId: string,
    eventType: string,
    payload: Record<string, any> = {}
): void => {
    appServer.sseStreamer?.streamCustomEvent(sessionId, eventType, {
        type: eventType,
        sessionId,
        ...payload
    })
}

export const parsePositiveInt = (value: unknown, fallback: number, fieldName: string): number => {
    if (value === undefined || value === null || value === '') return fallback
    const parsed = Number.parseInt(String(value), 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
        throw new InternalTHubError(StatusCodes.BAD_REQUEST, `${fieldName} must be a positive integer`)
    }
    return parsed
}

export const isSessionRunning = (status: string | null | undefined): boolean => {
    return status === CoworkSessionStatus.RUNNING
}
