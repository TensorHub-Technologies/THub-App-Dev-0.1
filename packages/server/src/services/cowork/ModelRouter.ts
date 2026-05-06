import { DataSource } from 'typeorm'
import { CoworkModelProfile } from '../../database/entities/CoworkModelProfile'
import { AnalyticsEvent } from '../../database/entities/AnalyticsEvent'
import logger from '../../utils/logger'

export type RoutingStrategy = 'cost_optimized' | 'latency_optimized' | 'local_first' | 'balanced'

export interface RoutedModelSelection {
    provider: string
    modelName: string
    apiBase?: string
    temperature?: number
    maxTokens?: number
    isLocal: boolean
    estimatedCostUsd: number
}

export type SelectModelInput = {
    routingStrategy?: RoutingStrategy | string
    sessionConfig?: Record<string, any>
    appDataSource: DataSource
    requirements?: {
        needsVision?: boolean
        needsFunctionCalling?: boolean
        estimatedTokens?: number
    }
}

export type SelectModelResult = {
    selectedModel: RoutedModelSelection
    fallbackChain: RoutedModelSelection[]
}

const toRoutingStrategy = (value: string | undefined): RoutingStrategy => {
    switch (value) {
        case 'cost_optimized':
        case 'latency_optimized':
        case 'local_first':
        case 'balanced':
            return value
        default:
            return 'balanced'
    }
}

const estimateCostUsd = (model: CoworkModelProfile, estimatedTokens: number): number => {
    return (model.inputCostPer1kTokens * estimatedTokens) / 1000 + (model.outputCostPer1kTokens * estimatedTokens) / 1000
}

const toRoutedModelSelection = (
    model: CoworkModelProfile,
    sessionConfig: Record<string, any>,
    estimatedTokens: number
): RoutedModelSelection => {
    const apiBaseFromSession = typeof sessionConfig?.apiBase === 'string' ? sessionConfig.apiBase : undefined
    const temperature = typeof sessionConfig?.temperature === 'number' ? sessionConfig.temperature : undefined
    const maxTokens = typeof sessionConfig?.maxTokens === 'number' ? sessionConfig.maxTokens : undefined

    return {
        provider: model.provider,
        modelName: model.modelName,
        apiBase: model.isLocal ? model.ollamaEndpoint || apiBaseFromSession : apiBaseFromSession,
        temperature,
        maxTokens,
        isLocal: model.isLocal,
        estimatedCostUsd: estimateCostUsd(model, estimatedTokens)
    }
}

// Built-in model catalogue (seeded on startup)
const SEED_MODELS: Partial<CoworkModelProfile>[] = [
    {
        provider: 'anthropic',
        modelName: 'claude-3-5-sonnet-20241022',
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.015,
        contextWindowTokens: 200000,
        supportsVision: true,
        supportsFunctionCalling: true,
        isLocal: false,
        reliabilityScore: 0.99
    },
    {
        provider: 'anthropic',
        modelName: 'claude-3-haiku-20240307',
        inputCostPer1kTokens: 0.00025,
        outputCostPer1kTokens: 0.00125,
        contextWindowTokens: 200000,
        supportsVision: true,
        supportsFunctionCalling: true,
        isLocal: false,
        reliabilityScore: 0.99
    },
    {
        provider: 'openai',
        modelName: 'gpt-4o',
        inputCostPer1kTokens: 0.0025,
        outputCostPer1kTokens: 0.01,
        contextWindowTokens: 128000,
        supportsVision: true,
        supportsFunctionCalling: true,
        isLocal: false,
        reliabilityScore: 0.98
    },
    {
        provider: 'openai',
        modelName: 'gpt-4o-mini',
        inputCostPer1kTokens: 0.00015,
        outputCostPer1kTokens: 0.0006,
        contextWindowTokens: 128000,
        supportsVision: true,
        supportsFunctionCalling: true,
        isLocal: false,
        reliabilityScore: 0.98
    },
    {
        provider: 'google',
        modelName: 'gemini-1.5-flash',
        inputCostPer1kTokens: 0.000075,
        outputCostPer1kTokens: 0.0003,
        contextWindowTokens: 1000000,
        supportsVision: true,
        supportsFunctionCalling: true,
        isLocal: false,
        reliabilityScore: 0.97
    },
    {
        provider: 'groq',
        modelName: 'llama-3.1-70b-versatile',
        inputCostPer1kTokens: 0.00059,
        outputCostPer1kTokens: 0.00079,
        contextWindowTokens: 131072,
        supportsVision: false,
        supportsFunctionCalling: true,
        isLocal: false,
        reliabilityScore: 0.95
    },
    {
        provider: 'ollama',
        modelName: 'llama3',
        inputCostPer1kTokens: 0,
        outputCostPer1kTokens: 0,
        contextWindowTokens: 8192,
        supportsVision: false,
        supportsFunctionCalling: false,
        isLocal: true,
        reliabilityScore: 0.9
    }
]

