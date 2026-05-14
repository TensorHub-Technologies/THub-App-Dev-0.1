jest.mock('../../../utils/getRunningExpressApp', () => ({
    getRunningExpressApp: jest.fn()
}))

jest.mock('../../../database/entities/AnalyticsEvent', () => ({
    AnalyticsEvent: class AnalyticsEvent {}
}))

import { recordEvent } from '../../../services/analytics'
import { getRunningExpressApp } from '../../../utils/getRunningExpressApp'

const mockGetRunningExpressApp = getRunningExpressApp as jest.Mock

const makeAppServer = (saveImpl: () => Promise<any>) => ({
    AppDataSource: {
        getRepository: jest.fn().mockReturnValue({
            save: jest.fn().mockImplementation(saveImpl),
            create: jest.fn().mockImplementation((d: any) => d)
        })
    }
})

beforeEach(() => {
    jest.clearAllMocks()
})

describe('TC-3.13 recordEvent never blocks caller', () => {
    it('resolves without throwing when DB save throws', async () => {
        mockGetRunningExpressApp.mockReturnValue(
            makeAppServer(async () => {
                throw new Error('DB unavailable')
            })
        )

        await expect(recordEvent({ eventType: 'workflow.executed', tenantId: 'tenant-1' })).resolves.toBeUndefined()
    })

    it('resolves without throwing when getRunningExpressApp throws', async () => {
        mockGetRunningExpressApp.mockImplementation(() => {
            throw new Error('App not initialized')
        })

        await expect(recordEvent({ eventType: 'workflow.executed' })).resolves.toBeUndefined()
    })

    it('saves AnalyticsEvent with correct fields when DB is available', async () => {
        const mockSave = jest.fn().mockResolvedValue({})
        const mockCreate = jest.fn().mockImplementation((d: any) => d)
        const mockRepo = { save: mockSave, create: mockCreate }
        mockGetRunningExpressApp.mockReturnValue({
            AppDataSource: { getRepository: jest.fn().mockReturnValue(mockRepo) }
        })

        await recordEvent({
            eventType: 'workflow.executed',
            tenantId: 'tenant-1',
            userId: 'user-1',
            tokensUsed: 500,
            costUsd: 0.005,
            latencyMs: 1200,
            model: 'claude-3-5-sonnet-20241022',
            metadata: { chatflowId: 'flow-1' }
        })

        expect(mockSave).toHaveBeenCalledTimes(1)
        const savedEntity = mockCreate.mock.calls[0][0]
        expect(savedEntity.eventType).toBe('workflow.executed')
        expect(savedEntity.tenantId).toBe('tenant-1')
        expect(savedEntity.tokensUsed).toBe(500)
        expect(savedEntity.costUsd).toBe(0.005)
        expect(savedEntity.latencyMs).toBe(1200)
        expect(savedEntity.model).toBe('claude-3-5-sonnet-20241022')
        expect(savedEntity.metadata).toBe(JSON.stringify({ chatflowId: 'flow-1' }))
    })

    it('called via void does not block surrounding code', async () => {
        mockGetRunningExpressApp.mockReturnValue(
            makeAppServer(async () => {
                throw new Error('slow DB crash')
            })
        )

        const order: string[] = []

        // Simulate CoworkExecutor: fire-and-forget then continue
        void recordEvent({ eventType: 'test' }).then(() => order.push('analytics'))
        order.push('executor-continued')

        await Promise.resolve() // flush microtask queue

        expect(order[0]).toBe('executor-continued')
    })
})
