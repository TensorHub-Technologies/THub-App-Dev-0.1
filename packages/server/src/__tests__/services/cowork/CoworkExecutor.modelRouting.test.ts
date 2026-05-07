jest.mock('../../../services/cowork/ModelRouter', () => ({
    selectModel: jest.fn(),
    recordModelFailure: jest.fn()
}))

import { DataSource } from 'typeorm'
import { CoworkExecutor } from '../../../services/cowork/CoworkExecutor'
import { CoworkSession } from '../../../database/entities/CoworkSession'
import { CoworkTask } from '../../../database/entities/CoworkTask'
import { CoworkSessionStatus, CoworkTaskStatus } from '../../../services/cowork/status'
import { selectModel, recordModelFailure } from '../../../services/cowork/ModelRouter'
import type { RoutedModelSelection } from '../../../services/cowork/ModelRouter'

type State = {
    sessions: CoworkSession[]
    tasks: CoworkTask[]
}

const matchesWhere = <T extends Record<string, any>>(row: T, where: Record<string, any>): boolean => {
    return Object.entries(where).every(([key, value]) => row[key] === value)
}

const makeDataSource = (state: State): DataSource => {
    const sessionRepo = {
        findOneBy: jest.fn(
            async (where: Partial<CoworkSession>) => state.sessions.find((row) => matchesWhere(row as any, where as any)) || null
        ),
        save: jest.fn(async (entity: CoworkSession) => {
            const payload = { ...entity } as CoworkSession
            const idx = state.sessions.findIndex((row) => row.id === payload.id)
            if (idx >= 0) state.sessions[idx] = payload
            else state.sessions.push(payload)
            return payload
        }),
        findBy: jest.fn(async (where: Partial<CoworkSession>) => state.sessions.filter((row) => matchesWhere(row as any, where as any)))
    }

    const taskRepo = {
        findOneBy: jest.fn(async (where: Partial<CoworkTask>) => state.tasks.find((row) => matchesWhere(row as any, where as any)) || null),
        save: jest.fn(async (entity: CoworkTask) => {
            const payload = { ...entity } as CoworkTask
            const idx = state.tasks.findIndex((row) => row.id === payload.id)
            if (idx >= 0) state.tasks[idx] = payload
            else state.tasks.push(payload)
            return payload
        }),
        findBy: jest.fn(async (where: Partial<CoworkTask>) => state.tasks.filter((row) => matchesWhere(row as any, where as any)))
    }

    return {
        getRepository: jest.fn((entity: unknown) => {
            if (entity === CoworkSession) return sessionRepo
            if (entity === CoworkTask) return taskRepo
            throw new Error(`Unknown repository: ${String(entity)}`)
        })
    } as unknown as DataSource
}

const makeRedis = () => {
    const store = new Map<string, string>()

    return {
        set: jest.fn(async (key: string, value: string) => {
            store.set(key, value)
            return 'OK'
        }),
        get: jest.fn(async (key: string) => {
            return store.get(key) ?? null
        }),
        del: jest.fn(async (...keys: string[]) => {
            let deleted = 0
            keys.forEach((key) => {
                if (store.delete(key)) deleted += 1
            })
            return deleted
        })
    }
}

const makeRoutedModel = (modelName: string, provider = 'openai'): RoutedModelSelection => ({
    provider,
    modelName,
    isLocal: provider === 'ollama',
    estimatedCostUsd: 0
})

const mockedSelectModel = selectModel as jest.MockedFunction<typeof selectModel>
const mockedRecordModelFailure = recordModelFailure as jest.MockedFunction<typeof recordModelFailure>

