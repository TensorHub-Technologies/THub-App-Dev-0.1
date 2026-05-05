import { buildSystemPrompt, seedDefaultPrompts } from '../../../services/cowork/promptGenerator'
import { DataSource } from 'typeorm'
import { CoworkPrompt } from '../../../database/entities/CoworkPrompt'

const makeMockRepo = (findOneResult: CoworkPrompt | null = null, findOneByResult: CoworkPrompt | null = null) => ({
    findOne: jest.fn().mockResolvedValue(findOneResult),
    findOneBy: jest.fn().mockResolvedValue(findOneByResult),
    save: jest.fn().mockImplementation(async (entity: CoworkPrompt) => entity),
    create: jest.fn().mockImplementation((data: Partial<CoworkPrompt>) => data as CoworkPrompt)
})

const makeMockDataSource = (repo: ReturnType<typeof makeMockRepo>) =>
    ({ getRepository: jest.fn().mockReturnValue(repo) } as unknown as DataSource)

const createSqliteDataSource = async (): Promise<DataSource> => {
    const dataSource = new DataSource({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [CoworkPrompt]
    })

    await dataSource.initialize()
    return dataSource
}

describe('TC-3.1 Coder persona built-in template', () => {
    it('returns a string containing coder template language and the task name', async () => {
        const repo = makeMockRepo(null)
        const ds = makeMockDataSource(repo)

        const result = await buildSystemPrompt('coder', 'Write auth middleware', 'JWT based authentication', '', ds)

        expect(result.length).toBeGreaterThan(0)
        expect(result).toContain('software engineer')
        expect(result).toContain('Write auth middleware')
    })
})

describe('TC-3.2 DB prompt overrides built-in', () => {
    it('uses the DB template instead of the built-in when isDefault=true row exists', async () => {
        const dbPrompt = {
            persona: 'researcher',
            isDefault: true,
            templateContent: 'CUSTOM: {task_name}',
            tenantId: null,
            version: 1
        } as CoworkPrompt
        const repo = makeMockRepo(dbPrompt)
        const ds = makeMockDataSource(repo)

        const result = await buildSystemPrompt('researcher', 'Market analysis', 'Analyze the EV market', '', ds)

        expect(result).toMatch(/^CUSTOM:/)
        expect(result).not.toContain('thorough research specialist')
    })
})

describe('TC-3.2 Global defaults are tenant-safe', () => {
    it('ignores tenant-specific default rows when selecting the global default prompt', async () => {
        const ds = await createSqliteDataSource()

        try {
            const repo = ds.getRepository(CoworkPrompt)

            await repo.save(
                repo.create({
                    persona: 'researcher',
                    templateContent: 'TENANT: {task_name}',
                    tenantId: 'tenant-1',
                    targetModel: null,
                    version: 99,
                    isDefault: true
                })
            )

            await repo.save(
                repo.create({
                    persona: 'researcher',
                    templateContent: 'GLOBAL: {task_name}',
                    tenantId: null,
                    targetModel: null,
                    version: 1,
                    isDefault: true
                })
            )

            const result = await buildSystemPrompt('researcher', 'Market analysis', 'Analyze the EV market', '', ds)

            expect(result).toMatch(/^GLOBAL:/)
            expect(result).not.toMatch(/^TENANT:/)
        } finally {
            await ds.destroy()
        }
    })
})

describe('TC-3.3 Claude model adapter applied', () => {
    it('restructures prompt with XML tags when targetModel contains "claude"', async () => {
        const repo = makeMockRepo(null)
        const ds = makeMockDataSource(repo)

        const result = await buildSystemPrompt(
            'coder',
            'Write tests',
            'Unit tests for auth',
            'some context',
            ds,
            'claude-3-5-sonnet-20241022'
        )

        expect(result).toContain('<task>')
        expect(result).toContain('<requirements>')
        expect(result).toContain('<context>')
    })
})

describe('TC-3.4 OpenAI adapter unchanged', () => {
    it('leaves markdown format unchanged for non-claude models', async () => {
        const repo = makeMockRepo(null)
        const ds = makeMockDataSource(repo)

        const plain = await buildSystemPrompt('coder', 'Write tests', 'Unit tests for auth', 'some context', ds)
        const gpt = await buildSystemPrompt('coder', 'Write tests', 'Unit tests for auth', 'some context', ds, 'gpt-4o')

        expect(gpt).toEqual(plain)
        expect(gpt).not.toContain('<task>')
    })
})

