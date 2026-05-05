"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assistants_1 = __importDefault(require("../../services/assistants"));
const internalTHubError_1 = require("../../errors/internalTHubError");
const http_status_codes_1 = require("http-status-codes");
const createAssistant = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.createAssistant - body not provided!`);
        }
        const apiResponse = await assistants_1.default.createAssistant(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const deleteAssistant = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.deleteAssistant - id not provided!`);
        }
        const apiResponse = await assistants_1.default.deleteAssistant(req.params.id, req.query.isDeleteBoth);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getAllAssistants = async (req, res, next) => {
    try {
        const type = req.query.type;
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        if (req.params.id && req.params.id !== tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Forbidden');
        }
        const apiResponse = await assistants_1.default.getAllAssistants(type, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getAssistantById = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.getAssistantById - id not provided!`);
        }
        const apiResponse = await assistants_1.default.getAssistantById(req.params.id);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const updateAssistant = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.updateAssistant - id not provided!`);
        }
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.updateAssistant - body not provided!`);
        }
        const apiResponse = await assistants_1.default.updateAssistant(req.params.id, req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getChatModels = async (req, res, next) => {
    try {
        const apiResponse = await assistants_1.default.getChatModels();
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getDocumentStores = async (req, res, next) => {
    try {
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await assistants_1.default.getDocumentStores(tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getTools = async (req, res, next) => {
    try {
        const apiResponse = await assistants_1.default.getTools();
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const generateAssistantInstruction = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.generateAssistantInstruction - body not provided!`);
        }
        const apiResponse = await assistants_1.default.generateAssistantInstruction(req.body.task, req.body.selectedChatModel);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createAssistant,
    deleteAssistant,
    getAllAssistants,
    getAssistantById,
    updateAssistant,
    getChatModels,
    getDocumentStores,
    getTools,
    generateAssistantInstruction
};
//# sourceMappingURL=index.js.map