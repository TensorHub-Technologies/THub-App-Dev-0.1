import { Assistant } from '../../database/entities/Assistant';
import { DeleteResult, QueryRunner } from 'typeorm';
import { AssistantType } from '../../Interface';
import { ICommonObject } from 'thub-components';
declare const _default: {
    createAssistant: (requestBody: any) => Promise<Assistant>;
    deleteAssistant: (assistantId: string, isDeleteBoth: any) => Promise<DeleteResult>;
    getAllAssistants: (type?: AssistantType, tenantId?: string) => Promise<Assistant[]>;
    getAssistantById: (assistantId: string) => Promise<Assistant>;
    updateAssistant: (assistantId: string, requestBody: any) => Promise<Assistant>;
    importAssistants: (newAssistants: Partial<Assistant>[], queryRunner?: QueryRunner) => Promise<any>;
    getChatModels: () => Promise<any>;
    getDocumentStores: (tenantId?: string) => Promise<any>;
    getTools: () => Promise<any>;
    generateAssistantInstruction: (task: string, selectedChatModel: ICommonObject) => Promise<ICommonObject>;
};
export default _default;
