"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachePool = void 0;
exports.getInstance = getInstance;
const Interface_1 = require("./Interface");
const ioredis_1 = __importDefault(require("ioredis"));
/**
 * This pool is to keep track of in-memory cache used for LLM and Embeddings
 */
class CachePool {
    constructor() {
        this.redisClient = null;
        this.activeLLMCache = {};
        this.activeEmbeddingCache = {};
        if (process.env.MODE === Interface_1.MODE.QUEUE) {
            if (process.env.REDIS_URL) {
                this.redisClient = new ioredis_1.default(process.env.REDIS_URL, {
                    keepAlive: process.env.REDIS_KEEP_ALIVE && !isNaN(parseInt(process.env.REDIS_KEEP_ALIVE, 10))
                        ? parseInt(process.env.REDIS_KEEP_ALIVE, 10)
                        : undefined
                });
            }
            else {
                this.redisClient = new ioredis_1.default({
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    username: process.env.REDIS_USERNAME || undefined,
                    password: process.env.REDIS_PASSWORD || undefined,
                    tls: process.env.REDIS_TLS === 'true'
                        ? {
                            cert: process.env.REDIS_CERT ? Buffer.from(process.env.REDIS_CERT, 'base64') : undefined,
                            key: process.env.REDIS_KEY ? Buffer.from(process.env.REDIS_KEY, 'base64') : undefined,
                            ca: process.env.REDIS_CA ? Buffer.from(process.env.REDIS_CA, 'base64') : undefined
                        }
                        : undefined,
                    keepAlive: process.env.REDIS_KEEP_ALIVE && !isNaN(parseInt(process.env.REDIS_KEEP_ALIVE, 10))
                        ? parseInt(process.env.REDIS_KEEP_ALIVE, 10)
                        : undefined
                });
            }
        }
    }
    /**
     * Add to the llm cache pool
     * @param {string} chatflowid
     * @param {Map<any, any>} value
     */
    async addLLMCache(chatflowid, value) {
        if (process.env.MODE === Interface_1.MODE.QUEUE) {
            if (this.redisClient) {
                const serializedValue = JSON.stringify(Array.from(value.entries()));
                await this.redisClient.set(`llmCache:${chatflowid}`, serializedValue);
            }
        }
        else {
            this.activeLLMCache[chatflowid] = value;
        }
    }
    /**
     * Add to the embedding cache pool
     * @param {string} chatflowid
     * @param {Map<any, any>} value
     */
    async addEmbeddingCache(chatflowid, value) {
        if (process.env.MODE === Interface_1.MODE.QUEUE) {
            if (this.redisClient) {
                const serializedValue = JSON.stringify(Array.from(value.entries()));
                await this.redisClient.set(`embeddingCache:${chatflowid}`, serializedValue);
            }
        }
        else {
            this.activeEmbeddingCache[chatflowid] = value;
        }
    }
    /**
     * Get item from llm cache pool
     * @param {string} chatflowid
     */
    async getLLMCache(chatflowid) {
        if (process.env.MODE === Interface_1.MODE.QUEUE) {
            if (this.redisClient) {
                const serializedValue = await this.redisClient.get(`llmCache:${chatflowid}`);
                if (serializedValue) {
                    return new Map(JSON.parse(serializedValue));
                }
            }
        }
        else {
            return this.activeLLMCache[chatflowid];
        }
        return undefined;
    }
    /**
     * Get item from embedding cache pool
     * @param {string} chatflowid
     */
    async getEmbeddingCache(chatflowid) {
        if (process.env.MODE === Interface_1.MODE.QUEUE) {
            if (this.redisClient) {
                const serializedValue = await this.redisClient.get(`embeddingCache:${chatflowid}`);
                if (serializedValue) {
                    return new Map(JSON.parse(serializedValue));
                }
            }
        }
        else {
            return this.activeEmbeddingCache[chatflowid];
        }
        return undefined;
    }
    /**
     * Close Redis connection if applicable
     */
    async close() {
        if (this.redisClient) {
            await this.redisClient.quit();
        }
    }
}
exports.CachePool = CachePool;
let cachePoolInstance;
function getInstance() {
    if (cachePoolInstance === undefined) {
        cachePoolInstance = new CachePool();
    }
    return cachePoolInstance;
}
//# sourceMappingURL=CachePool.js.map