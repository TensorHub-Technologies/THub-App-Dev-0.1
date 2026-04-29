// Mock service before imports resolve
jest.mock('../../services/notifications', () => ({
    __esModule: true,
    default: {
        sendOtp: jest.fn(),
        verifyOtp: jest.fn(),
        sendContactMail: jest.fn()
    }
}))

import express from 'express'
import request from 'supertest'
import notificationsRouter from '../../routes/notifications'
import notificationService from '../../services/notifications'
import { StatusCodes } from 'http-status-codes'

const mockSendOtp = notificationService.sendOtp as jest.MockedFunction<typeof notificationService.sendOtp>
const mockVerifyOtp = notificationService.verifyOtp as jest.MockedFunction<typeof notificationService.verifyOtp>
const mockSendContactMail = notificationService.sendContactMail as jest.MockedFunction<typeof notificationService.sendContactMail>

// Minimal Express app — no auth middleware (routes are pre-auth whitelisted)
const app = express()
app.use(express.json())
app.use('/api/v1/notifications', notificationsRouter)
// Generic error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({ message: err.message })
})

beforeEach(() => jest.clearAllMocks())

// ── POST /api/v1/notifications/otp/send ──────────────────────────────────────

describe('POST /api/v1/notifications/otp/send', () => {
    it('returns 200 { message: OTP sent } on success', async () => {
        mockSendOtp.mockResolvedValue(undefined)

        const res = await request(app).post('/api/v1/notifications/otp/send').send({ email: 'user@test.com' })

        expect(res.status).toBe(StatusCodes.OK)
        expect(res.body).toEqual({ message: 'OTP sent' })
        expect(mockSendOtp).toHaveBeenCalledWith('user@test.com')
    })

    it('returns 400 when email missing', async () => {
        const res = await request(app).post('/api/v1/notifications/otp/send').send({})

        expect(res.status).toBe(StatusCodes.BAD_REQUEST)
        expect(mockSendOtp).not.toHaveBeenCalled()
    })

    it('forwards service error to error handler', async () => {
        const { InternalTHubError } = await import('../../errors/internalTHubError')
        mockSendOtp.mockRejectedValue(new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, 'Redis down'))

        const res = await request(app).post('/api/v1/notifications/otp/send').send({ email: 'user@test.com' })

        expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
    })
})

// ── POST /api/v1/notifications/otp/verify ────────────────────────────────────

describe('POST /api/v1/notifications/otp/verify', () => {
    it('returns 200 { message: OTP verified } on correct OTP', async () => {
        mockVerifyOtp.mockResolvedValue(true)

        const res = await request(app).post('/api/v1/notifications/otp/verify').send({ email: 'user@test.com', otp: '123456' })

        expect(res.status).toBe(StatusCodes.OK)
        expect(res.body).toEqual({ message: 'OTP verified' })
        expect(mockVerifyOtp).toHaveBeenCalledWith('user@test.com', '123456')
    })

    it('returns 400 when email missing', async () => {
        const res = await request(app).post('/api/v1/notifications/otp/verify').send({ otp: '123456' })

        expect(res.status).toBe(StatusCodes.BAD_REQUEST)
        expect(mockVerifyOtp).not.toHaveBeenCalled()
    })

    it('returns 400 when otp missing', async () => {
        const res = await request(app).post('/api/v1/notifications/otp/verify').send({ email: 'user@test.com' })

        expect(res.status).toBe(StatusCodes.BAD_REQUEST)
        expect(mockVerifyOtp).not.toHaveBeenCalled()
    })

    it('returns 400 on expired OTP (service throws)', async () => {
        const { InternalTHubError } = await import('../../errors/internalTHubError')
        mockVerifyOtp.mockRejectedValue(new InternalTHubError(StatusCodes.BAD_REQUEST, 'OTP expired — request a new one'))

        const res = await request(app).post('/api/v1/notifications/otp/verify').send({ email: 'user@test.com', otp: '000000' })

        expect(res.status).toBe(StatusCodes.BAD_REQUEST)
        expect(res.body.message).toContain('OTP expired')
    })

    it('returns 400 on invalid OTP (service throws)', async () => {
        const { InternalTHubError } = await import('../../errors/internalTHubError')
        mockVerifyOtp.mockRejectedValue(new InternalTHubError(StatusCodes.BAD_REQUEST, 'Invalid OTP'))

        const res = await request(app).post('/api/v1/notifications/otp/verify').send({ email: 'user@test.com', otp: '999999' })

        expect(res.status).toBe(StatusCodes.BAD_REQUEST)
        expect(res.body.message).toContain('Invalid OTP')
    })
})

// ── POST /api/v1/notifications/contact ───────────────────────────────────────

describe('POST /api/v1/notifications/contact', () => {
    it('returns 200 { message: Message received } on success', async () => {
        mockSendContactMail.mockResolvedValue(undefined)

        const res = await request(app)
            .post('/api/v1/notifications/contact')
            .send({ name: 'Alice', email: 'alice@test.com', message: 'Hello' })

        expect(res.status).toBe(StatusCodes.OK)
        expect(res.body).toEqual({ message: 'Message received' })
        expect(mockSendContactMail).toHaveBeenCalledWith({
            name: 'Alice',
            email: 'alice@test.com',
            message: 'Hello'
        })
    })

    it('forwards service error to error handler', async () => {
        const { InternalTHubError } = await import('../../errors/internalTHubError')
        mockSendContactMail.mockRejectedValue(new InternalTHubError(StatusCodes.INTERNAL_SERVER_ERROR, 'Mail failed'))

        const res = await request(app).post('/api/v1/notifications/contact').send({ name: 'Bob', email: 'bob@test.com', message: 'Hi' })

        expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
    })
})
