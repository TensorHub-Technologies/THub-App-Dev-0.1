import express from 'express'
import { Request, Response } from 'express'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { User } from '../../database/entities/User'
import logger from '../../utils/logger'

const router = express.Router()

router.post('/', async (req: Request, res: Response) => {
    try {
        const { uid, company, department, designation, workspace, profile_completed, profile_skipped } = req.body

        if (!uid) return res.status(400).json({ message: 'uid is required' })

        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const user = await userRepo.findOneBy({ uid })
        if (!user) return res.status(404).json({ message: 'User not found' })

        if (company !== undefined) user.company = company
        if (department !== undefined) user.department = department
        if (designation !== undefined) user.designation = designation
        if (workspace !== undefined) user.workspace = workspace
        if (profile_completed !== undefined) user.profile_completed = profile_completed
        if (profile_skipped !== undefined) user.profile_skipped = profile_skipped

        await userRepo.save(user)

        logger.info(`[user-update]: Updated profile for uid=${uid}`)
        return res.json({ message: 'Profile updated' })
    } catch (error) {
        logger.error(`[user-update]: ${error}`)
        return res.status(500).json({ message: 'Update failed' })
    }
})

export default router
