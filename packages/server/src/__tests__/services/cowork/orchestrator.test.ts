import { DataSource } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { CoworkSessionStatus, CoworkTaskStatus } from '../../../services/cowork/status'
import { CoworkSession } from '../../../database/entities/CoworkSession'
import { CoworkTask } from '../../../database/entities/CoworkTask'
import { User } from '../../../database/entities/User'
import { InternalTHubError } from '../../../errors/internalTHubError'
import { CoworkOrchestratorService } from '../../../services/cowork/orchestrator'
import { TaskDAG } from '../../../services/cowork/CoworkTypes'

type InMemoryState = {
    users: User[]
    sessions: CoworkSession[]
    tasks: CoworkTask[]
}

type FakeRedis = {
    set: jest.Mock
    get: jest.Mock
    keys: jest.Mock
    del: jest.Mock
}

const makeFakeRedis = (): FakeRedis => {
    const store = new Map<string, string>()

    return {
        set: jest.fn(async (key: string, value: string) => {
            store.set(key, value)
            return 'OK'
        }),
        get: jest.fn(async (key: string) => {
            return store.has(key) ? (store.get(key) as string) : null
        }),
        keys: jest.fn(async (pattern: string) => {
            const prefix = pattern.replace('*', '')
            return Array.from(store.keys()).filter((key) => key.startsWith(prefix))
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

const matchesWhere = <T extends Record<string, any>>(row: T, where: Record<string, any>): boolean => {
    return Object.entries(where).every(([key, value]) => row[key] === value)
}

const makeInMemoryDataSource = (state: InMemoryState): DataSource => {
    let sessionSeq = state.sessions.length
    let taskSeq = state.tasks.length

    const userRepo = {
        findOneBy: jest.fn(async (where: Partial<User>) => state.users.find((row) => matchesWhere(row as any, where as any)) || null)
    }

    const sessionRepo = {
        create: jest.fn((data: Partial<CoworkSession>) => data as CoworkSession),
        save: jest.fn(async (entityOrArray: CoworkSession | CoworkSession[]) => {
            const saveOne = (entity: CoworkSession) => {
                const payload = { ...entity } as CoworkSession
                if (!payload.id) {
                    sessionSeq += 1
                    payload.id = `s-${sessionSeq}`
                }
                payload.createdDate = payload.createdDate || new Date('2026-04-15T00:00:00.000Z')
                payload.updatedDate = new Date('2026-04-15T00:00:00.000Z')

                const idx = state.sessions.findIndex((row) => row.id === payload.id)
                if (idx >= 0) state.sessions[idx] = payload
                else state.sessions.push(payload)
                return payload
            }

            if (Array.isArray(entityOrArray)) return entityOrArray.map(saveOne)
            return saveOne(entityOrArray)
        }),
        findBy: jest.fn(async (where: Partial<CoworkSession>) => state.sessions.filter((row) => matchesWhere(row as any, where as any))),
        findOneBy: jest.fn(
            async (where: Partial<CoworkSession>) => state.sessions.find((row) => matchesWhere(row as any, where as any)) || null
        )
    }

    const taskRepo = {
        create: jest.fn((data: Partial<CoworkTask>) => data as CoworkTask),
        save: jest.fn(async (entityOrArray: CoworkTask | CoworkTask[]) => {
            const saveOne = (entity: CoworkTask) => {
                const payload = { ...entity } as CoworkTask
                if (!payload.id) {
                    taskSeq += 1
                    payload.id = `task-${taskSeq}`
                }
                payload.createdDate = payload.createdDate || new Date('2026-04-15T00:00:00.000Z')
                payload.updatedDate = new Date('2026-04-15T00:00:00.000Z')

                const idx = state.tasks.findIndex((row) => row.id === payload.id)
                if (idx >= 0) state.tasks[idx] = payload
                else state.tasks.push(payload)
                return payload
            }

            if (Array.isArray(entityOrArray)) return entityOrArray.map(saveOne)
            return saveOne(entityOrArray)
        }),
        findBy: jest.fn(async (where: Partial<CoworkTask>) => state.tasks.filter((row) => matchesWhere(row as any, where as any))),
        findOneBy: jest.fn(async (where: Partial<CoworkTask>) => state.tasks.find((row) => matchesWhere(row as any, where as any)) || null),
        findOne: jest.fn(async ({ where }: { where: Partial<CoworkTask> | Partial<CoworkTask>[] }) => {
            if (Array.isArray(where)) {
                for (const clause of where) {
                    const found = state.tasks.find((row) => matchesWhere(row as any, clause as any))
                    if (found) return found
                }
                return null
            }
            return state.tasks.find((row) => matchesWhere(row as any, where as any)) || null
        })
    }

    return {
        getRepository: jest.fn((entity: unknown) => {
            if (entity === User) return userRepo
            if (entity === CoworkSession) return sessionRepo
            if (entity === CoworkTask) return taskRepo
            throw new Error(`Unknown repository request: ${String(entity)}`)
        })
    } as unknown as DataSource
}

const makeDag = (): TaskDAG => ({
    goal: 'Launch feature',
    tasks: [
        {
            id: 't1',
            name: 'Task 1',
            description: 'Do task 1',
            agentPersona: 'researcher',
            dependencies: [],
            status: 'pending'
        },
        {
            id: 't2',
            name: 'Task 2',
            description: 'Do task 2',
            agentPersona: 'coder',
            dependencies: ['t1'],
            status: 'pending'
        },
        {
            id: 't3',
            name: 'Task 3',
            description: 'Do task 3',
            agentPersona: 'analyst',
            dependencies: ['t1'],
            status: 'pending'
        }
    ]
})

describe('TC-1.8 Free user monthly limit', () => {
    it('throws 402 and creates no records when a free user attempts a 4th session in the same month', async () => {
        const state: InMemoryState = {
            users: [{ uid: 'u1', email: 'a@b.com', subscription_type: 'free' } as User],
            sessions: [
                { id: 's1', userId: 'u1', createdDate: new Date('2026-04-01T00:00:00.000Z') } as CoworkSession,
                { id: 's2', userId: 'u1', createdDate: new Date('2026-04-10T00:00:00.000Z') } as CoworkSession,
                { id: 's3', userId: 'u1', createdDate: new Date('2026-04-20T00:00:00.000Z') } as CoworkSession
            ],
            tasks: []
        }

        const dataSource = makeInMemoryDataSource(state)
        const decomposeGoalFn = jest.fn(async () => makeDag())

        const service = new CoworkOrchestratorService({
            appDataSource: dataSource,
            decomposeGoalFn,
            now: () => new Date('2026-04-25T00:00:00.000Z')
        })

        await expect(
            service.createCoworkSession({
                tenantId: 'tenant-1',
                userId: 'u1',
                goal: 'Goal',
                selectedChatModel: { provider: 'openai', modelName: 'gpt-4o' }
            })
        ).rejects.toMatchObject({ statusCode: StatusCodes.PAYMENT_REQUIRED } as Partial<InternalTHubError>)

        expect(decomposeGoalFn).not.toHaveBeenCalled()
        expect(state.sessions).toHaveLength(3)
        expect(state.tasks).toHaveLength(0)
    })
})

describe('TC-1.9 DAG statuses and initial queueing', () => {
    it('marks root task as ready, children as pending, and queues only ready tasks on start', async () => {
        const state: InMemoryState = {
            users: [{ uid: 'u1', email: 'a@b.com', subscription_type: 'pro' } as User],
            sessions: [],
            tasks: []
        }
        const queue = {
            addJob: jest.fn(async () => ({ id: 'job-1' }))
        }

        const dataSource = makeInMemoryDataSource(state)
        const service = new CoworkOrchestratorService({
            appDataSource: dataSource,
            queue,
            decomposeGoalFn: async () => makeDag()
        })

        const created = await service.createCoworkSession({
            tenantId: 'tenant-1',
            userId: 'u1',
            goal: 'Goal',
            selectedChatModel: { provider: 'openai', modelName: 'gpt-4o' }
        })

        const taskByPlanner = new Map(created.tasks.map((task) => [task.skillId, task]))
        expect(taskByPlanner.get('t1')?.status).toBe(CoworkTaskStatus.READY)
        expect(taskByPlanner.get('t2')?.status).toBe(CoworkTaskStatus.PENDING)
        expect(taskByPlanner.get('t3')?.status).toBe(CoworkTaskStatus.PENDING)

        await service.startCoworkSession(created.session.id)
        expect(queue.addJob).toHaveBeenCalledTimes(1)
        expect((queue.addJob as jest.Mock).mock.calls[0][0].taskId).toBe(taskByPlanner.get('t1')?.id)
    })
})

describe('TC-1.10 queueUnblocked queues all unblocked tasks', () => {
    it('queues both t2 and t3 after t1 completes', async () => {
        const state: InMemoryState = {
            users: [{ uid: 'u1', email: 'a@b.com', subscription_type: 'pro' } as User],
            sessions: [],
            tasks: []
        }
        const queue = {
            addJob: jest.fn(async () => ({ id: 'job-1' }))
        }

        const dataSource = makeInMemoryDataSource(state)
        const service = new CoworkOrchestratorService({
            appDataSource: dataSource,
            queue,
            decomposeGoalFn: async () => makeDag()
        })

        const created = await service.createCoworkSession({
            tenantId: 'tenant-1',
            userId: 'u1',
            goal: 'Goal',
            selectedChatModel: { provider: 'openai', modelName: 'gpt-4o' }
        })

        const taskByPlanner = new Map(created.tasks.map((task) => [task.skillId, task]))
        taskByPlanner.get('t1')!.status = CoworkTaskStatus.COMPLETED
        taskByPlanner.get('t1')!.outputArtifact = JSON.stringify({ content: 'done t1' })

        const queued = await service.queueUnblocked(created.session.id)

        expect(queued).toHaveLength(2)
        expect(queued.some((task) => task.skillId === 't2')).toBe(true)
        expect(queued.some((task) => task.skillId === 't3')).toBe(true)
        expect(taskByPlanner.get('t2')!.status).toBe(CoworkTaskStatus.RUNNING)
        expect(taskByPlanner.get('t3')!.status).toBe(CoworkTaskStatus.RUNNING)
    })
})

describe('TC-1.11 Token budget exceeded', () => {
    it('emits budget exceeded event, marks session partial, and stops queueing', async () => {
        const state: InMemoryState = {
            users: [{ uid: 'u1', email: 'a@b.com', subscription_type: 'pro' } as User],
            sessions: [],
            tasks: []
        }
        const queue = {
            addJob: jest.fn(async () => ({ id: 'job-1' }))
        }
        const events: Array<{ eventType: string; data: any }> = []
        const eventStreamer = {
            streamCustomEvent: jest.fn((_: string, eventType: string, data: any) => {
                events.push({ eventType, data })
            })
        }

        const dataSource = makeInMemoryDataSource(state)
        const service = new CoworkOrchestratorService({
            appDataSource: dataSource,
            queue,
            eventStreamer,
            decomposeGoalFn: async () => makeDag()
        })

        const created = await service.createCoworkSession({
            tenantId: 'tenant-1',
            userId: 'u1',
            goal: 'Goal',
            selectedChatModel: { provider: 'openai', modelName: 'gpt-4o' },
            maxTokenBudget: 100
        })

        created.session.totalTokensUsed = 100
        created.tasks.find((t) => t.skillId === 't1')!.status = CoworkTaskStatus.COMPLETED

        const queued = await service.queueUnblocked(created.session.id)
        expect(queued).toHaveLength(0)
        expect(queue.addJob).not.toHaveBeenCalled()
        expect(created.session.status).toBe(CoworkSessionStatus.PARTIAL)
        expect(events.some((event) => event.eventType === 'cowork.session.budget_exceeded')).toBe(true)
    })
})

describe('TC-1.12 Context includes dependency outputs', () => {
    it('builds task input context with dependency heading and content', async () => {
        const state: InMemoryState = {
            users: [{ uid: 'u1', email: 'a@b.com', subscription_type: 'pro' } as User],
            sessions: [],
            tasks: []
        }
        const queue = {
            addJob: jest.fn(async () => ({ id: 'job-1' }))
        }
        const redis = makeFakeRedis()
        const buildPrompt = jest.fn(async (_persona, _name, _description, inputContext) => `PROMPT\n${inputContext}`)
        const executeWithAgentflow = jest.fn(async () => ({ content: 'child output', tokensUsed: 10, type: 'text' as const }))

        const dataSource = makeInMemoryDataSource(state)
        const service = new CoworkOrchestratorService({
            appDataSource: dataSource,
            queue,
            redisClient: redis,
            buildPrompt,
            executeWithAgentflow,
            decomposeGoalFn: async () => makeDag()
        })

        const created = await service.createCoworkSession({
            tenantId: 'tenant-1',
            userId: 'u1',
            goal: 'Goal',
            selectedChatModel: { provider: 'openai', modelName: 'gpt-4o' }
        })

        const t1 = created.tasks.find((task) => task.skillId === 't1')!
        const t2 = created.tasks.find((task) => task.skillId === 't2')!

        t1.status = CoworkTaskStatus.COMPLETED
        t1.outputArtifact = JSON.stringify({ type: 'text', content: 'output from t1' })
        t2.status = CoworkTaskStatus.RUNNING

        await service.executeCoworkTask(created.session.id, t2.id)

        expect(t2.inputContext).toContain('## Output from task')
        expect(t2.inputContext).toContain('output from t1')
        expect(buildPrompt).toHaveBeenCalled()
    })
})

describe('TC-1.13 Redis persistence', () => {
    it('retains shared memory across orchestrator restarts', async () => {
        const state: InMemoryState = {
            users: [{ uid: 'u1', email: 'a@b.com', subscription_type: 'pro' } as User],
            sessions: [],
            tasks: []
        }
        const dataSource = makeInMemoryDataSource(state)
        const redis = makeFakeRedis()

        const serviceA = new CoworkOrchestratorService({
            appDataSource: dataSource,
            redisClient: redis
        })
        await serviceA.setSharedMemory('session-1', 'task_output:t1', 'persist-me')

        const serviceB = new CoworkOrchestratorService({
            appDataSource: dataSource,
            redisClient: redis
        })
        const restored = await serviceB.getSharedMemory('session-1', 'task_output:t1')
        expect(restored).toBe('persist-me')
    })
})
