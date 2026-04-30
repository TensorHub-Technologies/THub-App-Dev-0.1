import express, { Request, Response, NextFunction } from 'express'
import notificationService from '../../services/notifications'
import { InternalTHubError } from '../../errors/internalTHubError'
import { StatusCodes } from 'http-status-codes'

const router = express.Router()

router.post('/otp/send', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        if (!email) throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'email is required')
        await notificationService.sendOtp(email)
        return res.json({ message: 'OTP sent' })
    } catch (error) {
        next(error)
    }
})

router.post('/otp/verify', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body
        if (!email || !otp) throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'email and otp are required')
        await notificationService.verifyOtp(email, otp)
        return res.json({ message: 'OTP verified' })
    } catch (error) {
        next(error)
    }
})

router.post('/contact', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await notificationService.sendContactMail(req.body)
        return res.json({ message: 'Message received' })
    } catch (error) {
        next(error)
    }
})

export default router
