"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const stream_1 = require("stream");
const typeorm_1 = require("typeorm");
const Dataset_1 = require("../../database/entities/Dataset");
const DatasetRow_1 = require("../../database/entities/DatasetRow");
const internalTHubError_1 = require("../../errors/internalTHubError");
const utils_1 = require("../../errors/utils");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const csv_parser_1 = __importDefault(require("csv-parser"));
// ─── getAllDatasets ────────────────────────────────────────────────────────────
const getAllDatasets = async (page = -1, limit = -1, tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const queryBuilder = appServer.AppDataSource.getRepository(Dataset_1.Dataset).createQueryBuilder('ds').orderBy('ds.updatedDate', 'DESC');
        // ✅ Filter by tenantId
        if (tenantId) {
            queryBuilder.andWhere('ds.tenantId = :tenantId', { tenantId });
        }
        if (page > 0 && limit > 0) {
            queryBuilder.skip((page - 1) * limit);
            queryBuilder.take(limit);
        }
        const [data, total] = await queryBuilder.getManyAndCount();
        const returnObj = [];
        for (const dataset of data) {
            ;
            dataset.rowCount = await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).count({
                where: { datasetId: dataset.id }
            });
            returnObj.push(dataset);
        }
        if (page > 0 && limit > 0) {
            return { total, data: returnObj };
        }
        else {
            return returnObj;
        }
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.getAllDatasets - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
// ─── getDataset ───────────────────────────────────────────────────────────────
const getDataset = async (id, page = -1, limit = -1, tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        // ✅ Verify dataset belongs to the tenant
        const datasetQueryBuilder = appServer.AppDataSource.getRepository(Dataset_1.Dataset).createQueryBuilder('ds').where('ds.id = :id', { id });
        if (tenantId) {
            datasetQueryBuilder.andWhere('ds.tenantId = :tenantId', { tenantId });
        }
        const dataset = await datasetQueryBuilder.getOne();
        if (!dataset)
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Dataset ${id} not found`);
        const queryBuilder = appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow)
            .createQueryBuilder('dsr')
            .orderBy('dsr.sequenceNo', 'ASC')
            .andWhere('dsr.datasetId = :datasetId', { datasetId: id });
        if (page > 0 && limit > 0) {
            queryBuilder.skip((page - 1) * limit);
            queryBuilder.take(limit);
        }
        let [data, total] = await queryBuilder.getManyAndCount();
        // Handle missing sequence numbers (unchanged)
        const missingSequenceNumbers = data.filter((item) => item.sequenceNo === -1);
        if (missingSequenceNumbers.length > 0) {
            const maxSequenceNumber = data.reduce((prev, current) => (prev.sequenceNo > current.sequenceNo ? prev : current));
            let sequenceNo = maxSequenceNumber.sequenceNo + 1;
            for (const zeroSequenceNumber of missingSequenceNumbers) {
                zeroSequenceNumber.sequenceNo = sequenceNo++;
            }
            await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).save(missingSequenceNumbers);
            const queryBuilder2 = appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow)
                .createQueryBuilder('dsr')
                .orderBy('dsr.sequenceNo', 'ASC')
                .andWhere('dsr.datasetId = :datasetId', { datasetId: id });
            if (page > 0 && limit > 0) {
                queryBuilder2.skip((page - 1) * limit);
                queryBuilder2.take(limit);
            }
            ;
            [data, total] = await queryBuilder2.getManyAndCount();
        }
        return { ...dataset, rows: data, total };
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.getDataset - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
// ─── deleteDataset ────────────────────────────────────────────────────────────
const deleteDataset = async (id, tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        // ✅ Verify ownership before deleting
        if (tenantId) {
            const dataset = await appServer.AppDataSource.getRepository(Dataset_1.Dataset)
                .createQueryBuilder('ds')
                .where('ds.id = :id', { id })
                .andWhere('ds.tenantId = :tenantId', { tenantId })
                .getOne();
            if (!dataset)
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Dataset ${id} not found`);
        }
        const result = await appServer.AppDataSource.getRepository(Dataset_1.Dataset).delete({ id });
        await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).delete({ datasetId: id });
        return result;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.deleteDataset - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
