import { Request, Response, NextFunction } from 'express'
import promptsController from '../../controllers/cowork/prompts'
import skillsController from '../../controllers/cowork/skills'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

jest.mock('../../utils/getRunningExpressApp', () => ({
    getRunningExpressApp: jest.fn()
}))

const mockedGetRunningExpressApp = getRunningExpressApp as jest.MockedFunction<typeof getRunningExpressApp>

const makeResponse = () => {
    const res: Partial<Response> = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res as Response
}

const makeRequest = (overrides: Partial<Request> = {}) => {
    return {
        body: {},
        params: {},
        query: {},
        ...overrides
    } as Request
}

const makeAppServer = (repo: any) =>
    ({
        AppDataSource: {
            getRepository: jest.fn(() => repo)
        }
    } as any)

describe('cowork prompt controller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('TC-S2-3.9 lists built-in and tenant prompts', async () => {
        const prompts = [
            { id: 'builtin-coder', persona: 'coder', tenantId: null },
            { id: 'builtin-researcher', persona: 'researcher', tenantId: null },
            { id: 'builtin-analyst', persona: 'analyst', tenantId: null },
            { id: 'builtin-reviewer', persona: 'reviewer', tenantId: null },
            { id: 'builtin-architect', persona: 'architect', tenantId: null },
            { id: 'builtin-writer', persona: 'writer', tenantId: null },
            { id: 'tenant-a-custom-coder', persona: 'coder', tenantId: 'tenant-a' }
        ]
        const getMany = jest.fn(async () => prompts)
        const addOrderBy = jest.fn(() => ({ getMany }))
        const orderBy = jest.fn(() => ({ addOrderBy }))
        const where = jest.fn(() => ({ orderBy }))
        const repo = {
            createQueryBuilder: jest.fn(() => ({ where }))
        }
        const req = makeRequest({ user: { id: 'tenant-a' } as Express.User })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.listPrompts(req, res, next)

        expect(where).toHaveBeenCalledWith('p.tenantId IS NULL OR p.tenantId = :tenantId', { tenantId: 'tenant-a' })
        expect(res.json).toHaveBeenCalledWith({ data: prompts, total: 7 })
        expect(next).not.toHaveBeenCalled()
    })

    it('TC-S2-3.16 auto-increments prompt versions on create', async () => {
        const repo = {
            findOne: jest.fn(async () => ({ version: 1 })),
            create: jest.fn((data) => data),
            save: jest.fn(async (entity) => ({ id: 'prompt-2', ...entity }))
        }
        const req = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            body: { persona: 'researcher', templateContent: 'Research {{topic}}' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.createPrompt(req, res, next)

        expect(repo.findOne).toHaveBeenCalledWith({
            where: { persona: 'researcher', tenantId: 'tenant-1' },
            order: { version: 'DESC' }
        })
        expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ version: 2, tenantId: 'tenant-1' }))
        expect(res.status).toHaveBeenCalledWith(201)
        expect(next).not.toHaveBeenCalled()
    })

    it('gets a visible built-in prompt by id', async () => {
        const prompt = {
            id: 'builtin-researcher',
            persona: 'researcher',
            tenantId: null,
            templateContent: 'Research {{topic}}'
        }
        const repo = {
            findOneBy: jest.fn(async () => prompt)
        }
        const req = makeRequest({
            user: { id: 'tenant-a' } as Express.User,
            params: { id: 'builtin-researcher' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.getPrompt(req, res, next)

        expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'builtin-researcher' })
        expect(res.json).toHaveBeenCalledWith(prompt)
        expect(next).not.toHaveBeenCalled()
    })

    it('blocks reading another tenants prompt by id', async () => {
        const repo = {
            findOneBy: jest.fn(async () => ({
                id: 'tenant-a-private-prompt',
                persona: 'coder',
                tenantId: 'tenant-a',
                templateContent: 'Tenant A coder prompt'
            }))
        }
        const req = makeRequest({
            user: { id: 'tenant-b' } as Express.User,
            params: { id: 'tenant-a-private-prompt' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.getPrompt(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, message: 'Not your prompt' }))
        expect(res.json).not.toHaveBeenCalled()
    })

    it('creates tenant-owned prompts at version 1 when no tenant prompt exists for the persona', async () => {
        const repo = {
            findOne: jest.fn(async () => null),
            create: jest.fn((data) => data),
            save: jest.fn(async (entity) => ({ id: 'tenant-a-coder-v1', ...entity }))
        }
        const req = makeRequest({
            user: { id: 'tenant-a' } as Express.User,
            body: {
                persona: 'coder',
                templateContent: 'Write code for {{goal}}',
                variableMappings: { goal: 'User goal' },
                targetModel: 'gpt-4o-mini',
                fewShotExamples: [{ input: 'API', output: 'Route handler' }]
            }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.createPrompt(req, res, next)

        expect(repo.save).toHaveBeenCalledWith(
            expect.objectContaining({
                persona: 'coder',
                tenantId: 'tenant-a',
                version: 1,
                isDefault: false,
                targetModel: 'gpt-4o-mini',
                variableMappings: JSON.stringify({
                    goal: 'User goal',
                    __fewShot: [{ input: 'API', output: 'Route handler' }]
                })
            })
        )
        expect(res.status).toHaveBeenCalledWith(201)
        expect(next).not.toHaveBeenCalled()
    })

    it('TC-S2-3.13 blocks edits to built-in prompts', async () => {
        const repo = {
            findOneBy: jest.fn(async () => ({ id: 'builtin-coder', persona: 'coder', tenantId: null }))
        }
        const req = makeRequest({
            user: { id: 'tenant-a' } as Express.User,
            params: { id: 'builtin-coder' },
            body: { templateContent: 'updated coder prompt' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.updatePrompt(req, res, next)

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 403,
                message: 'Cannot edit built-in prompts. Create a new version instead.'
            })
        )
    })

    it('TC-S2-3.10 setting a prompt as default unsets other tenant defaults for that persona', async () => {
        const execute = jest.fn(async () => ({}))
        const where = jest.fn(() => ({ execute }))
        const set = jest.fn(() => ({ where }))
        const update = jest.fn(() => ({ set }))
        const repo = {
            findOneBy: jest.fn(async () => ({ id: 'prompt-b', tenantId: 'tenant-a', persona: 'coder', isDefault: false })),
            createQueryBuilder: jest.fn(() => ({ update })),
            save: jest.fn(async (entity) => entity)
        }
        const req = makeRequest({
            user: { id: 'tenant-a' } as Express.User,
            params: { id: 'prompt-b' },
            body: { isDefault: true }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.updatePrompt(req, res, next)

        expect(where).toHaveBeenCalledWith('tenantId = :tenantId AND persona = :persona AND id != :id', {
            tenantId: 'tenant-a',
            persona: 'coder',
            id: 'prompt-b'
        })
        expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ isDefault: true }))
        expect(next).not.toHaveBeenCalled()
    })

    it('updates a tenant-owned prompt body and preserved few-shot mappings', async () => {
        const prompt = {
            id: 'tenant-a-coder',
            tenantId: 'tenant-a',
            persona: 'coder',
            templateContent: 'Old coder prompt',
            targetModel: null,
            variableMappings: JSON.stringify({ __fewShot: ['old example'] }),
            isDefault: false
        }
        const repo = {
            findOneBy: jest.fn(async () => prompt),
            save: jest.fn(async (entity) => entity)
        }
        const req = makeRequest({
            user: { id: 'tenant-a' } as Express.User,
            params: { id: 'tenant-a-coder' },
            body: { templateContent: 'New coder prompt', targetModel: 'gpt-4.1', fewShotExamples: ['new example'] }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.updatePrompt(req, res, next)

        expect(repo.save).toHaveBeenCalledWith(
            expect.objectContaining({
                templateContent: 'New coder prompt',
                targetModel: 'gpt-4.1',
                variableMappings: JSON.stringify({ __fewShot: ['new example'] })
            })
        )
        expect(next).not.toHaveBeenCalled()
    })

    it('TC-S2-3.14 blocks deleting active default prompts', async () => {
        const repo = {
            findOneBy: jest.fn(async () => ({ id: 'prompt-a', tenantId: 'tenant-a', isDefault: true })),
            delete: jest.fn()
        }
        const req = makeRequest({
            user: { id: 'tenant-a' } as Express.User,
            params: { id: 'prompt-a' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.deletePrompt(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }))
        expect(repo.delete).not.toHaveBeenCalled()
    })

    it('blocks deleting another tenants prompt', async () => {
        const repo = {
            findOneBy: jest.fn(async () => ({ id: 'tenant-a-prompt', tenantId: 'tenant-a', isDefault: false })),
            delete: jest.fn()
        }
        const req = makeRequest({
            user: { id: 'tenant-b' } as Express.User,
            params: { id: 'tenant-a-prompt' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.deletePrompt(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, message: 'Not your prompt' }))
        expect(repo.delete).not.toHaveBeenCalled()
    })

    it('deletes tenant-owned non-default prompts', async () => {
        const repo = {
            findOneBy: jest.fn(async () => ({ id: 'tenant-a-draft', tenantId: 'tenant-a', isDefault: false })),
            delete: jest.fn(async () => ({ affected: 1 }))
        }
        const req = makeRequest({
            user: { id: 'tenant-a' } as Express.User,
            params: { id: 'tenant-a-draft' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await promptsController.deletePrompt(req, res, next)

        expect(repo.delete).toHaveBeenCalledWith('tenant-a-draft')
        expect(res.json).toHaveBeenCalledWith({ message: 'Prompt deleted' })
        expect(next).not.toHaveBeenCalled()
    })
})

describe('cowork skill controller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('TC-S2-3.12 returns only public marketplace skills ordered by success rate', async () => {
        const data = [
            { id: 's1', name: 'Code Review', isPublic: true, tenantId: 'tenant-a', historicSuccessRate: 0.94 },
            { id: 's3', name: 'Research Brief', isPublic: true, tenantId: 'tenant-b', historicSuccessRate: 0.81 }
        ]
        const getManyAndCount = jest.fn(async () => [data, 2])
        const take = jest.fn(() => ({ getManyAndCount }))
        const skip = jest.fn(() => ({ take }))
        const addOrderBy = jest.fn(() => ({ skip }))
        const orderBy = jest.fn(() => ({ addOrderBy }))
        const where = jest.fn(() => ({ orderBy }))
        const repo = {
            createQueryBuilder: jest.fn(() => ({ where }))
        }
        const req = makeRequest({ query: {} })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await skillsController.getMarketplace(req, res, next)

        expect(where).toHaveBeenCalledWith('s.isPublic = :isPublic', { isPublic: true })
        expect(orderBy).toHaveBeenCalledWith('s.historicSuccessRate', 'DESC')
        expect(addOrderBy).toHaveBeenCalledWith('s.usageCount', 'DESC')
        expect(res.json).toHaveBeenCalledWith({ data, total: 2, page: 1, limit: 20 })
        expect(next).not.toHaveBeenCalled()
    })

    it('publishes a global skill by assigning the caller tenant id', async () => {
        const skill = { id: 'skill-1', tenantId: null, isPublic: false, name: 'Research' }
        const repo = {
            findOneBy: jest.fn(async () => skill),
            save: jest.fn(async (entity) => entity)
        }
        const req = makeRequest({
            user: { id: 'tenant-1' } as Express.User,
            params: { id: 'skill-1' },
            body: { isPublic: true }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await skillsController.updateSkill(req, res, next)

        expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ isPublic: true, tenantId: 'tenant-1' }))
        expect(next).not.toHaveBeenCalled()
    })

    it('updates tenant-owned skill metadata', async () => {
        const skill = {
            id: 'tenant-a-skill',
            tenantId: 'tenant-a',
            name: 'Old Skill',
            description: null,
            systemPrompt: 'Old prompt',
            tags: null,
            preferredModel: null,
            isPublic: false
        }
        const repo = {
            findOneBy: jest.fn(async () => skill),
            save: jest.fn(async (entity) => entity)
        }
        const req = makeRequest({
            user: { id: 'tenant-a' } as Express.User,
            params: { id: 'tenant-a-skill' },
            body: {
                name: 'Private Research',
                description: 'Summarize web sources',
                systemPrompt: 'Research with citations',
                tags: ['research', 'web'],
                preferredModel: 'gpt-4.1-mini',
                isPublic: true
            }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await skillsController.updateSkill(req, res, next)

        expect(repo.save).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Private Research',
                description: 'Summarize web sources',
                systemPrompt: 'Research with citations',
                tags: JSON.stringify(['research', 'web']),
                preferredModel: 'gpt-4.1-mini',
                isPublic: true,
                tenantId: 'tenant-a'
            })
        )
        expect(next).not.toHaveBeenCalled()
    })

    it('blocks non-superadmin edits to global skills outside publish claiming', async () => {
        const repo = {
            findOneBy: jest.fn(async () => ({ id: 'skill-1', tenantId: null, isPublic: false, name: 'Research' })),
            save: jest.fn()
        }
        const req = makeRequest({
            user: { id: 'tenant-1', role: 'member' } as Express.User,
            params: { id: 'skill-1' },
            body: { name: 'New name' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await skillsController.updateSkill(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }))
        expect(repo.save).not.toHaveBeenCalled()
    })

    it('TC-S2-3.11 clones marketplace skills with fresh private stats', async () => {
        const source = {
            id: 'source',
            name: 'Web Research',
            description: 'Finds sources',
            category: 'research',
            systemPrompt: 'Research',
            requiredTools: '[]',
            preferredModel: 'gpt',
            tags: '["web"]',
            avgCost: 1,
            avgLatencyMs: 100,
            historicSuccessRate: 0.94,
            usageCount: 128,
            tenantId: 'tenant-a',
            isPublic: true
        }
        const repo = {
            findOneBy: jest.fn(async () => source),
            create: jest.fn((data) => data),
            save: jest.fn(async (entity) => ({ id: 'clone', ...entity }))
        }
        const req = makeRequest({
            user: { id: 'tenant-b' } as Express.User,
            params: { id: 'source' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await skillsController.cloneSkill(req, res, next)

        expect(repo.save).toHaveBeenCalledWith(
            expect.objectContaining({
                tenantId: 'tenant-b',
                historicSuccessRate: 0,
                usageCount: 0,
                isPublic: false
            })
        )
        expect(res.status).toHaveBeenCalledWith(201)
        expect(next).not.toHaveBeenCalled()
    })

    it('blocks non-superadmin deletes of global skills', async () => {
        const repo = {
            findOneBy: jest.fn(async () => ({ id: 'skill-1', tenantId: null })),
            delete: jest.fn()
        }
        const req = makeRequest({
            user: { id: 'tenant-b', role: 'member' } as Express.User,
            params: { id: 'skill-1' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await skillsController.deleteSkill(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }))
        expect(repo.delete).not.toHaveBeenCalled()
    })

    it('TC-S2-3.15 blocks deleting another tenants skill', async () => {
        const repo = {
            findOneBy: jest.fn(async () => ({ id: 'skill-1', tenantId: 'tenant-a' })),
            delete: jest.fn()
        }
        const req = makeRequest({
            user: { id: 'tenant-b' } as Express.User,
            params: { id: 'skill-1' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await skillsController.deleteSkill(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }))
        expect(repo.delete).not.toHaveBeenCalled()
    })

    it('deletes tenant-owned skills', async () => {
        const repo = {
            findOneBy: jest.fn(async () => ({ id: 'tenant-a-skill', tenantId: 'tenant-a' })),
            delete: jest.fn(async () => ({ affected: 1 }))
        }
        const req = makeRequest({
            user: { id: 'tenant-a' } as Express.User,
            params: { id: 'tenant-a-skill' }
        })
        const res = makeResponse()
        const next = jest.fn() as NextFunction

        mockedGetRunningExpressApp.mockReturnValue(makeAppServer(repo))

        await skillsController.deleteSkill(req, res, next)

        expect(repo.delete).toHaveBeenCalledWith('tenant-a-skill')
        expect(res.json).toHaveBeenCalledWith({ message: 'Skill deleted' })
        expect(next).not.toHaveBeenCalled()
    })
})
