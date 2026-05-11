import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { CoworkPrompt } from '../../database/entities/CoworkPrompt'
import { InternalTHubError } from '../../errors/internalTHubError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { getAuthenticatedTenantId } from './utils'

const toStoredVariableMappings = (variableMappings: unknown, fewShotExamples: unknown): string | null => {
    const mappings =
        variableMappings && typeof variableMappings === 'object' && !Array.isArray(variableMappings)
            ? { ...(variableMappings as Record<string, unknown>) }
            : {}

    if (fewShotExamples !== undefined) {
        mappings.__fewShot = fewShotExamples
    }

    return Object.keys(mappings).length ? JSON.stringify(mappings) : null
}

const readStoredVariableMappings = (value: string | null | undefined): Record<string, unknown> => {
    if (!value) return {}
    try {
        const parsed = JSON.parse(value)
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
        return {}
    }
}

const assertPromptAccess = (prompt: CoworkPrompt, tenantId: string): void => {
    if (prompt.tenantId && prompt.tenantId !== tenantId) {
        throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Not your prompt')
    }
}

// GET /api/v1/cowork/prompts
const listPrompts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const prompts = await appServer.AppDataSource.getRepository(CoworkPrompt)
            .createQueryBuilder('p')
            .where('p.tenantId IS NULL OR p.tenantId = :tenantId', { tenantId })
            .orderBy('p.persona', 'ASC')
            .addOrderBy('p.version', 'DESC')
            .getMany()

        return res.json({ data: prompts, total: prompts.length })
    } catch (error) {
        next(error)
    }
}

// GET /api/v1/cowork/prompts/:id
const getPrompt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const prompt = await appServer.AppDataSource.getRepository(CoworkPrompt).findOneBy({ id: req.params.id })

        if (!prompt) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, 'Prompt not found')
        }
        assertPromptAccess(prompt, tenantId)

        return res.json(prompt)
    } catch (error) {
        next(error)
    }
}

// POST /api/v1/cowork/prompts
const createPrompt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getAuthenticatedTenantId(req)
        const { persona, templateContent, variableMappings, targetModel, fewShotExamples } = req.body || {}

        if (!persona || !templateContent) {
            throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'persona and templateContent are required')
        }

        const appServer = getRunningExpressApp()
        const repo = appServer.AppDataSource.getRepository(CoworkPrompt)
        const existing = await repo.findOne({
            where: { persona: String(persona), tenantId },
            order: { version: 'DESC' }
        })
        const nextVersion = existing ? existing.version + 1 : 1
        const prompt = await repo.save(
            repo.create({
                persona: String(persona),
                templateContent: String(templateContent),
                variableMappings: toStoredVariableMappings(variableMappings, fewShotExamples),
                targetModel: targetModel === undefined || targetModel === null ? null : String(targetModel),
                version: nextVersion,
                isDefault: false,
                tenantId
            })
        )

        return res.status(StatusCodes.CREATED).json(prompt)
    } catch (error) {
        next(error)
    }
}

// PUT /api/v1/cowork/prompts/:id
const updatePrompt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const repo = appServer.AppDataSource.getRepository(CoworkPrompt)
        const prompt = await repo.findOneBy({ id: req.params.id })

        if (!prompt) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, 'Prompt not found')
        }
        if (!prompt.tenantId) {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Cannot edit built-in prompts. Create a new version instead.')
        }
        assertPromptAccess(prompt, tenantId)

        const { templateContent, variableMappings, targetModel, isDefault, fewShotExamples } = req.body || {}

        if (templateContent !== undefined) prompt.templateContent = String(templateContent)
        if (targetModel !== undefined) prompt.targetModel = targetModel === null ? null : String(targetModel)
        if (variableMappings !== undefined || fewShotExamples !== undefined) {
            const mappings =
                variableMappings !== undefined
                    ? readStoredVariableMappings(toStoredVariableMappings(variableMappings, undefined))
                    : readStoredVariableMappings(prompt.variableMappings)
            if (fewShotExamples !== undefined) mappings.__fewShot = fewShotExamples
            prompt.variableMappings = Object.keys(mappings).length ? JSON.stringify(mappings) : null
        }

        if (isDefault !== undefined) {
            const nextDefault = Boolean(isDefault)
            if (nextDefault) {
                await repo
                    .createQueryBuilder()
                    .update(CoworkPrompt)
                    .set({ isDefault: false })
                    .where('tenantId = :tenantId AND persona = :persona AND id != :id', {
                        tenantId,
                        persona: prompt.persona,
                        id: prompt.id
                    })
                    .execute()
            }
            prompt.isDefault = nextDefault
        }

        await repo.save(prompt)
        return res.json(prompt)
    } catch (error) {
        next(error)
    }
}

// DELETE /api/v1/cowork/prompts/:id
const deletePrompt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = getAuthenticatedTenantId(req)
        const appServer = getRunningExpressApp()
        const repo = appServer.AppDataSource.getRepository(CoworkPrompt)
        const prompt = await repo.findOneBy({ id: req.params.id })

        if (!prompt) {
            throw new InternalTHubError(StatusCodes.NOT_FOUND, 'Prompt not found')
        }
        if (!prompt.tenantId) {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Cannot delete built-in prompts')
        }
        assertPromptAccess(prompt, tenantId)
        if (prompt.isDefault) {
            throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'Cannot delete active default prompt - set another as default first')
        }

        await repo.delete(req.params.id)
        return res.json({ message: 'Prompt deleted' })
    } catch (error) {
        next(error)
    }
}

export default { listPrompts, getPrompt, createPrompt, updatePrompt, deletePrompt }
