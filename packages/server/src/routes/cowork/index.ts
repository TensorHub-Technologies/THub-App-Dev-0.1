import express, { Request, Response, NextFunction } from 'express'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { listModelProfiles, updateModelProfile } from '../../services/cowork/ModelRouter'
import { StatusCodes } from 'http-status-codes'

const router = express.Router()

router.get('/models', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const appServer = getRunningExpressApp()
        const profiles = await listModelProfiles(appServer.AppDataSource)
        return res.json(profiles)
    } catch (error) {
        next(error)
    }
})

router.put('/models/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const appServer = getRunningExpressApp()
        try {
            const updated = await updateModelProfile(id, req.body, appServer.AppDataSource)
            return res.json(updated)
        } catch (err: unknown) {
            if (err instanceof Error && err.message.includes('not found')) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: err.message })
            }
            throw err
        }
    } catch (error) {
        next(error)
    }
})

export default router