describe('CoworkExecutor model routing + fallback', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('TC-2: primary model fails and fallback model succeeds', async () => {
        const state: State = {
            sessions: [
                {
                    id: 'session-1',
                    tenantId: 'tenant-1',
                    userId: 'user-1',
                    goal: 'Goal',
                    status: CoworkSessionStatus.RUNNING,
                    selectedChatModel: JSON.stringify({ routingStrategy: 'balanced', temperature: 0.2, maxTokens: 300 }),
                    totalTokensUsed: 0,
                    totalCostUsd: 0,
                    createdDate: new Date('2026-05-01T00:00:00.000Z'),
                    updatedDate: new Date('2026-05-01T00:00:00.000Z')
                } as CoworkSession
            ],
            tasks: [
                {
                    id: 'task-1',
                    sessionId: 'session-1',
                    name: 'Task 1',
                    description: 'Do task',
                    status: CoworkTaskStatus.RUNNING,
                    dependencies: JSON.stringify([]),
                    retryCount: 0,
                    humanInputRequired: false,
                    createdDate: new Date('2026-05-01T00:00:00.000Z'),
                    updatedDate: new Date('2026-05-01T00:00:00.000Z')
                } as CoworkTask
            ]
        }

        mockedSelectModel.mockResolvedValue({
            selectedModel: makeRoutedModel('gpt-4o-mini', 'openai'),
            fallbackChain: [makeRoutedModel('claude-3-haiku', 'anthropic')]
        })

        const executeWithAgentflow = jest.fn(async ({ selectedChatModel }: { selectedChatModel: Record<string, any> }) => {
            if (selectedChatModel.modelName === 'gpt-4o-mini') {
                throw new Error('primary failure')
            }
            return {
                content: 'fallback output',
                type: 'markdown' as const,
                tokensUsed: 25,
                model: selectedChatModel.modelName
            }
        })

        const dataSource = makeDataSource(state)
        const service = new CoworkExecutor({
            appDataSource: dataSource,
            redisClient: makeRedis(),
            buildPrompt: async () => 'PROMPT',
            executeWithAgentflow
        })

        const result = await service.executeCoworkTask('session-1', 'task-1')

        expect(result?.status).toBe(CoworkTaskStatus.COMPLETED)
        expect(result?.model).toBe('claude-3-haiku')
        expect(mockedRecordModelFailure).toHaveBeenCalledWith('gpt-4o-mini', dataSource)
    })

    it('TC-4: all fallback models fail and task is marked failed', async () => {
        const events: Array<{ eventType: string; data: any }> = []
        const eventStreamer = {
            streamCustomEvent: jest.fn((_sessionId: string, eventType: string, data: any) => {
                events.push({ eventType, data })
            })
        }

        const state: State = {
            sessions: [
                {
                    id: 'session-2',
                    tenantId: 'tenant-1',
                    userId: 'user-1',
                    goal: 'Goal',
                    status: CoworkSessionStatus.RUNNING,
                    selectedChatModel: JSON.stringify({ routingStrategy: 'balanced' }),
                    totalTokensUsed: 0,
                    totalCostUsd: 0,
                    createdDate: new Date('2026-05-01T00:00:00.000Z'),
                    updatedDate: new Date('2026-05-01T00:00:00.000Z')
                } as CoworkSession
            ],
            tasks: [
                {
                    id: 'task-2',
                    sessionId: 'session-2',
                    name: 'Task 2',
                    description: 'Do task',
                    status: CoworkTaskStatus.RUNNING,
                    dependencies: JSON.stringify([]),
                    retryCount: 0,
                    humanInputRequired: false,
                    createdDate: new Date('2026-05-01T00:00:00.000Z'),
                    updatedDate: new Date('2026-05-01T00:00:00.000Z')
                } as CoworkTask
            ]
        }

        mockedSelectModel.mockResolvedValue({
            selectedModel: makeRoutedModel('gpt-4o-mini', 'openai'),
            fallbackChain: [makeRoutedModel('claude-3-haiku', 'anthropic')]
        })

        const executeWithAgentflow = jest.fn(async () => {
            throw new Error('model failed')
        })

        const dataSource = makeDataSource(state)
        const service = new CoworkExecutor({
            appDataSource: dataSource,
            redisClient: makeRedis(),
            eventStreamer,
            buildPrompt: async () => 'PROMPT',
            executeWithAgentflow
        })

        await expect(service.executeCoworkTask('session-2', 'task-2')).rejects.toThrow('All models in fallback chain failed')

        const failedTask = state.tasks.find((task) => task.id === 'task-2')
        expect(failedTask?.status).toBe(CoworkTaskStatus.FAILED)
        expect(failedTask?.errorMessage).toBe('All models in fallback chain failed')
        expect(mockedRecordModelFailure).toHaveBeenCalledTimes(2)
        expect(events.some((event) => event.eventType === 'cowork.task.failed')).toBe(true)
    })

    it('TC-5: missing routingStrategy defaults to balanced', async () => {
        const state: State = {
            sessions: [
                {
                    id: 'session-3',
                    tenantId: 'tenant-1',
                    userId: 'user-1',
                    goal: 'Goal',
                    status: CoworkSessionStatus.RUNNING,
                    selectedChatModel: JSON.stringify({ provider: 'openai', modelName: 'gpt-4o-mini' }),
                    totalTokensUsed: 0,
                    totalCostUsd: 0,
                    createdDate: new Date('2026-05-01T00:00:00.000Z'),
                    updatedDate: new Date('2026-05-01T00:00:00.000Z')
                } as CoworkSession
            ],
            tasks: [
                {
                    id: 'task-3',
                    sessionId: 'session-3',
                    name: 'Task 3',
                    description: 'Do task',
                    status: CoworkTaskStatus.RUNNING,
                    dependencies: JSON.stringify([]),
                    retryCount: 0,
                    humanInputRequired: false,
                    createdDate: new Date('2026-05-01T00:00:00.000Z'),
                    updatedDate: new Date('2026-05-01T00:00:00.000Z')
                } as CoworkTask
            ]
        }

        mockedSelectModel.mockResolvedValue({
            selectedModel: makeRoutedModel('gpt-4o-mini', 'openai'),
            fallbackChain: []
        })

        const dataSource = makeDataSource(state)
        const service = new CoworkExecutor({
            appDataSource: dataSource,
            redisClient: makeRedis(),
            buildPrompt: async () => 'PROMPT',
            executeWithAgentflow: async ({ selectedChatModel }: { selectedChatModel: Record<string, any> }) => ({
                content: 'ok',
                type: 'text',
                model: selectedChatModel.modelName
            })
        })

        await service.executeCoworkTask('session-3', 'task-3')

        expect(mockedSelectModel).toHaveBeenCalledWith(
            expect.objectContaining({
                routingStrategy: 'balanced'
            })
        )
    })
})
