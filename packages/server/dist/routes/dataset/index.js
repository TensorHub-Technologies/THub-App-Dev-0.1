"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dataset_1 = __importDefault(require("../../controllers/dataset"));
const authorizeResource_1 = __importDefault(require("../../middlewares/authorizeResource"));
const Dataset_1 = require("../../database/entities/Dataset");
const DatasetRow_1 = require("../../database/entities/DatasetRow");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const router = express_1.default.Router();
const getDatasetByIdFromDB = async (id) => {
    if (!id)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    return await appServer.AppDataSource.getRepository(Dataset_1.Dataset).findOneBy({ id });
};
const getDatasetRowOwnership = async (rowId) => {
    if (!rowId)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    const row = await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).findOneBy({ id: rowId });
    if (!row)
        return null;
    const dataset = await appServer.AppDataSource.getRepository(Dataset_1.Dataset).findOneBy({ id: row.datasetId });
    if (!dataset)
        return null;
    return {
        row,
        ownerId: dataset.tenantId
    };
};
const getDatasetOwnershipFromBody = async (req) => {
    return await getDatasetByIdFromDB(req.body?.datasetId);
};
// get all datasets
router.get('/', dataset_1.default.getAllDatasets);
// get new dataset
router.get('/set/:id', (0, authorizeResource_1.default)((req) => getDatasetByIdFromDB(req.params.id), {
    notFoundMessage: 'Dataset not found',
    forbiddenMessage: 'You are not allowed to access this dataset'
}), dataset_1.default.getDataset);
// Create new dataset
router.post('/set', dataset_1.default.createDataset);
// Update dataset
router.put('/set/:id', (0, authorizeResource_1.default)((req) => getDatasetByIdFromDB(req.params.id), {
    notFoundMessage: 'Dataset not found',
    forbiddenMessage: 'You are not allowed to update this dataset'
}), dataset_1.default.updateDataset);
// Delete dataset via id
router.delete('/set/:id', (0, authorizeResource_1.default)((req) => getDatasetByIdFromDB(req.params.id), {
    notFoundMessage: 'Dataset not found',
    forbiddenMessage: 'You are not allowed to delete this dataset'
}), dataset_1.default.deleteDataset);
// Create new row in a given dataset
router.post('/rows', (0, authorizeResource_1.default)((req) => getDatasetOwnershipFromBody(req), {
    notFoundMessage: 'Dataset not found',
    forbiddenMessage: 'You are not allowed to modify this dataset'
}), dataset_1.default.addDatasetRow);
// Update row for a dataset
router.put('/rows/:id', (0, authorizeResource_1.default)((req) => getDatasetRowOwnership(req.params.id), {
    getOwnerId: (resource) => resource.ownerId,
    notFoundMessage: 'Dataset row not found',
    forbiddenMessage: 'You are not allowed to update this dataset row'
}), dataset_1.default.updateDatasetRow);
// Delete dataset row via id
router.delete('/rows/:id', (0, authorizeResource_1.default)((req) => getDatasetRowOwnership(req.params.id), {
    getOwnerId: (resource) => resource.ownerId,
    notFoundMessage: 'Dataset row not found',
    forbiddenMessage: 'You are not allowed to delete this dataset row'
}), dataset_1.default.deleteDatasetRow);
// PATCH delete by ids
router.patch('/rows', dataset_1.default.patchDeleteRows);
// Update row for a dataset
router.post('/reorder', (0, authorizeResource_1.default)((req) => getDatasetOwnershipFromBody(req), {
    notFoundMessage: 'Dataset not found',
    forbiddenMessage: 'You are not allowed to reorder this dataset'
}), dataset_1.default.reorderDatasetRow);
exports.default = router;
//# sourceMappingURL=index.js.map