// Seed models into DB on first run
export const seedModelProfiles = async (appDataSource: DataSource): Promise<void> => {
    const repo = appDataSource.getRepository(CoworkModelProfile)
    for (const model of SEED_MODELS) {
        const existing = await repo.findOneBy({ provider: model.provider!, modelName: model.modelName! })
        if (!existing) {
            await repo.save(repo.create(model))
            logger.info(`[model-router]: Seeded model ${model.provider}/${model.modelName}`)
        }
    }
}

// Update model latency from analytics data
export const updateModelLatencyFromAnalytics = async (appDataSource: DataSource): Promise<void> => {
    const modelRepo = appDataSource.getRepository(CoworkModelProfile)
    const analyticsRepo = appDataSource.getRepository(AnalyticsEvent)

    const models = await modelRepo.find({ where: { isAvailable: true } })

    for (const model of models) {
        const result = await analyticsRepo
            .createQueryBuilder('e')
            .select('AVG(e.latencyMs)', 'avgLatency')
            .where('e.model = :model', { model: model.modelName })
            .andWhere('e.latencyMs IS NOT NULL')
            .andWhere('e.createdDate > :since', { since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })
            .getRawOne()

        if (result?.avgLatency) {
            const updated = { ...model, avgLatencyMs: Math.round(result.avgLatency) }
            await modelRepo.save(updated)
        }
    }
}

