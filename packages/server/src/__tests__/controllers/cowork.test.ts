import { Request, Response, NextFunction } from 'express'
import coworkController from '../../controllers/cowork'
import humanInputController from '../../controllers/cowork/humanInput'
import { CoworkSessionStatus, CoworkTaskStatus } from '../../services/cowork/status'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { createCoworkOrchestrator } from '../../services/cowork/orchestrator'

jest.mock('../../utils/getRunningExpressApp', () => ({
    getRunningExpressApp: jest.fn()
}))

jest.mock('../../services/cowork/orchestrator', () => ({
    createCoworkOrchestrator: jest.fn()
}))

type MockRepo<T> = {
    findOneBy: jest.Mock
    findBy: jest.Mock
    findAndCount: jest.Mock
    save: jest.Mock
}

type MockAppServer = {
    AppDataSource: {
        getRepository: jest.Mock
    }
    queueManager: {
        getQueue: jest.Mock
    }
    sseStreamer: {
        addClient: jest.Mock
        removeClient: jest.Mock
        streamCustomEvent: jest.Mock
    }
}

const mockedGetRunningExpressApp = getRunningExpressApp as jest.MockedFunction<typeof getRunningExpressApp>
const mockedCreateCoworkOrchestrator = createCoworkOrchestrator as jest.MockedFunction<typeof createCoworkOrchestrator>

const makeResponse = () => {
    const res: Partial<Response> = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    res.setHeader = jest.fn()
    res.flushHeaders = jest.fn()
    return res as Response
}

const makeRequest = (overrides: Partial<Request> = {}) => {
    const req: Partial<Request> = {
        body: {},
        params: {},
        query: {},
        on: jest.fn(),
        ...overrides
    }
    return req as Request
}

const makeSessionRepo = (): MockRepo<any> => ({
    findOneBy: jest.fn(async () => null),
    findBy: jest.fn(async () => []),
    findAndCount: jest.fn(async () => [[], 0]),
    save: jest.fn(async (entity) => entity)
})

const makeTaskRepo = (): MockRepo<any> => ({
    findOneBy: jest.fn(async () => null),
    findBy: jest.fn(async () => []),
    findAndCount: jest.fn(async () => [[], 0]),
    save: jest.fn(async (entity) => entity)
})

const makeAppServer = (sessionRepo: MockRepo<any>, taskRepo: MockRepo<any>, queueAddJob?: jest.Mock): MockAppServer => ({
    AppDataSource: {
        getRepository: jest.fn((entity) => {
            if (entity.name === 'CoworkSession') return sessionRepo
            if (entity.name === 'CoworkTask') return taskRepo
            throw new Error(`Unexpected repository: ${entity.name}`)
        })
    },
    queueManager: {
        getQueue: jest.fn(() => ({
            addJob: queueAddJob || jest.fn(async () => ({ id: 'job-1' }))
        }))
    },
    sseStreamer: {
        addClient: jest.fn(),
        removeClient: jest.fn(),
        streamCustomEvent: jest.fn()
    }
})

