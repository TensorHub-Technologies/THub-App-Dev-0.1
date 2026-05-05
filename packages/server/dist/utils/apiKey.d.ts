import { ICommonObject } from 'thub-components';
/**
 * Returns the api key path
 * @returns {string}
 */
export declare const getAPIKeyPath: () => string;
/**
 * Generate the api key
 * @returns {string}
 */
export declare const generateAPIKey: () => string;
/**
 * Generate the secret key
 * @param {string} apiKey
 * @returns {string}
 */
export declare const generateSecretHash: (apiKey: string) => string;
/**
 * Verify valid keys
 * @param {string} storedKey
 * @param {string} suppliedKey
 * @returns {boolean}
 */
export declare const compareKeys: (storedKey: string, suppliedKey: string) => boolean;
/**
 * Get API keys
 * @returns {Promise<ICommonObject[]>}
 */
export declare const getAPIKeys: () => Promise<ICommonObject[]>;
/**
 * Add new API key
 * @param {string} keyName
 * @returns {Promise<ICommonObject[]>}
 */
export declare const addAPIKey: (keyName: string, tenantId?: string) => Promise<ICommonObject[]>;
/**
 * import API keys
 * @param {[]} keys
 * @returns {Promise<ICommonObject[]>}
 */
export declare const importKeys: (keys: any[], importMode: string) => Promise<ICommonObject[]>;
/**
 * Get API Key details
 * @param {string} apiKey
 * @returns {Promise<ICommonObject[]>}
 */
export declare const getApiKey: (apiKey: string) => Promise<ICommonObject | undefined>;
/**
 * Update existing API key
 * @param {string} keyIdToUpdate
 * @param {string} newKeyName
 * @returns {Promise<ICommonObject[]>}
 */
export declare const updateAPIKey: (keyIdToUpdate: string, newKeyName: string, tenantId?: string) => Promise<ICommonObject[]>;
/**
 * Delete API key
 * @param {string} keyIdToDelete
 * @returns {Promise<ICommonObject[]>}
 */
export declare const deleteAPIKey: (keyIdToDelete: string, tenantId?: string) => Promise<ICommonObject[]>;
/**
 * Replace all api keys
 * @param {ICommonObject[]} content
 * @returns {Promise<void>}
 */
export declare const replaceAllAPIKeys: (content: ICommonObject[]) => Promise<void>;
