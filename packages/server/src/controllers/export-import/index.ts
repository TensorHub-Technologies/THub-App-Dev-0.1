import { NextFunction, Request, Response } from 'express'
import exportImportService from '../../services/export-import'

const assignTenantOwnership = (payload: Record<string, any>, tenantId: string) => {
    const tenantScopedCollections = [
        'AgentFlow',
        'AgentFlowV2',
        'AssistantCustom',
        'AssistantFlow',
        'AssistantOpenAI',
        'AssistantAzure',
        'ChatFlow',
        'DocumentStore',
        'Execution',
        'Tool',
        'Variable'
    ]

    for (const key of tenantScopedCollections) {
        if (!Array.isArray(payload[key])) continue
        payload[key] = payload[key].map((item: Record<string, any>) => ({
            ...item,
            tenantId
        }))
    }

    return payload
}

const exportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.user?.id
        if (!tenantId) {
            return res.status(401).json({ message: 'Authentication required' })
        }

        const exportInput = exportImportService.convertExportInput(req.body)
        const apiResponse = await exportImportService.exportData(exportInput, tenantId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const importData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.user?.id
        if (!tenantId) {
            return res.status(401).json({ message: 'Authentication required' })
        }

        const importData = assignTenantOwnership({ ...req.body }, tenantId)
        await exportImportService.importData(importData as any)
        return res.json({ message: 'success' })
    } catch (error) {
        next(error)
    }
}

export default {
    exportData,
    importData
}
