// Mock heavy deps before any imports
jest.mock('../../utils/getRunningExpressApp', () => ({
    getRunningExpressApp: jest.fn()
}))

jest.mock('../../utils/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }
}))

import { recordEvent, getUsageSummary } from '../../services/analytics'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

const mockGetRunningExpressApp = getRunningExpressApp as jest.MockedFunction<typeof getRunningExpressApp>

const makeQb = (rawResult: any[] = []) => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rawResult)
})

const makeRepo = (qb = makeQb()) => ({
    create: jest.fn().mockImplementation((d: any) => d),
    save: jest.fn().mockResolvedValue({}),
    createQueryBuilder: jest.fn().mockReturnValue(qb)
})

const makeAppServer = (repo: ReturnType<typeof makeRepo>) => ({
    AppDataSource: { getRepository: jest.fn().mockReturnValue(repo) }
})

beforeEach(() => jest.clearAllMocks())

// ── TC-3.13 recordEvent never throws ─────────────────────────────────────────

describe('TC-3.13 recordEvent never throws', () => {
    it('saves AnalyticsEvent row with correct fields', async () => {
        const repo = makeRepo()
        mockGetRunningExpressApp.mockReturnValue(makeAppServer(repo) as any)

        await recordEvent({
            eventType: 'workflow.executed',
            tenantId: 'tenant-1',
            userId: 'user-1',
            tokensUsed: 100,
            costUsd: 0.01,
            latencyMs: 500,
            model: 'gpt-4',
            metadata: { chatflowId: 'cf-1' }
        })

        expect(repo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'workflow.executed',
                tenantId: 'tenant-1',
                tokensUsed: 100,
                model: 'gpt-4',
                metadata: JSON.stringify({ chatflowId: 'cf-1' })
            })
        )
        expect(repo.save).toHaveBeenCalledTimes(1)
    })

    it('swallows DB save error, does not throw', async () => {
        const repo = makeRepo()
        repo.save = jest.fn().mockRejectedValue(new Error('DB error'))
        mockGetRunningExpressApp.mockReturnValue(makeAppServer(repo) as any)

        await expect(recordEvent({ eventType: 'workflow.executed' })).resolves.toBeUndefined()
    })

    it('swallows error when getRunningExpressApp throws', async () => {
        mockGetRunningExpressApp.mockImplementation(() => {
            throw new Error('App not running')
        })

        await expect(recordEvent({ eventType: 'workflow.executed' })).resolves.toBeUndefined()
    })

    it('passes undefined metadata when none provided', async () => {
        const repo = makeRepo()
        mockGetRunningExpressApp.mockReturnValue(makeAppServer(repo) as any)

        await recordEvent({ eventType: 'test.event' })

        expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ metadata: undefined }))
    })
})

// ── getUsageSummary ───────────────────────────────────────────────────────────

describe('getUsageSummary', () => {
    it('calls QueryBuilder with tenantId and date range, returns raw results', async () => {
        const rawResult = [{ eventType: 'workflow.executed', count: '5' }]
        const qb = makeQb(rawResult)
        const repo = makeRepo(qb)
        mockGetRunningExpressApp.mockReturnValue(makeAppServer(repo) as any)

        const from = new Date('2026-01-01')
        const to = new Date('2026-01-31')
        const result = await getUsageSummary('tenant-1', from, to)

        expect(qb.where).toHaveBeenCalledWith('e.tenantId = :tenantId', { tenantId: 'tenant-1' })
        expect(qb.andWhere).toHaveBeenCalledWith('e.createdDate BETWEEN :from AND :to', { from, to })
        expect(qb.groupBy).toHaveBeenCalledWith('e.eventType')
        expect(result).toEqual(rawResult)
    })
})
