"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("../../services/tools"));
const internalTHubError_1 = require("../../errors/internalTHubError");
const http_status_codes_1 = require("http-status-codes");
const createTool = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: toolsController.createTool - body not provided!`);
        }
        const apiResponse = await tools_1.default.createTool(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const deleteTool = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: toolsController.deleteTool - id not provided!`);
        }
        const apiResponse = await tools_1.default.deleteTool(req.params.id);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getAllTools = async (req, res, next) => {
    try {
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        if (req.params.id && req.params.id !== tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Forbidden');
        }
        const apiResponse = await tools_1.default.getAllTools(tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getToolById = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: toolsController.getToolById - id not provided!`);
        }
        const apiResponse = await tools_1.default.getToolById(req.params.id);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const updateTool = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: toolsController.updateTool - id not provided!`);
        }
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: toolsController.deleteTool - body not provided!`);
        }
        const apiResponse = await tools_1.default.updateTool(req.params.id, req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createTool,
    deleteTool,
    getAllTools,
    getToolById,
    updateTool
};
//# sourceMappingURL=index.js.map