describe('TC-3.5 Seed idempotent', () => {
    it('inserts exactly 6 rows on first call and no duplicates on second call', async () => {
        const saved: Partial<CoworkPrompt>[] = []
        const repo = {
            findOneBy: jest
                .fn()
                .mockImplementation(
                    async ({ persona }: { persona: string }) =>
                        saved.find((row) => row.persona === persona && row.tenantId === null) ?? null
                ),
            save: jest.fn().mockImplementation(async (entity: Partial<CoworkPrompt>) => {
                saved.push(entity)
                return entity
            }),
            create: jest.fn().mockImplementation((data: Partial<CoworkPrompt>) => data)
        }
        const ds = { getRepository: jest.fn().mockReturnValue(repo) } as unknown as DataSource

        await seedDefaultPrompts(ds)
        expect(saved).toHaveLength(6)

        await seedDefaultPrompts(ds)
        expect(saved).toHaveLength(6)
    })

    it('seeds one row per persona with isDefault=true and tenantId=null', async () => {
        const saved: Partial<CoworkPrompt>[] = []
        const repo = {
            findOneBy: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockImplementation(async (entity: Partial<CoworkPrompt>) => {
                saved.push(entity)
                return entity
            }),
            create: jest.fn().mockImplementation((data: Partial<CoworkPrompt>) => data)
        }
        const ds = { getRepository: jest.fn().mockReturnValue(repo) } as unknown as DataSource

        await seedDefaultPrompts(ds)

        const personas = saved.map((row) => row.persona)
        expect(personas).toEqual(expect.arrayContaining(['coder', 'researcher', 'analyst', 'reviewer', 'architect', 'writer']))
        saved.forEach((row) => {
            expect(row.isDefault).toBe(true)
            expect(row.tenantId).toBeNull()
            expect(row.targetModel).toBeNull()
        })
    })

    it('still seeds all 6 global defaults when tenant-specific defaults already exist', async () => {
        const ds = await createSqliteDataSource()

        try {
            const repo = ds.getRepository(CoworkPrompt)

            await repo.save(
                repo.create({
                    persona: 'coder',
                    templateContent: 'TENANT: {task_name}',
                    tenantId: 'tenant-1',
                    targetModel: null,
                    version: 1,
                    isDefault: true
                })
            )

            await seedDefaultPrompts(ds)

            const allRows = await repo.find()
            const globalDefaults = allRows.filter((row) => row.isDefault && row.tenantId === null)
            const coderRows = allRows.filter((row) => row.persona === 'coder' && row.isDefault)

            expect(globalDefaults).toHaveLength(6)
            expect(coderRows).toHaveLength(2)
            expect(allRows).toHaveLength(7)
        } finally {
            await ds.destroy()
        }
    })
})

describe('TC-3.6 Never throws on DB error', () => {
    it('returns a fallback prompt and does not throw when the DB is unavailable', async () => {
        const repo = { findOne: jest.fn().mockRejectedValue(new Error('DB down')) }
        const ds = { getRepository: jest.fn().mockReturnValue(repo) } as unknown as DataSource

        let result: string | undefined
        await expect(
            (async () => {
                result = await buildSystemPrompt('coder', 'Task X', 'Do something', '', ds)
            })()
        ).resolves.not.toThrow()

        expect(typeof result).toBe('string')
        expect((result as string).length).toBeGreaterThan(0)
    })
})

describe('TC-3.7 Empty inputContext handled', () => {
    it('inserts "No prior context" placeholder when inputContext is empty string', async () => {
        const repo = makeMockRepo(null)
        const ds = makeMockDataSource(repo)

        const result = await buildSystemPrompt('analyst', 'Analyze data', 'Sales trends', '', ds)

        expect(result).toContain('No prior context')
        expect(result).not.toMatch(/\n\n\n/)
    })
})

describe('AC-1 All 6 personas return non-empty strings', () => {
    const personas = ['coder', 'researcher', 'analyst', 'reviewer', 'architect', 'writer']

    personas.forEach((persona) => {
        it(`buildSystemPrompt returns a non-empty string for persona="${persona}"`, async () => {
            const repo = makeMockRepo(null)
            const ds = makeMockDataSource(repo)

            const result = await buildSystemPrompt(persona, 'Test task', 'Test description', '', ds)
            expect(typeof result).toBe('string')
            expect(result.length).toBeGreaterThan(0)
        })
    })
})

describe('AC-8 All three variables are replaced', () => {
    it('replaces task_name, task_description, and input_context in the output string', async () => {
        const dbPrompt = {
            persona: 'writer',
            isDefault: true,
            tenantId: null,
            version: 1,
            templateContent: 'Task={task_name}; Description={task_description}; Context={input_context}; Again={task_name}'
        } as CoworkPrompt
        const repo = makeMockRepo(dbPrompt)
        const ds = makeMockDataSource(repo)

        const result = await buildSystemPrompt('writer', 'Draft docs', 'Write API reference', 'prior output', ds)

        expect(result).toContain('Task=Draft docs')
        expect(result).toContain('Description=Write API reference')
        expect(result).toContain('Context=Previous task outputs:\nprior output')
        expect(result).toContain('Again=Draft docs')
        expect(result).not.toContain('{task_name}')
        expect(result).not.toContain('{task_description}')
        expect(result).not.toContain('{input_context}')
    })
})
