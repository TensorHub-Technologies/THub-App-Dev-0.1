"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const documentstore_1 = __importDefault(require("../../controllers/documentstore"));
const utils_1 = require("../../utils");
const authorizeResource_1 = __importDefault(require("../../middlewares/authorizeResource"));
const DocumentStore_1 = require("../../database/entities/DocumentStore");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const router = express_1.default.Router();
const getDocumentStoreByIdFromDB = async (id) => {
    if (!id)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    return await appServer.AppDataSource.getRepository(DocumentStore_1.DocumentStore).findOneBy({ id });
};
const getDocumentStoreFromBody = async (req) => {
    return await getDocumentStoreByIdFromDB(req.body?.storeId);
};
router.post('/upsert/:id', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.id), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), (0, utils_1.getMulterStorage)().array('files'), documentstore_1.default.upsertDocStoreMiddleware);
router.post('/refresh/:id', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.id), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), documentstore_1.default.refreshDocStoreMiddleware);
/** Document Store Routes */
// Create document store
router.post('/store', documentstore_1.default.createDocumentStore);
// List all stores
router.get('/store', documentstore_1.default.getAllDocumentStores);
// Get specific store
router.get('/store/:id', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.id), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to access this document store'
}), documentstore_1.default.getDocumentStoreById);
// Update documentStore
router.put('/store/:id', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.id), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to update this document store'
}), documentstore_1.default.updateDocumentStore);
// Delete documentStore
router.delete('/store/:id', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.id), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to delete this document store'
}), documentstore_1.default.deleteDocumentStore);
// Get document store configs
router.get('/store-configs/:id/:loaderId', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.id), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to access this document store'
}), documentstore_1.default.getDocStoreConfigs);
/** Component Nodes = Document Store - Loaders */
// Get all loaders
router.get('/components/loaders', documentstore_1.default.getDocumentLoaders);
// delete loader from document store
router.delete('/loader/:id/:loaderId', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.id), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), documentstore_1.default.deleteLoaderFromDocumentStore);
// chunking preview
router.post('/loader/preview', documentstore_1.default.previewFileChunks);
// saving process
router.post('/loader/save', (0, authorizeResource_1.default)((req) => getDocumentStoreFromBody(req), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), documentstore_1.default.saveProcessingLoader);
// chunking process
router.post('/loader/process/:loaderId', (0, authorizeResource_1.default)((req) => getDocumentStoreFromBody(req), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), documentstore_1.default.processLoader);
/** Document Store - Loaders - Chunks */
// delete specific file chunk from the store
router.delete('/chunks/:storeId/:loaderId/:chunkId', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.storeId), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), documentstore_1.default.deleteDocumentStoreFileChunk);
// edit specific file chunk from the store
router.put('/chunks/:storeId/:loaderId/:chunkId', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.storeId), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), documentstore_1.default.editDocumentStoreFileChunk);
// Get all file chunks from the store
router.get('/chunks/:storeId/:fileId/:pageNo', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.storeId), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to access this document store'
}), documentstore_1.default.getDocumentStoreFileChunks);
// add chunks to the selected vector store
router.post('/vectorstore/insert', (0, authorizeResource_1.default)((req) => getDocumentStoreFromBody(req), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), documentstore_1.default.insertIntoVectorStore);
// save the selected vector store
router.post('/vectorstore/save', (0, authorizeResource_1.default)((req) => getDocumentStoreFromBody(req), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), documentstore_1.default.saveVectorStoreConfig);
// delete data from the selected vector store
router.delete('/vectorstore/:storeId', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.storeId), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), documentstore_1.default.deleteVectorStoreFromStore);
// query the vector store
router.post('/vectorstore/query', (0, authorizeResource_1.default)((req) => getDocumentStoreFromBody(req), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to access this document store'
}), documentstore_1.default.queryVectorStore);
// Get all embedding providers
router.get('/components/embeddings', documentstore_1.default.getEmbeddingProviders);
// Get all vector store providers
router.get('/components/vectorstore', documentstore_1.default.getVectorStoreProviders);
// Get all Record Manager providers
router.get('/components/recordmanager', documentstore_1.default.getRecordManagerProviders);
// update the selected vector store from the playground
router.post('/vectorstore/update', (0, authorizeResource_1.default)((req) => getDocumentStoreFromBody(req), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to modify this document store'
}), documentstore_1.default.updateVectorStoreConfigOnly);
// generate docstore tool description
router.post('/generate-tool-desc/:id', (0, authorizeResource_1.default)((req) => getDocumentStoreByIdFromDB(req.params.id), {
    notFoundMessage: 'Document store not found',
    forbiddenMessage: 'You are not allowed to access this document store'
}), documentstore_1.default.generateDocStoreToolDesc);
exports.default = router;
//# sourceMappingURL=index.js.map