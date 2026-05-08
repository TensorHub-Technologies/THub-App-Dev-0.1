import express, { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { getUsageSummary } from '../../services/analytics'
import { InternalTHubError } from '../../errors/internalTHubError'

const router = express.Router()
router.get('/usage', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.user?.id
        if (!tenantId) throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authentication required')
        const from = req.query.from
            ? new Date(req.query.from as string)
            : (() => {
                  const d = new Date()
                  d.setDate(d.getDate() - 30)
                  return d
              })()
        const to = req.query.to ? new Date(req.query.to as string) : new Date()
        return res.json(await getUsageSummary(tenantId, from, to))
    } catch (error) {
        next(error)
    }
})

export default router
