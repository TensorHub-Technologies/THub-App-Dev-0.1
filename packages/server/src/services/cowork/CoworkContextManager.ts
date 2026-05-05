import Redis from 'ioredis'
import logger from '../../utils/logger'

const SHARED_MEMORY_TTL_SECONDS = 7 * 24 * 60 * 60

export type RedisClientLike = {
    status?: string
    connect?: () => Promise<void>
    quit?: () => Promise<void>
    disconnect?: () => void
    set(key: string, value: string, mode: 'EX', ttlSeconds: number): Promise<unknown>
    get(key: string): Promise<string | null>
    del(...keys: string[]): Promise<number>
    keys?: (pattern: string) => Promise<string[]>
    scan?: (cursor: string, ...args: string[]) => Promise<[string, string[]]>
}

type CoworkContextManagerDeps = {
    redisClient?: RedisClientLike | null
    ttlSeconds?: number
}

let redisSingleton: RedisClientLike | null | undefined

const buildSharedMemoryKey = (sessionId: string, key: string) => `cowork:${sessionId}:${key}`

const createDefaultRedisClient = (): RedisClientLike | null => {
    if (redisSingleton !== undefined) return redisSingleton

    try {
        if (process.env.REDIS_URL) {
            redisSingleton = new Redis(process.env.REDIS_URL, {
                lazyConnect: true,
                maxRetriesPerRequest: 1
            }) as unknown as RedisClientLike
            return redisSingleton
        }

        redisSingleton = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            username: process.env.REDIS_USERNAME || undefined,
            password: process.env.REDIS_PASSWORD || undefined,
            tls:
                process.env.REDIS_TLS === 'true'
                    ? {
                          cert: process.env.REDIS_CERT ? Buffer.from(process.env.REDIS_CERT, 'base64') : undefined,
                          key: process.env.REDIS_KEY ? Buffer.from(process.env.REDIS_KEY, 'base64') : undefined,
                          ca: process.env.REDIS_CA ? Buffer.from(process.env.REDIS_CA, 'base64') : undefined
                      }
                    : undefined,
            lazyConnect: true,
            maxRetriesPerRequest: 1
        }) as unknown as RedisClientLike
        return redisSingleton
    } catch (error) {
        logger.warn(`[cowork]: Redis initialization failed: ${String(error)}`)
        redisSingleton = null
        return null
    }
}

export class CoworkContextManager {
    private redisClient: RedisClientLike | null
    private ttlSeconds: number

    constructor(deps: CoworkContextManagerDeps = {}) {
        this.redisClient = deps.redisClient ?? createDefaultRedisClient()
        this.ttlSeconds = deps.ttlSeconds ?? SHARED_MEMORY_TTL_SECONDS
    }

    private async ensureConnected(): Promise<void> {
        if (!this.redisClient || !this.redisClient.connect) return
        const status = String(this.redisClient.status || '')
        if (status === 'ready' || status === 'connect' || status === 'connecting') return
        await this.redisClient.connect()
    }

    async setSharedMemory(sessionId: string, key: string, value: unknown): Promise<void> {
        if (!this.redisClient) return
        await this.ensureConnected()

        const redisKey = buildSharedMemoryKey(sessionId, key)
        await this.redisClient.set(redisKey, JSON.stringify(value), 'EX', this.ttlSeconds)
    }

    async getSharedMemory(sessionId: string, key: string): Promise<string | null> {
        if (!this.redisClient) return null
        await this.ensureConnected()

        const redisKey = buildSharedMemoryKey(sessionId, key)
        const value = await this.redisClient.get(redisKey)
        if (value === null) return null

        try {
            const parsed = JSON.parse(value) as unknown
            if (typeof parsed === 'string') return parsed
            return JSON.stringify(parsed)
        } catch {
            return value
        }
    }

    async cleanupSessionMemory(sessionId: string): Promise<void> {
        if (!this.redisClient) return
        await this.ensureConnected()

        const pattern = buildSharedMemoryKey(sessionId, '*')
        const keys: string[] = []

        if (this.redisClient.scan) {
            let cursor = '0'
            do {
                const [nextCursor, scannedKeys] = await this.redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', '100')
                cursor = nextCursor
                keys.push(...scannedKeys)
            } while (cursor !== '0')
        } else if (this.redisClient.keys) {
            keys.push(...(await this.redisClient.keys(pattern)))
        }

        if (keys.length > 0) {
            await this.redisClient.del(...keys)
        }
    }

    async close(): Promise<void> {
        if (!this.redisClient) return
        if (this.redisClient.quit) {
            await this.redisClient.quit()
            return
        }
        if (this.redisClient.disconnect) {
            this.redisClient.disconnect()
        }
    }
}

export const createCoworkContextManager = (deps: CoworkContextManagerDeps = {}) => new CoworkContextManager(deps)