describe('cowork controller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('Create session returns tasks with parsed dependencies', async () => {
        const req = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            body: {
                goal: 'Build onboarding flow',
                selectedChatModel: { provider: 'openai', modelName: 'gpt-4.1' }
            }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction
        const sessionRepo = makeSessionRepo()
        const taskRepo = makeTaskRepo()
        const appServer = makeAppServer(sessionRepo, taskRepo)

        mockedGetRunningExpressApp.mockReturnValue(appServer as any)
        mockedCreateCoworkOrchestrator.mockReturnValue({
            createCoworkSession: jest.fn(async () => ({
                session: { id: 's-1', tenantId: 'tenant-1', status: CoworkSessionStatus.PENDING },
                tasks: [{ id: 't-1', name: 'Task 1', dependencies: '["p-1"]', humanInputRequired: false, pendingAction: null } as any]
            }))
        } as any)

        await coworkController.createSession(req, res, next)

        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                tasks: [expect.objectContaining({ dependencies: ['p-1'] })]
            })
        )
        expect(next).not.toHaveBeenCalled()
    })

    it('SSE stream sends initial session state immediately', async () => {
        const req = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            params: { id: 'session-1' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction
        const sessionRepo = makeSessionRepo()
        const taskRepo = makeTaskRepo()
        const appServer = makeAppServer(sessionRepo, taskRepo)

        sessionRepo.findOneBy.mockResolvedValue({
            id: 'session-1',
            tenantId: 'tenant-1',
            status: CoworkSessionStatus.RUNNING
        })
        taskRepo.findBy.mockResolvedValue([
            { id: 'task-1', name: 'Task 1', dependencies: '[]', humanInputRequired: false, pendingAction: null }
        ])
        mockedGetRunningExpressApp.mockReturnValue(appServer as any)

        let closeHandler: any = null
        ;(req.on as jest.Mock).mockImplementation((event: string, cb: () => void) => {
            if (event === 'close') closeHandler = cb
            return req
        })

        await coworkController.streamSession(req, res, next)

        expect(appServer.sseStreamer.addClient).toHaveBeenCalledWith('session-1', res)
        expect(appServer.sseStreamer.streamCustomEvent).toHaveBeenCalledWith(
            'session-1',
            'cowork.session.state',
            expect.objectContaining({
                type: 'cowork.session.state',
                sessionId: 'session-1'
            })
        )
        expect(closeHandler).not.toBeNull()
        if (closeHandler) (closeHandler as () => void)()
        expect(appServer.sseStreamer.removeClient).toHaveBeenCalledWith('session-1')
    })

    it('Approve re-queues task', async () => {
        const req = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            params: { sessionId: 's-1', taskId: 't-1' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction
        const sessionRepo = makeSessionRepo()
        const taskRepo = makeTaskRepo()
        const addJob = jest.fn(async () => ({ id: 'job-9' }))
        const appServer = makeAppServer(sessionRepo, taskRepo, addJob)

        sessionRepo.findOneBy.mockResolvedValue({ id: 's-1', tenantId: 'tenant-1' })
        taskRepo.findOneBy.mockResolvedValue({ id: 't-1', sessionId: 's-1', name: 'Review', humanInputRequired: true } as any)
        mockedGetRunningExpressApp.mockReturnValue(appServer as any)

        await humanInputController.approveTask(req, res, next)

        expect(addJob).toHaveBeenCalledWith(expect.objectContaining({ jobType: 'cowork-task', sessionId: 's-1', taskId: 't-1' }))
        expect(taskRepo.save).toHaveBeenCalledWith(expect.objectContaining({ humanInputRequired: false, status: CoworkTaskStatus.RUNNING }))
        expect(appServer.sseStreamer.streamCustomEvent).toHaveBeenCalledWith(
            's-1',
            'cowork.task.approved',
            expect.objectContaining({ taskId: 't-1' })
        )
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
        expect(next).not.toHaveBeenCalled()
    })

    it('Reject marks task skipped and checks session completion', async () => {
        const req = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            params: { sessionId: 's-1', taskId: 't-1' },
            body: { reason: 'not needed' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction
        const sessionRepo = makeSessionRepo()
        const taskRepo = makeTaskRepo()
        const appServer = makeAppServer(sessionRepo, taskRepo)
        const checkCompletion = jest.fn(async () => ({ completed: false, partial: false, status: CoworkSessionStatus.RUNNING }))

        sessionRepo.findOneBy.mockResolvedValue({ id: 's-1', tenantId: 'tenant-1' })
        taskRepo.findOneBy.mockResolvedValue({ id: 't-1', sessionId: 's-1', name: 'Review', humanInputRequired: true } as any)
        mockedGetRunningExpressApp.mockReturnValue(appServer as any)
        mockedCreateCoworkOrchestrator.mockReturnValue({ checkCompletion } as any)

        await humanInputController.rejectTask(req, res, next)

        expect(taskRepo.save).toHaveBeenCalledWith(
            expect.objectContaining({
                status: CoworkTaskStatus.SKIPPED,
                errorMessage: 'Rejected by user: not needed'
            })
        )
        expect(checkCompletion).toHaveBeenCalledWith('s-1')
        expect(appServer.sseStreamer.streamCustomEvent).toHaveBeenCalledWith(
            's-1',
            'cowork.task.rejected',
            expect.objectContaining({ taskId: 't-1' })
        )
    })

    it('Retry re-queues only failed tasks', async () => {
        const req = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            params: { sessionId: 's-1', taskId: 't-1' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction
        const sessionRepo = makeSessionRepo()
        const taskRepo = makeTaskRepo()
        const addJob = jest.fn(async () => ({ id: 'job-r1' }))
        const appServer = makeAppServer(sessionRepo, taskRepo, addJob)

        sessionRepo.findOneBy.mockResolvedValue({ id: 's-1', tenantId: 'tenant-1' })
        taskRepo.findOneBy.mockResolvedValue({
            id: 't-1',
            sessionId: 's-1',
            name: 'Task',
            status: CoworkTaskStatus.FAILED,
            retryCount: 1
        } as any)
        mockedGetRunningExpressApp.mockReturnValue(appServer as any)

        await coworkController.retryTask(req, res, next)

        expect(addJob).toHaveBeenCalled()
        expect(taskRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: CoworkTaskStatus.RUNNING, retryCount: 2 }))
        expect(next).not.toHaveBeenCalled()
    })

    it('returns 401 for unauthenticated requests', async () => {
        const req = makeRequest({
            body: { goal: 'x', selectedChatModel: { modelName: 'gpt' } }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        await coworkController.createSession(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
    })

    it('returns 403 for cross-tenant access', async () => {
        const req = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            params: { id: 's-1' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction
        const sessionRepo = makeSessionRepo()
        const taskRepo = makeTaskRepo()
        const appServer = makeAppServer(sessionRepo, taskRepo)

        sessionRepo.findOneBy.mockResolvedValue({ id: 's-1', tenantId: 'tenant-2' })
        mockedGetRunningExpressApp.mockReturnValue(appServer as any)

        await coworkController.getSessionById(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }))
    })

    it('returns 400 for invalid retry/approve cases', async () => {
        const retryReq = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            params: { sessionId: 's-1', taskId: 't-1' }
        })
        const approveReq = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            params: { sessionId: 's-1', taskId: 't-2' }
        })
        const res = makeResponse()
        const nextRetry = jest.fn() as NextFunction
        const nextApprove = jest.fn() as NextFunction
        const sessionRepo = makeSessionRepo()
        const taskRepo = makeTaskRepo()
        const appServer = makeAppServer(sessionRepo, taskRepo)

        sessionRepo.findOneBy.mockResolvedValue({ id: 's-1', tenantId: 'tenant-1' })
        taskRepo.findOneBy
            .mockResolvedValueOnce({ id: 't-1', sessionId: 's-1', status: CoworkTaskStatus.COMPLETED } as any)
            .mockResolvedValueOnce({ id: 't-2', sessionId: 's-1', humanInputRequired: false } as any)
        mockedGetRunningExpressApp.mockReturnValue(appServer as any)

        await coworkController.retryTask(retryReq, res, nextRetry)
        await humanInputController.approveTask(approveReq, res, nextApprove)

        expect(nextRetry).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }))
        expect(nextApprove).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }))
    })

    it('returns 404 for missing session', async () => {
        const req = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            params: { id: 'missing-session' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction
        const sessionRepo = makeSessionRepo()
        const taskRepo = makeTaskRepo()
        const appServer = makeAppServer(sessionRepo, taskRepo)

        sessionRepo.findOneBy.mockResolvedValue(null)
        mockedGetRunningExpressApp.mockReturnValue(appServer as any)

        await coworkController.getSessionById(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }))
    })
})
