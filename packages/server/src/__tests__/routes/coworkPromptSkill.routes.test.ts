import express, { NextFunction, Request, Response } from 'express'
import { Server } from 'http'
import { Socket } from 'net'
import request from 'supertest'
import coworkRouter from '../../routes/cowork'
import { CoworkPrompt } from '../../database/entities/CoworkPrompt'
import { CoworkSkill } from '../../database/entities/CoworkSkill'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

jest.mock('../../utils/getRunningExpressApp', () => ({
    getRunningExpressApp: jest.fn()
}))

const mockedGetRunningExpressApp = getRunningExpressApp as jest.MockedFunction<typeof getRunningExpressApp>
const openServers: Server[] = []
const openSockets = new Map<Server, Set<Socket>>()

type PromptRow = Partial<CoworkPrompt> & { id: string; persona: string; tenantId: string | null; version: number; isDefault: boolean }
type SkillRow = Partial<CoworkSkill> & {
    id: string
    name: string
    tenantId: string | null
    isPublic: boolean
    historicSuccessRate: number
    usageCount: number
}

const makePrompt = (overrides: Partial<PromptRow>): PromptRow => ({
    id: overrides.id || `prompt-${Math.random().toString(16).slice(2)}`,
    persona: overrides.persona || 'coder',
    templateContent: overrides.templateContent || 'Prompt content',
    variableMappings: overrides.variableMappings ?? null,
    targetModel: overrides.targetModel ?? null,
    version: overrides.version ?? 1,
    avgSuccessRate: overrides.avgSuccessRate ?? 0,
    isDefault: overrides.isDefault ?? false,
    tenantId: overrides.tenantId ?? null,
    createdDate: overrides.createdDate || new Date()
})

const makeSkill = (overrides: Partial<SkillRow>): SkillRow => ({
    id: overrides.id || `skill-${Math.random().toString(16).slice(2)}`,
    name: overrides.name || 'Skill',
    description: overrides.description ?? null,
    category: overrides.category ?? 'research',
    systemPrompt: overrides.systemPrompt || 'Skill prompt',
    requiredTools: overrides.requiredTools ?? null,
    preferredModel: overrides.preferredModel ?? null,
    historicSuccessRate: overrides.historicSuccessRate ?? 0,
    avgCost: overrides.avgCost ?? null,
    avgLatencyMs: overrides.avgLatencyMs ?? null,
    usageCount: overrides.usageCount ?? 0,
    tenantId: overrides.tenantId ?? null,
    isPublic: overrides.isPublic ?? false,
    tags: overrides.tags ?? null,
    createdDate: overrides.createdDate || new Date(),
    updatedDate: overrides.updatedDate || new Date()
})

const sortByField = <T extends Record<string, any>>(rows: T[], field: string, direction: 'ASC' | 'DESC') => {
    const key = field.split('.').pop() as string
    return [...rows].sort((left, right) => {
        if (left[key] === right[key]) return 0
        const result = left[key] > right[key] ? 1 : -1
        return direction === 'ASC' ? result : -result
    })
}

const matchesWhere = <T extends object>(row: T, where: Partial<T>): boolean =>
    Object.entries(where).every(([key, value]) => (row as Record<string, unknown>)[key] === value)

