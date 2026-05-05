import { IActiveCache } from './Interface';
/**
 * This pool is to keep track of in-memory cache used for LLM and Embeddings
 */
export declare class CachePool {
    private redisClient;
    activeLLMCache: IActiveCache;
    activeEmbeddingCache: IActiveCache;
    constructor();
    /**
     * Add to the llm cache pool
     * @param {string} chatflowid
     * @param {Map<any, any>} value
     */
    addLLMCache(chatflowid: string, value: Map<any, any>): Promise<void>;
    /**
     * Add to the embedding cache pool
     * @param {string} chatflowid
     * @param {Map<any, any>} value
     */
    addEmbeddingCache(chatflowid: string, value: Map<any, any>): Promise<void>;
    /**
     * Get item from llm cache pool
     * @param {string} chatflowid
     */
    getLLMCache(chatflowid: string): Promise<Map<any, any> | undefined>;
    /**
     * Get item from embedding cache pool
     * @param {string} chatflowid
     */
    getEmbeddingCache(chatflowid: string): Promise<Map<any, any> | undefined>;
    /**
     * Close Redis connection if applicable
     */
    close(): Promise<void>;
}
export declare function getInstance(): CachePool;
