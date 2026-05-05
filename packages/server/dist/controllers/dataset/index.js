"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const internalTHubError_1 = require("../../errors/internalTHubError");
const dataset_1 = __importDefault(require("../../services/dataset"));
const http_status_codes_1 = require("http-status-codes");
const pagination_1 = require("../../utils/pagination");
const getAllDatasets = async (req, res, next) => {
    try {
        const { page, limit } = (0, pagination_1.getPageAndLimitParams)(req);
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await dataset_1.default.getAllDatasets(page, limit, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getDataset = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.getDataset - id not provided!`);
        }
        const { page, limit } = (0, pagination_1.getPageAndLimitParams)(req);
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await dataset_1.default.getDataset(req.params.id, page, limit, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const createDataset = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.createDataset - body not provided!`);
        }
        req.body.tenantId = req.user?.id;
        const apiResponse = await dataset_1.default.createDataset(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const updateDataset = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.updateDataset - body not provided!`);
        }
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.updateDataset - id not provided!`);
        }
        const apiResponse = await dataset_1.default.updateDataset(req.params.id, req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const deleteDataset = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.deleteDataset - id not provided!`);
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await dataset_1.default.deleteDataset(req.params.id, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const addDatasetRow = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.addDatasetRow - body not provided!`);
        }
        if (!req.body.datasetId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.addDatasetRow - datasetId not provided!`);
        }
        req.body.tenantId = req.user?.id;
        const apiResponse = await dataset_1.default.addDatasetRow(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const updateDatasetRow = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.updateDatasetRow - body not provided!`);
        }
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.updateDatasetRow - id not provided!`);
        }
        const apiResponse = await dataset_1.default.updateDatasetRow(req.params.id, req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const deleteDatasetRow = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.deleteDatasetRow - id not provided!`);
        }
        const apiResponse = await dataset_1.default.deleteDatasetRow(req.params.id);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const patchDeleteRows = async (req, res, next) => {
    try {
        const ids = req.body.ids ?? [];
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await dataset_1.default.patchDeleteRows(ids, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const reorderDatasetRow = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: datasetService.reorderDatasetRow - body not provided!`);
        }
        const apiResponse = await dataset_1.default.reorderDatasetRow(req.body.datasetId, req.body.rows);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
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