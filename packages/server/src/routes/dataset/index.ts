import express from 'express'
import datasetController from '../../controllers/dataset'
import authorizeResource from '../../middlewares/authorizeResource'
import { Dataset } from '../../database/entities/Dataset'
import { DatasetRow } from '../../database/entities/DatasetRow'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
const router = express.Router()

const getDatasetByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(Dataset).findOneBy({ id })
}

const getDatasetRowOwnership = async (rowId?: string) => {
    if (!rowId) return null
    const appServer = getRunningExpressApp()
    const row = await appServer.AppDataSource.getRepository(DatasetRow).findOneBy({ id: rowId })
    if (!row) return null

    const dataset = await appServer.AppDataSource.getRepository(Dataset).findOneBy({ id: row.datasetId })
    if (!dataset) return null

    return {
        row,
        ownerId: dataset.tenantId
    }
}

const getDatasetOwnershipFromBody = async (req: express.Request) => {
    return await getDatasetByIdFromDB(req.body?.datasetId)
}

// get all datasets
router.get('/', datasetController.getAllDatasets)
// get new dataset
router.get(
    '/set/:id',
    authorizeResource((req) => getDatasetByIdFromDB(req.params.id), {
        notFoundMessage: 'Dataset not found',
        forbiddenMessage: 'You are not allowed to access this dataset'
    }),
    datasetController.getDataset
)
// Create new dataset
router.post('/set', datasetController.createDataset)
// Update dataset
router.put(
    '/set/:id',
    authorizeResource((req) => getDatasetByIdFromDB(req.params.id), {
        notFoundMessage: 'Dataset not found',
        forbiddenMessage: 'You are not allowed to update this dataset'
    }),
    datasetController.updateDataset
)
// Delete dataset via id
router.delete(
    '/set/:id',
    authorizeResource((req) => getDatasetByIdFromDB(req.params.id), {
        notFoundMessage: 'Dataset not found',
        forbiddenMessage: 'You are not allowed to delete this dataset'
    }),
    datasetController.deleteDataset
)

// Create new row in a given dataset
router.post(
    '/rows',
    authorizeResource((req) => getDatasetOwnershipFromBody(req), {
        notFoundMessage: 'Dataset not found',
        forbiddenMessage: 'You are not allowed to modify this dataset'
    }),
    datasetController.addDatasetRow
)
// Update row for a dataset
router.put(
    '/rows/:id',
    authorizeResource((req) => getDatasetRowOwnership(req.params.id), {
        getOwnerId: (resource) => resource.ownerId,
        notFoundMessage: 'Dataset row not found',
        forbiddenMessage: 'You are not allowed to update this dataset row'
    }),
    datasetController.updateDatasetRow
)
// Delete dataset row via id
router.delete(
    '/rows/:id',
    authorizeResource((req) => getDatasetRowOwnership(req.params.id), {
        getOwnerId: (resource) => resource.ownerId,
        notFoundMessage: 'Dataset row not found',
        forbiddenMessage: 'You are not allowed to delete this dataset row'
    }),
    datasetController.deleteDatasetRow
)
// PATCH delete by ids
router.patch('/rows', datasetController.patchDeleteRows)

// Update row for a dataset
router.post(
    '/reorder',
    authorizeResource((req) => getDatasetOwnershipFromBody(req), {
        notFoundMessage: 'Dataset not found',
        forbiddenMessage: 'You are not allowed to reorder this dataset'
    }),
    datasetController.reorderDatasetRow
)

export default router
