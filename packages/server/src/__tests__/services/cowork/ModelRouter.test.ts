import { DataSource } from 'typeorm'
import {
    listModelProfiles,
    recordModelFailure,
    seedModelProfiles,
    selectModel,
    updateModelLatencyFromAnalytics,
    updateModelProfile
} from '../../../services/cowork/ModelRouter'
import { CoworkModelProfile } from '../../../database/entities/CoworkModelProfile'
import { AnalyticsEvent } from '../../../database/entities/AnalyticsEvent'

const createSqliteDataSource = async (): Promise<DataSource> => {
    const dataSource = new DataSource({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [CoworkModelProfile, AnalyticsEvent]
    })

    await dataSource.initialize()
    return dataSource
}

const saveModel = async (ds: DataSource, data: Partial<CoworkModelProfile>): Promise<CoworkModelProfile> => {
    const repo = ds.getRepository(CoworkModelProfile)
    return repo.save(
        repo.create({
            provider: data.provider ?? 'test',
            modelName: data.modelName ?? 'test-model',
            inputCostPer1kTokens: data.inputCostPer1kTokens ?? 0.001,
            outputCostPer1kTokens: data.outputCostPer1kTokens ?? 0.001,
            contextWindowTokens: data.contextWindowTokens ?? 128000,
            supportsVision: data.supportsVision ?? true,
            supportsFunctionCalling: data.supportsFunctionCalling ?? true,
            isAvailable: data.isAvailable ?? true,
            isLocal: data.isLocal ?? false,
            avgLatencyMs: data.avgLatencyMs ?? 1000,
            reliabilityScore: data.reliabilityScore ?? 0.99,
            ollamaEndpoint: data.ollamaEndpoint
        })
    )
}

