"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const openai_assistants_1 = __importDefault(require("../../services/openai-assistants"));
const content_disposition_1 = __importDefault(require("content-disposition"));
const internalTHubError_1 = require("../../errors/internalTHubError");
const http_status_codes_1 = require("http-status-codes");
const thub_components_1 = require("thub-components");
// List available assistants
const getAllOpenaiAssistants = async (req, res, next) => {
    try {
        if (typeof req.query === 'undefined' || !req.query.credential) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: openaiAssistantsController.getAllOpenaiAssistants - credential not provided!`);
        }
        const apiResponse = await openai_assistants_1.default.getAllOpenaiAssistants(req.query.credential);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// Get assistant object
const getSingleOpenaiAssistant = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: openaiAssistantsController.getSingleOpenaiAssistant - id not provided!`);
        }
        if (typeof req.query === 'undefined' || !req.query.credential) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: openaiAssistantsController.getSingleOpenaiAssistant - credential not provided!`);
        }
        const apiResponse = await openai_assistants_1.default.getSingleOpenaiAssistant(req.query.credential, req.params.id);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// Download file from assistant
const getFileFromAssistant = async (req, res, next) => {
    try {
        if (!req.body.chatflowId || !req.body.chatId || !req.body.fileName) {
            return res.status(500).send(`Invalid file path`);
        }
        const chatflowId = req.body.chatflowId;
        const chatId = req.body.chatId;
        const fileName = req.body.fileName;
        res.setHeader('Content-Disposition', (0, content_disposition_1.default)(fileName));
        const fileStream = await (0, thub_components_1.streamStorageFile)(chatflowId, chatId, fileName);
        if (!fileStream)
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: getFileFromAssistant`);
        if (fileStream instanceof fs.ReadStream && fileStream?.pipe) {
            fileStream.pipe(res);
        }
        else {
            res.send(fileStream);
        }
    }
    catch (error) {
        next(error);
    }
};
const uploadAssistantFiles = async (req, res, next) => {
    try {
        if (typeof req.query === 'undefined' || !req.query.credential) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: openaiAssistantsVectorStoreController.uploadFilesToAssistantVectorStore - credential not provided!`);
        }
        const files = req.files ?? [];
        const uploadFiles = [];
        if (Array.isArray(files)) {
            for (const file of files) {
                // Address file name with special characters: https://github.com/expressjs/multer/issues/1104
                file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
                uploadFiles.push({
                    filePath: file.path ?? file.key,
                    fileName: file.originalname
                });
            }
        }
        const apiResponse = await openai_assistants_1.default.uploadFilesToAssistant(req.query.credential, uploadFiles);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getAllOpenaiAssistants,
    getSingleOpenaiAssistant,
    getFileFromAssistant,
    uploadAssistantFiles
};
//# sourceMappingURL=index.js.map