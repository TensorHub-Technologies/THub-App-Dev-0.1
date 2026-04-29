import { captureSkill, findMatchingSkill } from '../../../services/cowork/skillGenerator'
import { DataSource } from 'typeorm'
import { CoworkTask } from '../../../database/entities/CoworkTask'
import { CoworkSkill } from '../../../database/entities/CoworkSkill'
import { TaskOutput } from '../../../services/cowork/CoworkTypes'

jest.mock('../../../utils/logger', () => require('../../__mocks__/logger'))

const makeSkill = (overrides: Partial<CoworkSkill> = {}): CoworkSkill =>
    ({
        id: 'skill-1',
        name: 'Write auth handler',
        description: 'auth desc',
        category: 'coder',
        systemPrompt: 'You are a coder',
        historicSuccessRate: 0.8,
        avgCost: 0.01,
        avgLatencyMs: 500,
        usageCount: 4,
        tags: '["coder"]',
        isPublic: false,
        preferredModel: 'gpt-4',
        tenantId: undefined,
        createdDate: new Date(),
        updatedDate: new Date(),
        requiredTools: null,
        ...overrides
    } as CoworkSkill)

const makeTask = (overrides: Partial<CoworkTask> = {}): CoworkTask =>
    ({
        id: 'task-1',
        name: 'Write auth handler',
        description: 'JWT handler',
        agentPersona: 'coder',
        sessionId: 'sess-1',
        status: 'completed' as any,
        ...overrides
    } as CoworkTask)

const makeOutput = (overrides: Partial<TaskOutput> = {}): TaskOutput => ({
    type: 'text',
    content: 'x'.repeat(100),
    model: 'gpt-4',
    costUsd: 0.02,
    latencyMs: 600,
    ...overrides
})

const makeMockRepo = (findResult: CoworkSkill[] = []) => ({
    find: jest.fn().mockResolvedValue(findResult),
    save: jest.fn().mockImplementation(async (e: any) => e),
    create: jest.fn().mockImplementation((d: any) => d as CoworkSkill)
})

const makeDs = (repo: ReturnType<typeof makeMockRepo>) => ({ getRepository: jest.fn().mockReturnValue(repo) } as unknown as DataSource)

// ── TC-3.8 New skill created on first capture ─────────────────────────────────

describe('TC-3.8 New skill created on first capture', () => {
    it('creates new CoworkSkill with historicSuccessRate=1.0 and usageCount=1 when no similar skill exists', async () => {
        const repo = makeMockRepo([])
        const ds = makeDs(repo)
        const task = makeTask()
        const output = makeOutput()

        await captureSkill(task, 'system prompt', output, ds)

        expect(repo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Write auth handler',
                historicSuccessRate: 1.0,
                usageCount: 1,
                category: 'coder'
            })
        )
        expect(repo.save).toHaveBeenCalledTimes(1)
    })

    it('skips capture when text output is shorter than 50 chars', async () => {
        const repo = makeMockRepo([])
        const ds = makeDs(repo)
        const task = makeTask()
        const output = makeOutput({ content: 'short' })

        await captureSkill(task, 'system prompt', output, ds)

        expect(repo.save).not.toHaveBeenCalled()
    })
})

// ── TC-3.9 Running averages updated on similar skill ─────────────────────────

describe('TC-3.9 Running averages updated on similar skill', () => {
    it('updates usageCount and historicSuccessRate as running average', async () => {
        const existing = makeSkill({ name: 'Write auth handler', usageCount: 4, historicSuccessRate: 0.8 })
        const repo = makeMockRepo([existing])
        const ds = makeDs(repo)
        // 'write auth handler' (18 chars) is contained in the task name → triggers prefix match
        const task = makeTask({ name: 'Write auth handler middleware' })
        const output = makeOutput({ costUsd: 0.02, latencyMs: 600 })

        await captureSkill(task, 'sys', output, ds)

        const saved = repo.save.mock.calls[0][0]
        expect(saved.usageCount).toBe(5)
        expect(saved.historicSuccessRate).toBeCloseTo(0.84, 5)
    })

    it('updates avgCost running average', async () => {
        const existing = makeSkill({ name: 'Write auth handler', avgCost: 0.01, usageCount: 4 })
        const repo = makeMockRepo([existing])
        const ds = makeDs(repo)

        await captureSkill(makeTask({ name: 'Write auth handler middleware' }), 'sys', makeOutput({ costUsd: 0.02 }), ds)

        const saved = repo.save.mock.calls[0][0]
        expect(saved.avgCost).toBeCloseTo((0.01 * 4 + 0.02) / 5, 5)
    })
})

// ── TC-3.10 captureSkill never throws ────────────────────────────────────────

describe('TC-3.10 captureSkill never throws', () => {
    it('swallows DB error and does not propagate', async () => {
        const repo = makeMockRepo([])
        repo.find = jest.fn().mockRejectedValue(new Error('DB unavailable'))
        const ds = makeDs(repo)

        await expect(captureSkill(makeTask(), 'sys', makeOutput(), ds)).resolves.toBeUndefined()
    })
})

// ── findMatchingSkill ─────────────────────────────────────────────────────────

describe('findMatchingSkill', () => {
    it('returns null when no candidates exist', async () => {
        const repo = makeMockRepo([])
        const ds = makeDs(repo)

        const result = await findMatchingSkill('Write auth middleware', 'coder', ds)
        expect(result).toBeNull()
    })

    it('returns null when overlap <= 40%', async () => {
        const skill = makeSkill({ name: 'Deploy kubernetes cluster', historicSuccessRate: 0.9 })
        const repo = makeMockRepo([skill])
        const ds = makeDs(repo)

        const result = await findMatchingSkill('Write auth middleware', 'coder', ds)
        expect(result).toBeNull()
    })

    it('returns null when historicSuccessRate <= 0.7', async () => {
        const skill = makeSkill({ name: 'Write auth handler', historicSuccessRate: 0.5 })
        const repo = makeMockRepo([skill])
        const ds = makeDs(repo)

        const result = await findMatchingSkill('Write auth middleware', 'coder', ds)
        expect(result).toBeNull()
    })

    it('returns best match when overlap > 40% and success rate > 0.7', async () => {
        const skill = makeSkill({ name: 'Write auth handler', historicSuccessRate: 0.9 })
        const repo = makeMockRepo([skill])
        const ds = makeDs(repo)

        const result = await findMatchingSkill('Write auth middleware', 'coder', ds)
        expect(result).not.toBeNull()
        expect(result?.name).toBe('Write auth handler')
    })

    it('swallows DB error and returns null', async () => {
        const repo = makeMockRepo([])
        repo.find = jest.fn().mockRejectedValue(new Error('DB down'))
        const ds = makeDs(repo)

        await expect(findMatchingSkill('anything', 'coder', ds)).resolves.toBeNull()
    })
})
