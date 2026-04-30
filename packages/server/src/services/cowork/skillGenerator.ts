import { DataSource } from 'typeorm'
import { CoworkTask } from '../../database/entities/CoworkTask'
import { CoworkSkill } from '../../database/entities/CoworkSkill'
import logger from '../../utils/logger'

export interface TaskOutput {
    type: 'text' | 'code' | 'data'
    content: string
    model?: string
    costUsd?: number
    latencyMs?: number
}

// ── Passive skill capture on task completion (Ticket 3.3) ────────────────────

export const captureSkill = async (
    task: CoworkTask,
    systemPrompt: string,
    output: TaskOutput,
    appDataSource: DataSource
): Promise<void> => {
    try {
        if (output.type === 'text' && output.content.length < 50) return

        const skillRepo = appDataSource.getRepository(CoworkSkill)

        const existingSkills = await skillRepo.find({
            where: { category: task.agentPersona },
            order: { usageCount: 'DESC' },
            take: 20
        })

        const taskWords = task.name
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 3)
        const similar = existingSkills.find((s) => {
            const skillWords = s.name
                .toLowerCase()
                .split(/\s+/)
                .filter((w) => w.length > 3)
            const overlap = taskWords.filter((tw) =>
                skillWords.some((sw) => sw.startsWith(tw.slice(0, 4)) || tw.startsWith(sw.slice(0, 4)))
            ).length
            const denom = Math.max(taskWords.length, skillWords.length)
            return denom > 0 && overlap / denom > 0.4
        })

        if (similar) {
            const prevCount = similar.usageCount || 0
            similar.usageCount = prevCount + 1
            similar.historicSuccessRate = (similar.historicSuccessRate * prevCount + 1) / (prevCount + 1)

            if (output.costUsd) {
                similar.avgCost = similar.avgCost ? (similar.avgCost * prevCount + output.costUsd) / (prevCount + 1) : output.costUsd
            }

            if (output.latencyMs) {
                similar.avgLatencyMs = similar.avgLatencyMs
                    ? Math.round((similar.avgLatencyMs * prevCount + output.latencyMs) / (prevCount + 1))
                    : output.latencyMs
            }

            await skillRepo.save(similar)
            logger.info(`[cowork-skill]: Updated skill "${similar.name}" (usageCount=${similar.usageCount})`)
        } else {
            const skill = skillRepo.create({
                name: task.name,
                description: task.description,
                category: task.agentPersona,
                systemPrompt,
                preferredModel: output.model,
                historicSuccessRate: 1.0,
                avgCost: output.costUsd,
                avgLatencyMs: output.latencyMs,
                usageCount: 1,
                tags: JSON.stringify([task.agentPersona]),
                isPublic: false
            })
            await skillRepo.save(skill)
            logger.info(`[cowork-skill]: Created new skill "${task.name}"`)
        }
    } catch (error) {
        logger.error(`[cowork-skill]: Failed to capture skill for task ${task.id}: ${error}`)
    }
}

// ── Skill discovery for reuse (Ticket 3.4) ───────────────────────────────────

export const findMatchingSkill = async (taskName: string, persona: string, appDataSource: DataSource): Promise<CoworkSkill | null> => {
    try {
        const skillRepo = appDataSource.getRepository(CoworkSkill)

        const candidates = await skillRepo.find({
            where: { category: persona },
            order: { historicSuccessRate: 'DESC', usageCount: 'DESC' },
            take: 10
        })

        const nameWords = taskName.toLowerCase().split(/\s+/)
        let bestMatch: CoworkSkill | null = null
        let bestScore = 0

        for (const skill of candidates) {
            const skillWords = skill.name.toLowerCase().split(/\s+/)
            const overlap = nameWords.filter((w) => skillWords.includes(w) && w.length > 3).length
            const score = overlap / Math.max(nameWords.length, skillWords.length)

            if (score > 0.4 && score > bestScore && skill.historicSuccessRate > 0.7) {
                bestScore = score
                bestMatch = skill
            }
        }

        if (bestMatch) {
            logger.info(`[cowork-skill]: Found matching skill "${bestMatch.name}" (score=${bestScore.toFixed(2)})`)
        }

        return bestMatch
    } catch (error) {
        logger.error(`[cowork-skill]: Skill discovery failed: ${error}`)
        return null
    }
}
