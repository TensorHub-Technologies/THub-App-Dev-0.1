import { DataSource } from 'typeorm'
import { CoworkModelProfile } from '../../../database/entities/CoworkModelProfile'
import { recordModelFailure, selectModel } from '../../../services/cowork/ModelRouter'

type ModelState = {
    models: CoworkModelProfile[]
}

const makeModel = (overrides: Partial<CoworkModelProfile>): CoworkModelProfile => {
    return {
        id: overrides.id || `model-${Math.random().toString(36).slice(2)}`,
        provider: overrides.provider || 'openai',
        modelName: overrides.modelName || 'gpt-4o-mini',
        inputCostPer1kTokens: overrides.inputCostPer1kTokens ?? 0,
        outputCostPer1kTokens: overrides.outputCostPer1kTokens ?? 0,
        contextWindowTokens: overrides.contextWindowTokens ?? 128000,
        supportsVision: overrides.supportsVision ?? true,
        supportsFunctionCalling: overrides.supportsFunctionCalling ?? true,
        isAvailable: overrides.isAvailable ?? true,
        isLocal: overrides.isLocal ?? false,
        avgLatencyMs: overrides.avgLatencyMs ?? 300,
        reliabilityScore: overrides.reliabilityScore ?? 0.95,
        ollamaEndpoint: overrides.ollamaEndpoint ?? null,
        createdDate: overrides.createdDate || new Date('2026-05-01T00:00:00.000Z'),
        updatedDate: overrides.updatedDate || new Date('2026-05-01T00:00:00.000Z')
    } as CoworkModelProfile
}

const matchesWhere = <T extends Record<string, any>>(row: T, where: Record<string, any>): boolean => {
    return Object.entries(where).every(([key, value]) => row[key] === value)
}

const makeDataSource = (state: ModelState): DataSource => {
    const modelRepo = {
        find: jest.fn(async ({ where }: { where?: Partial<CoworkModelProfile> } = {}) => {
            if (!where) return [...state.models]
            return state.models.filter((model) => matchesWhere(model as any, where as any))
        }),
        findOneBy: jest.fn(async (where: Partial<CoworkModelProfile>) => {
            return state.models.find((model) => matchesWhere(model as any, where as any)) || null
        }),
        create: jest.fn((data: Partial<CoworkModelProfile>) => data as CoworkModelProfile),
        save: jest.fn(async (entity: CoworkModelProfile) => {
            const payload = { ...entity } as CoworkModelProfile
            const idx = state.models.findIndex((model) => model.id === payload.id)
            if (idx >= 0) {
                state.models[idx] = payload
            } else {
                state.models.push(payload)
            }
            return payload
        })
    }

    return {
        getRepository: jest.fn((entity: unknown) => {
            if (entity === CoworkModelProfile) return modelRepo
            throw new Error(`Unknown repository: ${String(entity)}`)
        })
    } as unknown as DataSource
}

describe('ModelRouter', () => {
    it('TC-1: routingStrategy=cost_optimized selects the cheapest available model', async () => {
        const state: ModelState = {
            models: [
                makeModel({
                    modelName: 'expensive-model',
                    inputCostPer1kTokens: 0.004,
                    outputCostPer1kTokens: 0.008,
                    reliabilityScore: 0.99
                }),
                makeModel({
                    modelName: 'cheap-model',
                    inputCostPer1kTokens: 0.0001,
                    outputCostPer1kTokens: 0.0002,
                    reliabilityScore: 0.97
                }),
                makeModel({
                    modelName: 'unavailable-cheapest',
                    inputCostPer1kTokens: 0,
                    outputCostPer1kTokens: 0,
                    isAvailable: false,
                    reliabilityScore: 0.99
                })
            ]
        }

        const dataSource = makeDataSource(state)
        const result = await selectModel({
            routingStrategy: 'cost_optimized',
            sessionConfig: { temperature: 0.3, maxTokens: 512 },
            appDataSource: dataSource
        })

        expect(result.selectedModel.modelName).toBe('cheap-model')
        expect(result.selectedModel.temperature).toBe(0.3)
        expect(result.selectedModel.maxTokens).toBe(512)
    })

    it('local_first prefers local models when available', async () => {
        const state: ModelState = {
            models: [
                makeModel({
                    provider: 'openai',
                    modelName: 'gpt-4o-mini',
                    inputCostPer1kTokens: 0.00015,
                    outputCostPer1kTokens: 0.0006,
                    reliabilityScore: 0.99
                }),
                makeModel({
                    provider: 'ollama',
                    modelName: 'llama3',
                    isLocal: true,
                    ollamaEndpoint: 'http://localhost:11434',
                    reliabilityScore: 0.9
                })
            ]
        }

        const dataSource = makeDataSource(state)
        const result = await selectModel({
            routingStrategy: 'local_first',
            sessionConfig: {},
            appDataSource: dataSource
        })

        expect(result.selectedModel.provider).toBe('ollama')
        expect(result.selectedModel.modelName).toBe('llama3')
        expect(result.selectedModel.apiBase).toBe('http://localhost:11434')
    })

    it('TC-3: recordModelFailure reduces reliability score by 0.02', async () => {
        const state: ModelState = {
            models: [makeModel({ modelName: 'gpt-4o-mini', reliabilityScore: 0.98 })]
        }

        const dataSource = makeDataSource(state)
        await recordModelFailure('gpt-4o-mini', dataSource)

        expect(state.models[0].reliabilityScore).toBeCloseTo(0.96, 8)
    })
})