const makePromptRepo = (rows: PromptRow[]) => ({
    findOneBy: jest.fn(async (where: Partial<PromptRow>) => rows.find((row) => matchesWhere(row, where)) || null),
    findOne: jest.fn(async ({ where, order }: { where: Partial<PromptRow>; order?: { version?: 'ASC' | 'DESC' } }) => {
        const matches = rows.filter((row) => matchesWhere(row, where))
        return sortByField(matches, 'version', order?.version || 'ASC')[0] || null
    }),
    create: jest.fn((data: Partial<PromptRow>) => data as PromptRow),
    save: jest.fn(async (entity: PromptRow) => {
        if (!entity.id) entity.id = `prompt-${rows.length + 1}`
        const index = rows.findIndex((row) => row.id === entity.id)
        if (index >= 0) rows[index] = { ...rows[index], ...entity }
        else rows.push(entity)
        return rows.find((row) => row.id === entity.id)
    }),
    delete: jest.fn(async (id: string) => {
        const index = rows.findIndex((row) => row.id === id)
        if (index >= 0) rows.splice(index, 1)
        return { affected: index >= 0 ? 1 : 0 }
    }),
    createQueryBuilder: jest.fn((alias?: string) => {
        if (alias === 'p') {
            return {
                where: jest.fn(() => ({
                    orderBy: jest.fn(() => ({
                        addOrderBy: jest.fn(() => ({
                            getMany: jest.fn(async () =>
                                sortByField(
                                    sortByField(
                                        rows.filter((row) => row.tenantId === null || row.tenantId === 'tenant-a'),
                                        'version',
                                        'DESC'
                                    ),
                                    'persona',
                                    'ASC'
                                )
                            )
                        }))
                    }))
                }))
            }
        }

        return {
            update: jest.fn(() => ({
                set: jest.fn((patch: Partial<PromptRow>) => ({
                    where: jest.fn((_clause: string, params: { tenantId: string; persona: string; id: string }) => ({
                        execute: jest.fn(async () => {
                            rows.forEach((row) => {
                                if (row.tenantId === params.tenantId && row.persona === params.persona && row.id !== params.id) {
                                    Object.assign(row, patch)
                                }
                            })
                            return { affected: 1 }
                        })
                    }))
                }))
            }))
        }
    })
})

const makeSkillRepo = (rows: SkillRow[]) => ({
    findOneBy: jest.fn(async (where: Partial<SkillRow>) => rows.find((row) => matchesWhere(row, where)) || null),
    create: jest.fn((data: Partial<SkillRow>) => data as SkillRow),
    save: jest.fn(async (entity: SkillRow) => {
        if (!entity.id) entity.id = `skill-${rows.length + 1}`
        const index = rows.findIndex((row) => row.id === entity.id)
        if (index >= 0) rows[index] = { ...rows[index], ...entity }
        else rows.push(entity)
        return rows.find((row) => row.id === entity.id)
    }),
    delete: jest.fn(async (id: string) => {
        const index = rows.findIndex((row) => row.id === id)
        if (index >= 0) rows.splice(index, 1)
        return { affected: index >= 0 ? 1 : 0 }
    }),
    createQueryBuilder: jest.fn(() => {
        let category: string | undefined
        let skip = 0
        let take = 20

        const qb: any = {
            where: jest.fn(() => qb),
            orderBy: jest.fn(() => qb),
            addOrderBy: jest.fn(() => qb),
            skip: jest.fn((value: number) => {
                skip = value
                return qb
            }),
            take: jest.fn((value: number) => {
                take = value
                return qb
            }),
            andWhere: jest.fn((_clause: string, params: { category: string }) => {
                category = params.category
                return qb
            }),
            getManyAndCount: jest.fn(async () => {
                const filtered = rows
                    .filter((row) => row.isPublic)
                    .filter((row) => (category ? row.category === category : true))
                    .sort((left, right) => right.historicSuccessRate - left.historicSuccessRate || right.usageCount - left.usageCount)
                return [filtered.slice(skip, skip + take), filtered.length]
            })
        }

        return qb
    })
})

const makeApp = (prompts: PromptRow[], skills: SkillRow[]) => {
    const promptRepo = makePromptRepo(prompts)
    const skillRepo = makeSkillRepo(skills)

    mockedGetRunningExpressApp.mockReturnValue({
        AppDataSource: {
            getRepository: jest.fn((entity) => {
                if (entity === CoworkPrompt) return promptRepo
                if (entity === CoworkSkill) return skillRepo
                return {}
            })
        }
    } as any)

    const app = express()
    app.use(express.json())
    app.use((req: Request, _res: Response, next: NextFunction) => {
        req.user = {
            id: String(req.header('x-tenant-id') || 'tenant-a'),
            role: req.header('x-user-role') || 'member'
        } as Express.User
        next()
    })
    app.use('/cowork', coworkRouter)
    app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
        res.status(error.statusCode || 500).json({ message: error.message })
    })

    const server = app.listen(0)
    server.unref()
    const sockets = new Set<Socket>()
    openSockets.set(server, sockets)
    server.on('connection', (socket) => {
        sockets.add(socket)
        socket.on('close', () => sockets.delete(socket))
    })
    openServers.push(server)

    return { app: server, promptRepo, skillRepo }
}

