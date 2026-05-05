"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const content_disposition_1 = __importDefault(require("content-disposition"));
const thub_components_1 = require("thub-components");
const http_status_codes_1 = require("http-status-codes");
const internalTHubError_1 = require("../../errors/internalTHubError");
const streamUploadedFile = async (req, res, next) => {
    try {
        if (!req.query.chatflowId || !req.query.chatId || !req.query.fileName) {
            return res.status(500).send(`Invalid file path`);
        }
        const chatflowId = req.query.chatflowId;
        const chatId = req.query.chatId;
        const fileName = req.query.fileName;
        res.setHeader('Content-Disposition', (0, content_disposition_1.default)(fileName));
        const fileStream = await (0, thub_components_1.streamStorageFile)(chatflowId, chatId, fileName);
        if (!fileStream)
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: streamStorageFile`);
        if (fileStream instanceof fs_1.default.ReadStream && fileStream?.pipe) {
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
exports.default = {
    streamUploadedFile
};
//# sourceMappingURL=index.js.map