// Core routing function
export const selectModel = async (input: SelectModelInput): Promise<SelectModelResult> => {
    const strategy = toRoutingStrategy(typeof input.routingStrategy === 'string' ? input.routingStrategy : undefined)
    const sessionConfig = input.sessionConfig || {}
    const requirements = input.requirements
    const appDataSource = input.appDataSource

    const repo = appDataSource.getRepository(CoworkModelProfile)
    let candidates = await repo.find({ where: { isAvailable: true } })

    if (requirements?.needsVision) {
        candidates = candidates.filter((m) => m.supportsVision)
    }
    if (requirements?.needsFunctionCalling) {
        candidates = candidates.filter((m) => m.supportsFunctionCalling)
    }
    const estimatedTokensRequirement = requirements?.estimatedTokens
    if (typeof estimatedTokensRequirement === 'number') {
        candidates = candidates.filter((m) => m.contextWindowTokens >= estimatedTokensRequirement)
    }

    candidates = candidates.filter((m) => m.reliabilityScore > 0.8)

    if (!candidates.length) {
        const selectedModel: RoutedModelSelection = {
            provider: 'openai',
            modelName: 'gpt-4o-mini',
            apiBase: typeof sessionConfig.apiBase === 'string' ? sessionConfig.apiBase : undefined,
            temperature: typeof sessionConfig.temperature === 'number' ? sessionConfig.temperature : undefined,
            maxTokens: typeof sessionConfig.maxTokens === 'number' ? sessionConfig.maxTokens : undefined,
            isLocal: false,
            estimatedCostUsd: 0
        }
        const fallbackChain: RoutedModelSelection[] = [
            {
                provider: 'openai',
                modelName: 'gpt-4o',
                apiBase: selectedModel.apiBase,
                temperature: selectedModel.temperature,
                maxTokens: selectedModel.maxTokens,
                isLocal: false,
                estimatedCostUsd: 0
            }
        ]

        logger.info(`[model-router]: strategy=${strategy} selected=${selectedModel.modelName}`)
        return { selectedModel, fallbackChain }
    }

    let selected: CoworkModelProfile

    switch (strategy) {
        case 'cost_optimized':
            candidates.sort((a, b) => a.inputCostPer1kTokens + a.outputCostPer1kTokens - (b.inputCostPer1kTokens + b.outputCostPer1kTokens))
            selected = candidates[0]
            break

        case 'latency_optimized':
            candidates.sort((a, b) => (a.avgLatencyMs ?? 99999) - (b.avgLatencyMs ?? 99999))
            selected = candidates[0]
            break

        case 'local_first': {
            const local = candidates.filter((m) => m.isLocal)
            if (local.length) {
                selected = local[0]
            } else {
                candidates.sort(
                    (a, b) => a.inputCostPer1kTokens + a.outputCostPer1kTokens - (b.inputCostPer1kTokens + b.outputCostPer1kTokens)
                )
                selected = candidates[0]
            }
            break
        }

        case 'balanced':
        default: {
            const maxCost = Math.max(...candidates.map((m) => m.inputCostPer1kTokens + m.outputCostPer1kTokens)) || 1
            const maxLatency = Math.max(...candidates.map((m) => m.avgLatencyMs ?? 1000)) || 1
            candidates.sort((a, b) => {
                const scoreA =
                    a.reliabilityScore *
                    (1 - (a.inputCostPer1kTokens + a.outputCostPer1kTokens) / maxCost) *
                    (1 - (a.avgLatencyMs ?? 500) / maxLatency)
                const scoreB =
                    b.reliabilityScore *
                    (1 - (b.inputCostPer1kTokens + b.outputCostPer1kTokens) / maxCost) *
                    (1 - (b.avgLatencyMs ?? 500) / maxLatency)
                return scoreB - scoreA
            })
            selected = candidates[0]
        }
    }

    const fallbackProfiles = candidates
        .filter((m) => m.modelName !== selected.modelName)
        .sort((a, b) => b.reliabilityScore - a.reliabilityScore)
        .slice(0, 2)

    const estimatedTokens = requirements?.estimatedTokens || 1000
    const selectedModel = toRoutedModelSelection(selected, sessionConfig, estimatedTokens)
    const fallbackChain = fallbackProfiles.map((model) => toRoutedModelSelection(model, sessionConfig, estimatedTokens))

    logger.info(`[model-router]: strategy=${strategy} selected=${selectedModel.modelName}`)
    return { selectedModel, fallbackChain }
}

// Called when a model fails: reduce reliability score.
export const recordModelFailure = async (modelName: string, appDataSource: DataSource): Promise<void> => {
    const repo = appDataSource.getRepository(CoworkModelProfile)
    const model = await repo.findOneBy({ modelName })
    if (model) {
        const updated = { ...model, reliabilityScore: Math.max(0, model.reliabilityScore - 0.02) }
        await repo.save(updated)
        logger.warn(`[model-router]: Reduced reliability for ${modelName} to ${updated.reliabilityScore.toFixed(2)}`)
    }
}

// CRUD API handlers
export const listModelProfiles = async (appDataSource: DataSource): Promise<CoworkModelProfile[]> => {
    return appDataSource.getRepository(CoworkModelProfile).find({
        order: { provider: 'ASC', modelName: 'ASC' }
    })
}

export const updateModelProfile = async (
    id: string,
    updates: Partial<CoworkModelProfile>,
    appDataSource: DataSource
): Promise<CoworkModelProfile> => {
    const repo = appDataSource.getRepository(CoworkModelProfile)
    const model = await repo.findOneBy({ id })
    if (!model) throw new Error(`Model profile ${id} not found`)
    const updated = { ...model, ...updates }
    return repo.save(updated)
}