describe('ModelRouter', () => {
    let ds: DataSource

    beforeEach(async () => {
        ds = await createSqliteDataSource()
    })

    afterEach(async () => {
        await ds.destroy()
    })

    it('seeds exactly 7 built-in model profiles and is idempotent', async () => {
        await seedModelProfiles(ds)
        await seedModelProfiles(ds)

        const models = await listModelProfiles(ds)

        expect(models).toHaveLength(7)
        expect(models.map((m) => m.modelName)).toEqual(
            expect.arrayContaining([
                'claude-3-haiku-20240307',
                'claude-3-5-sonnet-20241022',
                'gpt-4o',
                'gpt-4o-mini',
                'gemini-1.5-flash',
                'llama-3.1-70b-versatile',
                'llama3'
            ])
        )
    })

    it('cost_optimized selects the lowest combined input and output token cost', async () => {
        await saveModel(ds, { modelName: 'claude-haiku', inputCostPer1kTokens: 0.00025, outputCostPer1kTokens: 0.000125 })
        await saveModel(ds, { modelName: 'gpt-4o-mini', inputCostPer1kTokens: 0.00015, outputCostPer1kTokens: 0.0006 })
        await saveModel(ds, { modelName: 'gemini-flash', inputCostPer1kTokens: 0.000075, outputCostPer1kTokens: 0.0003 })

        const selected = await selectModel('cost_optimized', ds)

        expect(['claude-haiku', 'gemini-flash']).toContain(selected.modelName)
        expect(selected.modelName).not.toBe('gpt-4o-mini')
    })

    it('latency_optimized selects the lowest avgLatencyMs', async () => {
        await saveModel(ds, { modelName: 'gpt-4o-mini', avgLatencyMs: 800 })
        await saveModel(ds, { modelName: 'claude-haiku', avgLatencyMs: 600 })
        await saveModel(ds, { modelName: 'gemini-flash', avgLatencyMs: 500 })

        const selected = await selectModel('latency_optimized', ds)

        expect(selected.modelName).toBe('gemini-flash')
    })

    it('local_first prefers an available local model', async () => {
        await saveModel(ds, { provider: 'ollama', modelName: 'llama3', isLocal: true })
        await saveModel(ds, { provider: 'openai', modelName: 'gpt-4o-mini', isLocal: false, inputCostPer1kTokens: 0.00015 })

        const selected = await selectModel('local_first', ds)

        expect(selected.provider).toBe('ollama')
        expect(selected.modelName).toBe('llama3')
        expect(selected.isLocal).toBe(true)
    })

    it('local_first falls back to the cheapest cloud model when no local model is available', async () => {
        await saveModel(ds, { provider: 'openai', modelName: 'gpt-4o-mini', inputCostPer1kTokens: 0.001 })
        await saveModel(ds, { provider: 'google', modelName: 'gemini-flash', inputCostPer1kTokens: 0.0001 })

        const selected = await selectModel('local_first', ds)

        expect(selected.modelName).toBe('gemini-flash')
        expect(selected.isLocal).toBe(false)
    })

    it('balanced scores models by reliability, normalised cost, and normalised latency', async () => {
        await saveModel(ds, {
            modelName: 'expensive-fast',
            inputCostPer1kTokens: 0.003,
            outputCostPer1kTokens: 0.003,
            avgLatencyMs: 100,
            reliabilityScore: 0.99
        })
        await saveModel(ds, {
            modelName: 'balanced-winner',
            inputCostPer1kTokens: 0.001,
            outputCostPer1kTokens: 0.001,
            avgLatencyMs: 200,
            reliabilityScore: 0.95
        })
        await saveModel(ds, {
            modelName: 'cheap-slow',
            inputCostPer1kTokens: 0.0001,
            outputCostPer1kTokens: 0.0001,
            avgLatencyMs: 900,
            reliabilityScore: 0.99
        })

        const selected = await selectModel('balanced', ds)

        expect(selected.modelName).toBe('balanced-winner')
    })

    it('returns exactly two fallback models different from the selected model when enough reliable candidates exist', async () => {
        await saveModel(ds, { modelName: 'primary', inputCostPer1kTokens: 0.0001, reliabilityScore: 0.91 })
        await saveModel(ds, { modelName: 'fallback-1', inputCostPer1kTokens: 0.002, reliabilityScore: 0.99 })
        await saveModel(ds, { modelName: 'fallback-2', inputCostPer1kTokens: 0.003, reliabilityScore: 0.98 })
        await saveModel(ds, { modelName: 'fallback-3', inputCostPer1kTokens: 0.004, reliabilityScore: 0.97 })

        const selected = await selectModel('cost_optimized', ds)

        expect(selected.modelName).toBe('primary')
        expect(selected.fallbackChain).toHaveLength(2)
        expect(selected.fallbackChain).not.toContain(selected.modelName)
        expect(selected.fallbackChain).toEqual(['fallback-1', 'fallback-2'])
    })

    it('falls back to gpt-4o-mini when every stored model is unavailable', async () => {
        await saveModel(ds, { modelName: 'unavailable', isAvailable: false })

        const selected = await selectModel('cost_optimized', ds)

        expect(selected).toEqual({
            provider: 'openai',
            modelName: 'gpt-4o-mini',
            isLocal: false,
            estimatedCostUsd: 0,
            fallbackChain: ['gpt-4o']
        })
    })

    it('recordModelFailure reduces reliability by 0.02 and floors at zero', async () => {
        const model = await saveModel(ds, { modelName: 'fragile-model', reliabilityScore: 0.01 })

        await recordModelFailure(model.modelName, ds)

        const updated = await ds.getRepository(CoworkModelProfile).findOneByOrFail({ id: model.id })
        expect(updated.reliabilityScore).toBe(0)
    })

    it('updates avgLatencyMs from AnalyticsEvent rows in the last 7 days only', async () => {
        const model = await saveModel(ds, { modelName: 'timed-model', avgLatencyMs: null as any })
        const analyticsRepo = ds.getRepository(AnalyticsEvent)

        await analyticsRepo.save(
            analyticsRepo.create([
                { eventType: 'cowork_task_completed', model: model.modelName, latencyMs: 100, createdDate: new Date() },
                { eventType: 'cowork_task_completed', model: model.modelName, latencyMs: 300, createdDate: new Date() },
                {
                    eventType: 'cowork_task_completed',
                    model: model.modelName,
                    latencyMs: 10000,
                    createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
                }
            ])
        )

        await updateModelLatencyFromAnalytics(ds)

        const updated = await ds.getRepository(CoworkModelProfile).findOneByOrFail({ id: model.id })
        expect(updated.avgLatencyMs).toBe(200)
    })

    it('updateModelProfile throws 404 for a missing model profile', async () => {
        await expect(updateModelProfile('fake-uuid', { isAvailable: false }, ds)).rejects.toMatchObject({
            statusCode: 404
        })
    })
})
