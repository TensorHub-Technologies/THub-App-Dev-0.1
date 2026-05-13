// jest.mock must reference variables starting with 'mock' to avoid hoisting issues
const mockRedisStore = new Map<string, string>()
const mockRedisClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    setEx: jest.fn().mockImplementation(async (key: string, _ttl: number, value: string) => {
        mockRedisStore.set(key, value)
    }),
    get: jest.fn().mockImplementation(async (key: string) => mockRedisStore.get(key) ?? null),
    del: jest.fn().mockImplementation(async (key: string) => {
        mockRedisStore.delete(key)
    })
}

jest.mock('redis', () => ({
    createClient: jest.fn(() => mockRedisClient)
}))

import { sendOtp, verifyOtp } from '../../../services/notifications'

const TEST_EMAIL = 'user@test.com'

beforeEach(() => {
    mockRedisStore.clear()
    jest.clearAllMocks()
    // Restore default implementations after clearAllMocks
    mockRedisClient.connect.mockResolvedValue(undefined)
    mockRedisClient.disconnect.mockResolvedValue(undefined)
    mockRedisClient.setEx.mockImplementation(async (key: string, _ttl: number, value: string) => {
        mockRedisStore.set(key, value)
    })
    mockRedisClient.get.mockImplementation(async (key: string) => mockRedisStore.get(key) ?? null)
    mockRedisClient.del.mockImplementation(async (key: string) => {
        mockRedisStore.delete(key)
    })
})

describe('TC-3.11 OTP stored in Redis (restart-resilient)', () => {
    it('stores OTP under otp:{email} key with 300s TTL via setEx', async () => {
        await sendOtp(TEST_EMAIL)

        expect(mockRedisClient.setEx).toHaveBeenCalledTimes(1)
        const [key, ttl] = mockRedisClient.setEx.mock.calls[0]
        expect(key).toBe(`otp:${TEST_EMAIL}`)
        expect(ttl).toBe(300)
    })

    it('verifyOtp reads from Redis and succeeds with the stored OTP', async () => {
        await sendOtp(TEST_EMAIL)

        // Capture the OTP stored in Redis (randomly generated inside sendOtp)
        const storedOtp = mockRedisStore.get(`otp:${TEST_EMAIL}`)
        expect(storedOtp).toBeDefined()
        expect(storedOtp).toMatch(/^\d{6}$/)

        const result = await verifyOtp(TEST_EMAIL, storedOtp!)
        expect(result).toBe(true)
    })

    it('OTP is only retrievable via Redis get — not from any module-level in-memory state', async () => {
        await sendOtp(TEST_EMAIL)
        const storedOtp = mockRedisStore.get(`otp:${TEST_EMAIL}`)!

        // Simulate restart: clear module-level state cannot be done, but verify
        // data path explicitly goes through redis.get (not any Map)
        expect(mockRedisClient.get).not.toHaveBeenCalled()
        await verifyOtp(TEST_EMAIL, storedOtp)
        expect(mockRedisClient.get).toHaveBeenCalledWith(`otp:${TEST_EMAIL}`)
    })
})

describe('TC-3.12 OTP one-time use', () => {
    it('deletes Redis key after successful verification', async () => {
        await sendOtp(TEST_EMAIL)
        const storedOtp = mockRedisStore.get(`otp:${TEST_EMAIL}`)!

        await verifyOtp(TEST_EMAIL, storedOtp)

        expect(mockRedisClient.del).toHaveBeenCalledWith(`otp:${TEST_EMAIL}`)
        expect(mockRedisStore.has(`otp:${TEST_EMAIL}`)).toBe(false)
    })

    it('throws OTP expired error when same OTP used a second time', async () => {
        await sendOtp(TEST_EMAIL)
        const storedOtp = mockRedisStore.get(`otp:${TEST_EMAIL}`)!

        await verifyOtp(TEST_EMAIL, storedOtp)

        // Second attempt — key was deleted
        await expect(verifyOtp(TEST_EMAIL, storedOtp)).rejects.toMatchObject({
            message: expect.stringContaining('OTP expired')
        })
    })

    it('throws on incorrect OTP without deleting the key', async () => {
        await sendOtp(TEST_EMAIL)

        await expect(verifyOtp(TEST_EMAIL, '000000')).rejects.toMatchObject({
            message: expect.stringContaining('Invalid OTP')
        })

        // Key should still exist for a retry with correct OTP
        expect(mockRedisStore.has(`otp:${TEST_EMAIL}`)).toBe(true)
    })
})
