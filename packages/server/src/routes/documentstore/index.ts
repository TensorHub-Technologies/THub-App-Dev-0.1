import express from 'express'
import documentStoreController from '../../controllers/documentstore'
import { getMulterStorage } from '../../utils'
import authorizeResource from '../../middlewares/authorizeResource'
import { DocumentStore } from '../../database/entities/DocumentStore'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

const router = express.Router()

const getDocumentStoreByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(DocumentStore).findOneBy({ id })
}

const getDocumentStoreFromBody = async (req: express.Request) => {
    return await getDocumentStoreByIdFromDB(req.body?.storeId)
}

router.post(
    '/upsert/:id',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.id), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    getMulterStorage().array('files'),
    documentStoreController.upsertDocStoreMiddleware
)

router.post(
    '/refresh/:id',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.id), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    documentStoreController.refreshDocStoreMiddleware
)

/** Document Store Routes */
// Create document store
router.post('/store', documentStoreController.createDocumentStore)
// List all stores
router.get('/store', documentStoreController.getAllDocumentStores)
// Get specific store
router.get(
    '/store/:id',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.id), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to access this document store'
    }),
    documentStoreController.getDocumentStoreById
)
// Update documentStore
router.put(
    '/store/:id',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.id), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to update this document store'
    }),
    documentStoreController.updateDocumentStore
)
// Delete documentStore
router.delete(
    '/store/:id',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.id), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to delete this document store'
    }),
    documentStoreController.deleteDocumentStore
)
// Get document store configs
router.get(
    '/store-configs/:id/:loaderId',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.id), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to access this document store'
    }),
    documentStoreController.getDocStoreConfigs
)

/** Component Nodes = Document Store - Loaders */
// Get all loaders
router.get('/components/loaders', documentStoreController.getDocumentLoaders)

// delete loader from document store
router.delete(
    '/loader/:id/:loaderId',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.id), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    documentStoreController.deleteLoaderFromDocumentStore
)
// chunking preview
router.post('/loader/preview', documentStoreController.previewFileChunks)
// saving process
router.post(
    '/loader/save',
    authorizeResource((req) => getDocumentStoreFromBody(req), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    documentStoreController.saveProcessingLoader
)
// chunking process
router.post(
    '/loader/process/:loaderId',
    authorizeResource((req) => getDocumentStoreFromBody(req), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    documentStoreController.processLoader
)

/** Document Store - Loaders - Chunks */
// delete specific file chunk from the store
router.delete(
    '/chunks/:storeId/:loaderId/:chunkId',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.storeId), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    documentStoreController.deleteDocumentStoreFileChunk
)
// edit specific file chunk from the store
router.put(
    '/chunks/:storeId/:loaderId/:chunkId',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.storeId), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    documentStoreController.editDocumentStoreFileChunk
)
// Get all file chunks from the store
router.get(
    '/chunks/:storeId/:fileId/:pageNo',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.storeId), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to access this document store'
    }),
    documentStoreController.getDocumentStoreFileChunks
)

// add chunks to the selected vector store
router.post(
    '/vectorstore/insert',
    authorizeResource((req) => getDocumentStoreFromBody(req), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    documentStoreController.insertIntoVectorStore
)
// save the selected vector store
router.post(
    '/vectorstore/save',
    authorizeResource((req) => getDocumentStoreFromBody(req), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    documentStoreController.saveVectorStoreConfig
)
// delete data from the selected vector store
router.delete(
    '/vectorstore/:storeId',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.storeId), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    documentStoreController.deleteVectorStoreFromStore
)
// query the vector store
router.post(
    '/vectorstore/query',
    authorizeResource((req) => getDocumentStoreFromBody(req), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to access this document store'
    }),
    documentStoreController.queryVectorStore
)
// Get all embedding providers
router.get('/components/embeddings', documentStoreController.getEmbeddingProviders)
// Get all vector store providers
router.get('/components/vectorstore', documentStoreController.getVectorStoreProviders)
// Get all Record Manager providers
router.get('/components/recordmanager', documentStoreController.getRecordManagerProviders)

// update the selected vector store from the playground
router.post(
    '/vectorstore/update',
    authorizeResource((req) => getDocumentStoreFromBody(req), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to modify this document store'
    }),
    documentStoreController.updateVectorStoreConfigOnly
)

// generate docstore tool description
router.post(
    '/generate-tool-desc/:id',
    authorizeResource((req) => getDocumentStoreByIdFromDB(req.params.id), {
        notFoundMessage: 'Document store not found',
        forbiddenMessage: 'You are not allowed to access this document store'
    }),
    documentStoreController.generateDocStoreToolDesc
)

export default router
