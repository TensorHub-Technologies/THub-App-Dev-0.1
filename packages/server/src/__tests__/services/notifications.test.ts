import { sendOtp, verifyOtp } from '../../services/notifications'
import { StatusCodes } from 'http-status-codes'
import { InternalTHubError } from '../../errors/internalTHubError'

jest.mock('../../utils/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }
}))

// Mock redis createClient
const mockRedis = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    setEx: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(1)
}

jest.mock('redis', () => ({
    createClient: jest.fn(() => mockRedis)
}))

beforeEach(() => {
    jest.clearAllMocks()
    mockRedis.connect.mockResolvedValue(undefined)
    mockRedis.disconnect.mockResolvedValue(undefined)
    mockRedis.setEx.mockResolvedValue('OK')
    mockRedis.del.mockResolvedValue(1)
})

// ── TC-3.8 sendOtp stores OTP in Redis ───────────────────────────────────────

describe('TC-3.11 OTP stored in Redis (survives restart)', () => {
    it('calls setEx with otp:{email} key and 300s TTL', async () => {
        await sendOtp('user@test.com')

        expect(mockRedis.connect).toHaveBeenCalledTimes(1)
        expect(mockRedis.setEx).toHaveBeenCalledWith('otp:user@test.com', 300, expect.stringMatching(/^\d{6}$/))
        expect(mockRedis.disconnect).toHaveBeenCalledTimes(1)
    })

    it('throws InternalTHubError when Redis fails', async () => {
        mockRedis.connect.mockRejectedValue(new Error('Redis down'))

        await expect(sendOtp('user@test.com')).rejects.toBeInstanceOf(InternalTHubError)
    })
})

// ── TC-3.11/3.12 verifyOtp ───────────────────────────────────────────────────

describe('verifyOtp', () => {
    it('TC-3.11 returns true on correct OTP and deletes Redis key', async () => {
        mockRedis.get.mockResolvedValue('123456')

        const result = await verifyOtp('user@test.com', '123456')

        expect(result).toBe(true)
        expect(mockRedis.del).toHaveBeenCalledWith('otp:user@test.com')
        expect(mockRedis.disconnect).toHaveBeenCalled()
    })

    it('TC-3.10 throws BAD_REQUEST when Redis key not found (OTP expired)', async () => {
        mockRedis.get.mockResolvedValue(null)

        await expect(verifyOtp('user@test.com', '123456')).rejects.toMatchObject({
            statusCode: StatusCodes.BAD_REQUEST,
            message: expect.stringContaining('OTP expired')
        })
    })

    it('TC-3.12 throws BAD_REQUEST on wrong OTP (key stays gone after delete)', async () => {
        mockRedis.get.mockResolvedValue('654321')

        await expect(verifyOtp('user@test.com', '000000')).rejects.toMatchObject({
            statusCode: StatusCodes.BAD_REQUEST,
            message: expect.stringContaining('Invalid OTP')
        })
        expect(mockRedis.del).not.toHaveBeenCalled()
    })

    it('does not delete key when OTP is wrong', async () => {
        mockRedis.get.mockResolvedValue('999999')

        await expect(verifyOtp('user@test.com', '111111')).rejects.toBeDefined()
        expect(mockRedis.del).not.toHaveBeenCalled()
    })

    it('throws INTERNAL_SERVER_ERROR on unexpected Redis error', async () => {
        mockRedis.get.mockRejectedValue(new Error('Redis crash'))

        await expect(verifyOtp('user@test.com', '123456')).rejects.toMatchObject({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR
        })
    })
})
