import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { CoworkSkill } from '../../database/entities/CoworkSkill'
import { InternalTHubError } from '../../errors/internalTHubError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { getAuthenticatedTenantId, parsePositiveInt } from './utils'

const serializeTags = (tags: unknown): string | null | undefined => {
    if (tags === undefined) return undefined
    if (tags === null) return null
    return JSON.stringify(Array.isArray(tags) ? tags : [tags])
}

const assertSkillOwner = (skill: CoworkSkill, tenantId: string): void => {
    if (skill.tenantId && skill.tenantId !== tenantId) {
        throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Not your skill')
    }
}

const isSuperadmin = (req: Request): boolean => req.authUser?.role === 'superadmin' || req.user?.role === 'superadmin'

const isClaimPublishRequest = (body: Record<string, unknown>): boolean => {
    const keys = Object.keys(body)
    return keys.length === 1 && body.isPublic === true
}

// PUT /api/v1/cowork/skills/:id
const updateSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const repo = appServer.AppDataSource.getRepository(CoworkSkill)
        const skill = await repo.findOneBy({ id: req.params.id })

        if (!skill) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, 'Skill not found')
        }
        assertSkillOwner(skill, tenantId)

        const body = req.body || {}
        if (!skill.tenantId && !isSuperadmin(req) && !isClaimPublishRequest(body)) {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Only superadmin can edit global skills')
        }

        const { name, description, systemPrompt, isPublic, tags, preferredModel } = body
        if (name !== undefined) skill.name = String(name)
        if (description !== undefined) skill.description = description === null ? null : String(description)
        if (systemPrompt !== undefined) skill.systemPrompt = String(systemPrompt)
        if (preferredModel !== undefined) skill.preferredModel = preferredModel === null ? null : String(preferredModel)
        if (tags !== undefined) skill.tags = serializeTags(tags) ?? null
        if (isPublic !== undefined) {
            skill.isPublic = Boolean(isPublic)
            if (!skill.tenantId) skill.tenantId = tenantId
        }

        await repo.save(skill)
        return res.json(skill)
    } catch (error) {
        next(error)
    }
}

// DELETE /api/v1/cowork/skills/:id
const deleteSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const repo = appServer.AppDataSource.getRepository(CoworkSkill)
        const skill = await repo.findOneBy({ id: req.params.id })

        if (!skill) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, 'Skill not found')
        }
        assertSkillOwner(skill, tenantId)
        if (!skill.tenantId && !isSuperadmin(req)) {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Only superadmin can delete global skills')
        }

        await repo.delete(req.params.id)
        return res.json({ message: 'Skill deleted' })
    } catch (error) {
        next(error)
    }
}

// POST /api/v1/cowork/skills/:id/clone
const cloneSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const repo = appServer.AppDataSource.getRepository(CoworkSkill)
        const source = await repo.findOneBy({ id: req.params.id })

        if (!source) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, 'Skill not found')
        }
        if (!source.isPublic && source.tenantId !== tenantId) {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Cannot clone a private skill')
        }

        const cloned = await repo.save(
            repo.create({
                name: `${source.name} (copy)`,
                description: source.description,
                category: source.category,
                systemPrompt: source.systemPrompt,
                requiredTools: source.requiredTools,
                preferredModel: source.preferredModel,
                tags: source.tags,
                avgCost: source.avgCost,
                avgLatencyMs: source.avgLatencyMs,
                historicSuccessRate: 0,
                usageCount: 0,
                tenantId,
                isPublic: false
            })
        )

        return res.status(StatusCodes.CREATED).json(cloned)
    } catch (error) {
        next(error)
    }
}

// GET /api/v1/cowork/skills/marketplace
const getMarketplace = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parsePositiveInt(req.query.page, 1, 'page')
        const limit = parsePositiveInt(req.query.limit, 20, 'limit')
        const appServer = getRunningExpressApp()
        const qb = appServer.AppDataSource.getRepository(CoworkSkill)
            .createQueryBuilder('s')
            .where('s.isPublic = :isPublic', { isPublic: true })
            .orderBy('s.historicSuccessRate', 'DESC')
            .addOrderBy('s.usageCount', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)

        if (req.query.category) {
            qb.andWhere('s.category = :category', { category: String(req.query.category) })
        }

        const [data, total] = await qb.getManyAndCount()
        return res.json({ data, total, page, limit })
    } catch (error) {
        next(error)
    }
}

export default { updateSkill, deleteSkill, cloneSkill, getMarketplace }
