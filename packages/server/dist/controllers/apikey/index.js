"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const internalTHubError_1 = require("../../errors/internalTHubError");
const apikey_1 = __importDefault(require("../../services/apikey"));
// Get api keys
const getAllApiKeys = async (req, res, next) => {
    try {
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await apikey_1.default.getAllApiKeys(tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const createApiKey = async (req, res, next) => {
    try {
        if (typeof req.body === 'undefined' || !req.body.keyName) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: apikeyController.createApiKey - keyName not provided!`);
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await apikey_1.default.createApiKey(req.body.keyName, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// Update api key
const updateApiKey = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: apikeyController.updateApiKey - id not provided!`);
        }
        if (typeof req.body === 'undefined' || !req.body.keyName) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: apikeyController.updateApiKey - keyName not provided!`);
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await apikey_1.default.updateApiKey(req.params.id, req.body.keyName, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// Import Keys from JSON file
const importKeys = async (req, res, next) => {
    try {
        if (typeof req.body === 'undefined' || !req.body.jsonFile) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: apikeyController.importKeys - body not provided!`);
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await apikey_1.default.importKeys({
            ...req.body,
            tenantId
        });
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// Delete api key
const deleteApiKey = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: apikeyController.deleteApiKey - id not provided!`);
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await apikey_1.default.deleteApiKey(req.params.id, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// Verify api key
const verifyApiKey = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.apikey) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: apikeyController.verifyApiKey - apikey not provided!`);
        }
        const apiResponse = await apikey_1.default.verifyApiKey(req.params.apikey);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createApiKey,
    deleteApiKey,
    getAllApiKeys,
    updateApiKey,
    verifyApiKey,
    importKeys
};
//# sourceMappingURL=index.js.map