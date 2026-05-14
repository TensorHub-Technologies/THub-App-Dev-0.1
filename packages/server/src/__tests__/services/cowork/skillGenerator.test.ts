import { DataSource } from 'typeorm'
import { captureSkill } from '../../../services/cowork/skillGenerator'
import { CoworkTask } from '../../../database/entities/CoworkTask'
import { CoworkSkill } from '../../../database/entities/CoworkSkill'
import { TaskOutput } from '../../../services/cowork/CoworkTypes'

const makeTask = (overrides: Partial<CoworkTask> = {}): CoworkTask =>
    ({
        id: 'task-1',
        name: 'Auth middleware handler',
        description: 'Build JWT auth middleware',
        agentPersona: 'coder',
        ...overrides
    } as CoworkTask)

const makeOutput = (overrides: Partial<TaskOutput> = {}): TaskOutput => ({
    taskId: 'task-1',
    type: 'text',
    content: 'Here is the complete implementation with error handling and tests included.',
    model: 'claude-3-5-sonnet-20241022',
    costUsd: 0.002,
    latencyMs: 1200,
    ...overrides
})

const makeSkillRepo = (existingSkills: CoworkSkill[] = []) => {
    const saved: CoworkSkill[] = []
    return {
        find: jest.fn().mockResolvedValue(existingSkills),
        save: jest.fn().mockImplementation(async (entity: CoworkSkill) => {
            saved.push({ ...entity })
            return entity
        }),
        create: jest.fn().mockImplementation((data: Partial<CoworkSkill>) => data as CoworkSkill),
        _saved: saved
    }
}

const makeDataSource = (repo: ReturnType<typeof makeSkillRepo>) =>
    ({ getRepository: jest.fn().mockReturnValue(repo) } as unknown as DataSource)

describe('TC-3.8 New skill created on first capture', () => {
    it('creates a new CoworkSkill row with historicSuccessRate=1.0 and usageCount=1 when no similar skill exists', async () => {
        const repo = makeSkillRepo([])
        const ds = makeDataSource(repo)

        await captureSkill(makeTask(), 'You are an expert engineer.', makeOutput(), ds)

        expect(repo.save).toHaveBeenCalledTimes(1)
        const created = repo._saved[0]
        expect(created.historicSuccessRate).toBe(1.0)
        expect(created.usageCount).toBe(1)
        expect(created.category).toBe('coder')
        expect(created.name).toBe('Auth middleware handler')
    })

    it('does not create a skill when output content is shorter than 50 chars', async () => {
        const repo = makeSkillRepo([])
        const ds = makeDataSource(repo)

        await captureSkill(makeTask(), 'sys prompt', makeOutput({ content: 'short' }), ds)

        expect(repo.save).not.toHaveBeenCalled()
    })
})

describe('TC-3.9 Running averages updated on similar skill', () => {
    it('updates usageCount and historicSuccessRate as running averages when substring match found', async () => {
        const existing: CoworkSkill = {
            id: 'skill-1',
            name: 'Auth middleware',
            description: 'JWT auth',
            category: 'coder',
            systemPrompt: 'You are a coder.',
            requiredTools: null,
            preferredModel: null,
            historicSuccessRate: 0.8,
            avgCost: null,
            avgLatencyMs: null,
            usageCount: 4,
            tenantId: null,
            isPublic: false,
            tags: null,
            createdDate: new Date(),
            updatedDate: new Date()
        }

        // task.name = 'Auth middleware handler'
        // s.name.slice(0,20) = 'auth middleware' (14 chars)
        // 'auth middleware handler'.includes('auth middleware') → true → MATCH
        const repo = makeSkillRepo([existing])
        const ds = makeDataSource(repo)

        await captureSkill(makeTask({ name: 'Auth middleware handler' }), 'sys prompt', makeOutput(), ds)

        expect(repo.save).toHaveBeenCalledTimes(1)
        const updated = repo._saved[0]
        expect(updated.usageCount).toBe(5)
        // (0.8 * 4 + 1) / 5 = 4.2 / 5 = 0.84
        expect(updated.historicSuccessRate).toBeCloseTo(0.84, 10)
    })

    it('updates avgCost and avgLatencyMs as running averages', async () => {
        const existing: CoworkSkill = {
            id: 'skill-1',
            name: 'Auth middleware',
            description: 'JWT auth',
            category: 'coder',
            systemPrompt: '',
            requiredTools: null,
            preferredModel: null,
            historicSuccessRate: 1.0,
            avgCost: 0.004,
            avgLatencyMs: 1000,
            usageCount: 2,
            tenantId: null,
            isPublic: false,
            tags: null,
            createdDate: new Date(),
            updatedDate: new Date()
        }

        const repo = makeSkillRepo([existing])
        const ds = makeDataSource(repo)

        await captureSkill(makeTask({ name: 'Auth middleware handler' }), 'sys prompt', makeOutput({ costUsd: 0.006, latencyMs: 2000 }), ds)

        const updated = repo._saved[0]
        // avgCost = (0.004 * 2 + 0.006) / 3 = 0.014 / 3 ≈ 0.00467
        expect(updated.avgCost).toBeCloseTo(0.00467, 4)
        // avgLatencyMs = round((1000 * 2 + 2000) / 3) = round(4000 / 3) = round(1333.3) = 1333
        expect(updated.avgLatencyMs).toBe(1333)
    })
})

describe('TC-3.10 captureSkill never throws', () => {
    it('swallows DB errors and does not propagate exceptions', async () => {
        const ds = {
            getRepository: jest.fn().mockImplementation(() => {
                throw new Error('DB unavailable')
            })
        } as unknown as DataSource

        await expect(captureSkill(makeTask(), 'sys prompt', makeOutput(), ds)).resolves.toBeUndefined()
    })

    it('swallows save errors and does not propagate exceptions', async () => {
        const repo = {
            find: jest.fn().mockResolvedValue([]),
            save: jest.fn().mockRejectedValue(new Error('save failed')),
            create: jest.fn().mockImplementation((d: any) => d)
        }
        const ds = { getRepository: jest.fn().mockReturnValue(repo) } as unknown as DataSource

        await expect(captureSkill(makeTask(), 'sys prompt', makeOutput(), ds)).resolves.toBeUndefined()
    })
})
