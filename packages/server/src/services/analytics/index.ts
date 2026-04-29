import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { AnalyticsEvent } from '../../database/entities/AnalyticsEvent'
import logger from '../../utils/logger'

export const recordEvent = async (event: {
    eventType: string
    tenantId?: string
    userId?: string
    tokensUsed?: number
    costUsd?: number
    latencyMs?: number
    model?: string
    metadata?: Record<string, any>
}): Promise<void> => {
    // CRITICAL: never throw — analytics must not block the caller
    try {
        const appServer = getRunningExpressApp()
        const repo = appServer.AppDataSource.getRepository(AnalyticsEvent)
        await repo.save(
            repo.create({
                eventType: event.eventType,
                tenantId: event.tenantId,
                userId: event.userId,
                tokensUsed: event.tokensUsed,
                costUsd: event.costUsd,
                latencyMs: event.latencyMs,
                model: event.model,
                metadata: event.metadata ? JSON.stringify(event.metadata) : undefined
            })
        )
    } catch (error) {
        logger.error(`[analytics]: Failed to record event ${event.eventType}: ${error}`)
    }
}

export const getUsageSummary = async (tenantId: string, from: Date, to: Date) => {
    const appServer = getRunningExpressApp()
    const repo = appServer.AppDataSource.getRepository(AnalyticsEvent)
    return repo
        .createQueryBuilder('e')
        .select('e.eventType', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(e.tokensUsed)', 'totalTokens')
        .addSelect('SUM(e.costUsd)', 'totalCostUsd')
        .addSelect('AVG(e.latencyMs)', 'avgLatencyMs')
        .where('e.tenantId = :tenantId', { tenantId })
        .andWhere('e.createdDate BETWEEN :from AND :to', { from, to })
        .groupBy('e.eventType')
        .orderBy('count', 'DESC')
        .getRawMany()
}
