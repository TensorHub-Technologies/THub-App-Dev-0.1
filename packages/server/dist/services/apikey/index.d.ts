import { ApiKey } from '../../database/entities/ApiKey';
declare const _default: {
    createApiKey: (keyName: string, tenantId: string) => Promise<any>;
    deleteApiKey: (id: string, tenantId?: string) => Promise<any>;
    getAllApiKeys: (tenantId?: string) => Promise<any>;
    updateApiKey: (id: string, keyName: string, tenantId?: string) => Promise<any>;
    verifyApiKey: (paramApiKey: string) => Promise<string>;
    getApiKey: (apiKey: string) => Promise<import("thub-components").ICommonObject | ApiKey | undefined>;
    importKeys: (body: any) => Promise<any>;
};
export default _default;
