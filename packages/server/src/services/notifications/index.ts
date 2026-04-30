import { createClient } from 'redis'
import { StatusCodes } from 'http-status-codes'
import { InternalTHubError } from '../../errors/internalTHubError'
import { getErrorMessage } from '../../errors/utils'
import logger from '../../utils/logger'

const OTP_TTL = 300

const getRedis = () =>
    createClient({
        url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    })

export const sendOtp = async (email: string): Promise<void> => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const redis = getRedis()
        await redis.connect()
        await redis.setEx(`otp:${email}`, OTP_TTL, otp)
        await redis.disconnect()
        logger.info(`[notifications]: OTP stored in Redis for ${email}`)
        // TODO: wire to transporter — import transporter from '../../utils/transporter'
    } catch (error) {
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: notificationService.sendOtp - ${getErrorMessage(error)}`)
    }
}

export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
        const redis = getRedis()
        await redis.connect()
        const stored = await redis.get(`otp:${email}`)
        if (!stored) throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'OTP expired — request a new one')
        if (stored !== otp) throw new InternalTHubError(StatusCodes.BAD_REQUEST, 'Invalid OTP')
        await redis.del(`otp:${email}`)
        await redis.disconnect()
        return true
    } catch (error) {
        if (error instanceof InternalTHubError) throw error
        throw new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: notificationService.verifyOtp - ${getErrorMessage(error)}`)
    }
}

export const sendContactMail = async (body: { name: string; email: string; message: string }): Promise<void> => {
    logger.info(`[notifications]: Contact mail from ${body.email}`)
    // TODO: wire to transporter
}

export default { sendOtp, verifyOtp, sendContactMail }