// ─── patchDeleteRows ──────────────────────────────────────────────────────────
const patchDeleteRows = async (ids = [], tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const datasetItemsToBeDeleted = await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).find({
            where: { id: (0, typeorm_1.In)(ids) }
        });
        // ✅ If tenantId provided, verify all rows belong to datasets of this tenant
        if (tenantId) {
            const datasetIds = [...new Set(datasetItemsToBeDeleted.map((item) => item.datasetId))];
            const validDatasets = await appServer.AppDataSource.getRepository(Dataset_1.Dataset)
                .createQueryBuilder('ds')
                .where('ds.id IN (:...datasetIds)', { datasetIds })
                .andWhere('ds.tenantId = :tenantId', { tenantId })
                .getMany();
            const validDatasetIds = new Set(validDatasets.map((d) => d.id));
            const allValid = datasetItemsToBeDeleted.every((item) => validDatasetIds.has(item.datasetId));
            if (!allValid)
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.FORBIDDEN, `Unauthorized: some rows do not belong to this tenant`);
        }
        const dbResponse = await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).delete(ids);
        const datasetIds = [...new Set(datasetItemsToBeDeleted.map((item) => item.datasetId))];
        for (const datasetId of datasetIds) {
            await changeUpdateOnDataset(datasetId);
        }
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.patchDeleteRows - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const reorderDatasetRow = async (datasetId, rows) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        await appServer.AppDataSource.transaction(async (entityManager) => {
            for (const row of rows) {
                const item = await entityManager.getRepository(DatasetRow_1.DatasetRow).findOneBy({ id: row.id });
                if (!item)
                    throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Dataset Row ${row.id} not found`);
                item.sequenceNo = row.sequenceNo;
                await entityManager.getRepository(DatasetRow_1.DatasetRow).save(item);
            }
            await changeUpdateOnDataset(datasetId, entityManager);
        });
        return { message: 'Dataset row reordered successfully' };
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.reorderDatasetRow - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const _readCSV = async (stream, results) => {
    return new Promise((resolve, reject) => {
        stream
            .pipe((0, csv_parser_1.default)({ headers: false }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
};
const _csvToDatasetRows = async (datasetId, csvString, firstRowHeaders) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const maxValueEntity = await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).find({
            order: { sequenceNo: 'DESC' },
            take: 1
        });
        let sequenceNo = maxValueEntity?.length > 0 ? maxValueEntity[0].sequenceNo + 1 : 0;
        const results = [];
        const files = csvString.startsWith('[') && csvString.endsWith(']') ? JSON.parse(csvString) : [csvString];
        for (const file of files) {
            const splitDataURI = file.split(',');
            splitDataURI.pop();
            const bf = Buffer.from(splitDataURI.pop() || '', 'base64');
            const stream = stream_1.Readable.from(bf.toString('utf8'));
            const rows = [];
            await _readCSV(stream, rows);
            results.push(...rows);
        }
        for (let r = 0; r < results.length; r++) {
            if (firstRowHeaders && r === 0)
                continue;
            const row = results[r];
            const newRow = appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).create(new DatasetRow_1.DatasetRow());
            newRow.datasetId = datasetId;
            newRow.input = row['0'];
            newRow.output = row['1'];
            newRow.sequenceNo = sequenceNo++;
            await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).save(newRow);
        }
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService._csvToDatasetRows - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const createDataset = async (body) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const newDs = new Dataset_1.Dataset();
        Object.assign(newDs, body);
        const dataset = appServer.AppDataSource.getRepository(Dataset_1.Dataset).create(newDs);
        const result = await appServer.AppDataSource.getRepository(Dataset_1.Dataset).save(dataset);
        if (body.csvFile) {
            await _csvToDatasetRows(result.id, body.csvFile, body.firstRowHeaders);
        }
        return result;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.createDataset - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const updateDataset = async (id, body) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const dataset = await appServer.AppDataSource.getRepository(Dataset_1.Dataset).findOneBy({ id });
        if (!dataset)
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Dataset ${id} not found`);
        const updateDs = new Dataset_1.Dataset();
        Object.assign(updateDs, body);
        appServer.AppDataSource.getRepository(Dataset_1.Dataset).merge(dataset, updateDs);
        return await appServer.AppDataSource.getRepository(Dataset_1.Dataset).save(dataset);
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.updateDataset - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const addDatasetRow = async (body) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        if (body.csvFile) {
            await _csvToDatasetRows(body.datasetId, body.csvFile, body.firstRowHeaders);
            await changeUpdateOnDataset(body.datasetId);
            return { message: 'Dataset rows added successfully' };
        }
        const maxValueEntity = await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).find({
            where: { datasetId: body.datasetId },
            order: { sequenceNo: 'DESC' },
            take: 1
        });
        let sequenceNo = maxValueEntity?.length > 0 ? maxValueEntity[0].sequenceNo : 0;
        const newDs = new DatasetRow_1.DatasetRow();
        Object.assign(newDs, body);
        newDs.sequenceNo = sequenceNo === 0 ? sequenceNo : sequenceNo + 1;
        const row = appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).create(newDs);
        const result = await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).save(row);
        await changeUpdateOnDataset(body.datasetId);
        return result;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.createDatasetRow - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const changeUpdateOnDataset = async (id, entityManager) => {
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    const dataset = await appServer.AppDataSource.getRepository(Dataset_1.Dataset).findOneBy({ id });
    if (!dataset)
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Dataset ${id} not found`);
    dataset.updatedDate = new Date();
    if (entityManager) {
        await entityManager.getRepository(Dataset_1.Dataset).save(dataset);
    }
    else {
        await appServer.AppDataSource.getRepository(Dataset_1.Dataset).save(dataset);
    }
};
const updateDatasetRow = async (id, body) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const item = await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).findOneBy({ id });
        if (!item)
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Dataset Row ${id} not found`);
        const updateItem = new DatasetRow_1.DatasetRow();
        Object.assign(updateItem, body);
        appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).merge(item, updateItem);
        const result = await appServer.AppDataSource.getRepository(DatasetRow_1.DatasetRow).save(item);
        await changeUpdateOnDataset(body.datasetId);
        return result;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.updateDatasetRow - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const deleteDatasetRow = async (id) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        return await appServer.AppDataSource.transaction(async (entityManager) => {
            const item = await entityManager.getRepository(DatasetRow_1.DatasetRow).findOneBy({ id });
            if (!item)
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Dataset Row ${id} not found`);
            const result = await entityManager.getRepository(DatasetRow_1.DatasetRow).delete({ id });
            await changeUpdateOnDataset(item.datasetId, entityManager);
            return result;
        });
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: datasetService.deleteDatasetRow - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
exports.default = {
    getAllDatasets,
    getDataset,
    createDataset,
    updateDataset,
    deleteDataset,
    addDatasetRow,
    updateDatasetRow,
    deleteDatasetRow,
    patchDeleteRows,
    reorderDatasetRow
};
//# sourceMappingURL=index.js.map