describe('cowork Prompt Studio and Skill Marketplace endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(async () => {
        await Promise.all(
            openServers.splice(0).map(async (server) => {
                openSockets.get(server)?.forEach((socket) => socket.destroy())
                openSockets.delete(server)
                await new Promise<void>((resolve, reject) => {
                    server.close((error) => (error ? reject(error) : resolve()))
                })
            })
        )
    })

    it('TC-S2-3.9 GET /cowork/prompts returns built-ins plus caller tenant prompts', async () => {
        const prompts = [
            makePrompt({ id: 'builtin-coder', persona: 'coder', tenantId: null }),
            makePrompt({ id: 'builtin-researcher', persona: 'researcher', tenantId: null }),
            makePrompt({ id: 'builtin-analyst', persona: 'analyst', tenantId: null }),
            makePrompt({ id: 'builtin-reviewer', persona: 'reviewer', tenantId: null }),
            makePrompt({ id: 'builtin-architect', persona: 'architect', tenantId: null }),
            makePrompt({ id: 'builtin-writer', persona: 'writer', tenantId: null }),
            makePrompt({ id: 'tenant-a-custom', persona: 'coder', tenantId: 'tenant-a' }),
            makePrompt({ id: 'tenant-b-private', persona: 'coder', tenantId: 'tenant-b' })
        ]
        const { app } = makeApp(prompts, [])

        const response = await request(app).get('/cowork/prompts').set('x-tenant-id', 'tenant-a').expect(200)

        expect(response.body.total).toBe(7)
        expect(response.body.data.map((prompt: PromptRow) => prompt.id)).toEqual(
            expect.arrayContaining(['builtin-coder', 'tenant-a-custom'])
        )
        expect(response.body.data.map((prompt: PromptRow) => prompt.id)).not.toContain('tenant-b-private')
    })

    it('TC-S2-3.16 POST /cowork/prompts creates the next tenant prompt version', async () => {
        const prompts = [makePrompt({ id: 'researcher-v1', persona: 'researcher', tenantId: 'tenant-a', version: 1 })]
        const { app } = makeApp(prompts, [])

        const response = await request(app)
            .post('/cowork/prompts')
            .set('x-tenant-id', 'tenant-a')
            .set('Connection', 'close')
            .send({ persona: 'researcher', templateContent: 'Research {{topic}}' })
            .expect(201)

        expect(response.body).toMatchObject({
            persona: 'researcher',
            tenantId: 'tenant-a',
            version: 2,
            isDefault: false
        })
    })

    it('TC-S2-3.10 PUT /cowork/prompts/:id with isDefault=true unsets other defaults', async () => {
        const prompts = [
            makePrompt({ id: 'prompt-a', persona: 'coder', tenantId: 'tenant-a', isDefault: true }),
            makePrompt({ id: 'prompt-b', persona: 'coder', tenantId: 'tenant-a', isDefault: false }),
            makePrompt({ id: 'prompt-c', persona: 'researcher', tenantId: 'tenant-a', isDefault: true })
        ]
        const { app } = makeApp(prompts, [])

        const response = await request(app)
            .put('/cowork/prompts/prompt-b')
            .set('x-tenant-id', 'tenant-a')
            .set('Connection', 'close')
            .send({ isDefault: true })
            .expect(200)

        expect(response.body.isDefault).toBe(true)
        expect(prompts.find((prompt) => prompt.id === 'prompt-a')?.isDefault).toBe(false)
        expect(prompts.find((prompt) => prompt.id === 'prompt-b')?.isDefault).toBe(true)
        expect(prompts.find((prompt) => prompt.id === 'prompt-c')?.isDefault).toBe(true)
    })

    it('TC-S2-3.13 PUT /cowork/prompts/:id blocks built-in prompt edits', async () => {
        const { app } = makeApp([makePrompt({ id: 'builtin-coder', tenantId: null })], [])

        const response = await request(app)
            .put('/cowork/prompts/builtin-coder')
            .set('x-tenant-id', 'tenant-a')
            .set('Connection', 'close')
            .send({ templateContent: 'Updated prompt' })
            .expect(403)

        expect(response.body).toEqual({ message: 'Cannot edit built-in prompts. Create a new version instead.' })
    })

    it('TC-S2-3.14 DELETE /cowork/prompts/:id blocks active defaults and keeps the row', async () => {
        const prompts = [makePrompt({ id: 'prompt-a', tenantId: 'tenant-a', isDefault: true })]
        const { app } = makeApp(prompts, [])

        const response = await request(app).delete('/cowork/prompts/prompt-a').set('x-tenant-id', 'tenant-a').expect(400)

        expect(response.body).toEqual({ message: 'Cannot delete active default prompt - set another as default first' })
        expect(prompts).toHaveLength(1)
    })

    it('AC-6 DELETE /cowork/prompts/:id blocks another tenants prompt', async () => {
        const prompts = [makePrompt({ id: 'tenant-a-prompt', tenantId: 'tenant-a', isDefault: false })]
        const { app } = makeApp(prompts, [])

        const response = await request(app).delete('/cowork/prompts/tenant-a-prompt').set('x-tenant-id', 'tenant-b').expect(403)

        expect(response.body).toEqual({ message: 'Not your prompt' })
        expect(prompts).toHaveLength(1)
    })

    it('TC-S2-3.12 GET /cowork/skills/marketplace returns only public skills ordered by success rate', async () => {
        const skills = [
            makeSkill({ id: 's1', name: 'High Public', tenantId: 'tenant-a', isPublic: true, historicSuccessRate: 0.94, usageCount: 10 }),
            makeSkill({ id: 's2', name: 'Private', tenantId: 'tenant-a', isPublic: false, historicSuccessRate: 1, usageCount: 999 }),
            makeSkill({ id: 's3', name: 'Lower Public', tenantId: 'tenant-b', isPublic: true, historicSuccessRate: 0.81, usageCount: 20 })
        ]
        const { app } = makeApp([], skills)

        const response = await request(app).get('/cowork/skills/marketplace').expect(200)

        expect(response.body).toMatchObject({ total: 2, page: 1, limit: 20 })
        expect(response.body.data.map((skill: SkillRow) => skill.id)).toEqual(['s1', 's3'])
        expect(response.body.data.map((skill: SkillRow) => skill.id)).not.toContain('s2')
    })

    it('AC-8 PUT /cowork/skills/:id publishes a global skill and sets caller tenantId', async () => {
        const skills = [makeSkill({ id: 'global-skill', tenantId: null, isPublic: false })]
        const { app } = makeApp([], skills)

        const response = await request(app)
            .put('/cowork/skills/global-skill')
            .set('x-tenant-id', 'tenant-a')
            .set('Connection', 'close')
            .send({ isPublic: true })
            .expect(200)

        expect(response.body).toMatchObject({ id: 'global-skill', isPublic: true, tenantId: 'tenant-a' })
        expect(skills[0]).toMatchObject({ isPublic: true, tenantId: 'tenant-a' })
    })

    it('TC-S2-3.11 POST /cowork/skills/:id/clone creates a private copy with fresh stats', async () => {
        const skills = [
            makeSkill({
                id: 'web-research',
                name: 'Web Research',
                tenantId: 'tenant-a',
                isPublic: true,
                historicSuccessRate: 0.94,
                usageCount: 128
            })
        ]
        const { app } = makeApp([], skills)

        const response = await request(app).post('/cowork/skills/web-research/clone').set('x-tenant-id', 'tenant-b').expect(201)

        expect(response.body).toMatchObject({
            name: 'Web Research (copy)',
            tenantId: 'tenant-b',
            historicSuccessRate: 0,
            usageCount: 0,
            isPublic: false
        })
        expect(skills.find((skill) => skill.id === 'web-research')).toMatchObject({
            historicSuccessRate: 0.94,
            usageCount: 128,
            isPublic: true
        })
    })

    it('TC-S2-3.15 DELETE /cowork/skills/:id blocks another tenants skill and keeps the row', async () => {
        const skills = [makeSkill({ id: 'tenant-a-skill', tenantId: 'tenant-a' })]
        const { app } = makeApp([], skills)

        const response = await request(app).delete('/cowork/skills/tenant-a-skill').set('x-tenant-id', 'tenant-b').expect(403)

        expect(response.body).toEqual({ message: 'Not your skill' })
        expect(skills).toHaveLength(1)
    })
})
