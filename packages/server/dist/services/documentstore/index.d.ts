import { ICommonObject, IDocument } from 'thub-components';
import { DataSource } from 'typeorm';
import { IDocumentStoreFileChunkPagedResponse, IDocumentStoreLoader, IDocumentStoreLoaderForPreview, IDocumentStoreRefreshData, IDocumentStoreUpsertData, IDocumentStoreWhereUsed, IExecuteDocStoreUpsert, IExecutePreviewLoader, IExecuteProcessLoader, IExecuteVectorStoreInsert, IOverrideConfig } from '../../Interface';
import { DocumentStore } from '../../database/entities/DocumentStore';
import { DocumentStoreFileChunk } from '../../database/entities/DocumentStoreFileChunk';
export declare const previewChunks: ({ appDataSource, componentNodes, data }: IExecutePreviewLoader) => Promise<{
    chunks: IDocument<Record<string, any>>[];
    totalChunks: number;
    previewChunkCount: number | undefined;
}>;
export declare const processLoader: ({ appDataSource, componentNodes, data, docLoaderId }: IExecuteProcessLoader) => Promise<IDocumentStoreFileChunkPagedResponse>;
export declare const insertIntoVectorStore: ({ appDataSource, componentNodes, telemetry, data, isStrictSave }: IExecuteVectorStoreInsert) => Promise<any>;
export declare const executeDocStoreUpsert: ({ appDataSource, componentNodes, telemetry, storeId, totalItems, files, isRefreshAPI }: IExecuteDocStoreUpsert) => Promise<any>;
export declare const findDocStoreAvailableConfigs: (storeId: string, docId: string) => Promise<IOverrideConfig[]>;
declare const _default: {
    updateDocumentStoreUsage: (chatId: string, storeId: string | undefined) => Promise<void>;
    deleteDocumentStore: (storeId: string) => Promise<{
        deleted: number | null | undefined;
    }>;
    createDocumentStore: (newDocumentStore: DocumentStore) => Promise<DocumentStore>;
    deleteLoaderFromDocumentStore: (storeId: string, docId: string) => Promise<DocumentStore>;
    getAllDocumentStores: (page?: number, limit?: number, tenantId?: string) => Promise<DocumentStore[] | {
        data: DocumentStore[];
        total: number;
    }>;
    getAllDocumentFileChunksByDocumentStoreIds: (documentStoreIds: string[]) => Promise<DocumentStoreFileChunk[]>;
    getDocumentStoreById: (storeId: string) => Promise<DocumentStore>;
    getUsedChatflowNames: (entity: DocumentStore) => Promise<IDocumentStoreWhereUsed[]>;
    getDocumentStoreFileChunks: (appDataSource: DataSource, storeId: string, docId: string, pageNo?: number) => Promise<IDocumentStoreFileChunkPagedResponse>;
    updateDocumentStore: (documentStore: DocumentStore, updatedDocumentStore: DocumentStore) => Promise<DocumentStore>;
    previewChunksMiddleware: (data: IDocumentStoreLoaderForPreview) => Promise<any>;
    saveProcessingLoader: (appDataSource: DataSource, data: IDocumentStoreLoaderForPreview) => Promise<IDocumentStoreLoader>;
    processLoaderMiddleware: (data: IDocumentStoreLoaderForPreview, docLoaderId: string, isInternalRequest?: boolean) => Promise<any>;
    deleteDocumentStoreFileChunk: (storeId: string, docId: string, chunkId: string) => Promise<IDocumentStoreFileChunkPagedResponse>;
    editDocumentStoreFileChunk: (storeId: string, docId: string, chunkId: string, content: string, metadata: ICommonObject) => Promise<IDocumentStoreFileChunkPagedResponse>;
    getDocumentLoaders: () => Promise<import("thub-components").INode[]>;
    insertIntoVectorStoreMiddleware: (data: ICommonObject, isStrictSave?: boolean) => Promise<any>;
    getEmbeddingProviders: () => Promise<import("thub-components").INode[]>;
    getVectorStoreProviders: () => Promise<import("thub-components").INode[]>;
    getRecordManagerProviders: () => Promise<import("thub-components").INode[]>;
    saveVectorStoreConfig: (appDataSource: DataSource, data: ICommonObject, isStrictSave?: boolean) => Promise<DocumentStore>;
    queryVectorStore: (data: ICommonObject) => Promise<{
        timeTaken: number;
        docs: any;
    }>;
    deleteVectorStoreFromStore: (storeId: string) => Promise<void>;
    updateVectorStoreConfigOnly: (data: ICommonObject) => Promise<{}>;
    upsertDocStoreMiddleware: (storeId: string, data: IDocumentStoreUpsertData, files?: Express.Multer.File[]) => Promise<any>;
    refreshDocStoreMiddleware: (storeId: string, data: IDocumentStoreRefreshData) => Promise<any>;
    generateDocStoreToolDesc: (docStoreId: string, selectedChatModel: ICommonObject) => Promise<string>;
    findDocStoreAvailableConfigs: (storeId: string, docId: string) => Promise<IOverrideConfig[]>;
};
export default _default;
