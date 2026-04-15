import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import Razorpay from 'razorpay'
import { InternalTHubError } from '../errors/internalTHubError'

const getRequiredEnv = (envKey: 'RAZORPAY_KEY_ID' | 'RAZORPAY_SECRET') => {
    const value = String(process.env[envKey] || '').trim()
    if (!value) {
        throw new InternalTHubError(StatusCodes.SERVICE_UNAVAILABLE, `${envKey} is not configured`)
    }
    return value
}

export const getRazorpayClient = () => {
    return new Razorpay({
        key_id: getRequiredEnv('RAZORPAY_KEY_ID'),
        key_secret: getRequiredEnv('RAZORPAY_SECRET')
    })
}

export const verifyRazorpaySubscriptionSignature = (subscriptionId: string, paymentId: string, signature: string) => {
    const secret = getRequiredEnv('RAZORPAY_SECRET')
    const payload = `${paymentId}|${subscriptionId}`
    const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex')

    const digestBuffer = Buffer.from(digest)
    const signatureBuffer = Buffer.from(signature)

    if (digestBuffer.length !== signatureBuffer.length) return false
    return crypto.timingSafeEqual(digestBuffer, signatureBuffer)
}
