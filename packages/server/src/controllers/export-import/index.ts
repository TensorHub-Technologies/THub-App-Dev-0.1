import { NextFunction, Request, Response } from 'express'
import exportImportService from '../../services/export-import'

const exportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract tenantId from headers or adjust based on your setup (e.g., from req.body or req.params)
        const tenantId = req.body.tenantId

        if (!tenantId) {
            return res.status(400).json({ message: 'Tenant ID is required' })
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
        const importData = req.body
        await exportImportService.importData(importData)
        return res.json({ message: 'success' })
    } catch (error) {
        next(error)
    }
}

export default {
    exportData,
    importData
}
