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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFileAttachment = void 0;
const path = __importStar(require("path"));
const thub_components_1 = require("thub-components");
const getRunningExpressApp_1 = require("./getRunningExpressApp");
const utils_1 = require("../errors/utils");
const internalTHubError_1 = require("../errors/internalTHubError");
const http_status_codes_1 = require("http-status-codes");
const ChatFlow_1 = require("../database/entities/ChatFlow");
/**
 * Create attachment
 * @param {Request} req
 */
const createFileAttachment = async (req) => {
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    const chatflowid = req.params.chatflowId;
    if (!chatflowid || !(0, thub_components_1.isValidUUID)(chatflowid)) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid chatflowId format - must be a valid UUID');
    }
    const chatId = req.params.chatId;
    if (!chatId || !(0, thub_components_1.isValidUUID)(chatId)) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid chatId format - must be a valid UUID');
    }
    // Check for path traversal attempts
    if ((0, thub_components_1.isPathTraversal)(chatflowid) || (0, thub_components_1.isPathTraversal)(chatId)) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid path characters detected');
    }
    // Validate chatflow exists and check API key
    const chatflow = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
        id: chatflowid
    });
    if (!chatflow) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Workflow ${chatflowid} not found`);
    }
    // Parse chatbot configuration to get file upload settings
    let pdfConfig = {
        usage: 'perPage',
        legacyBuild: false
    };
    if (chatflow.chatbotConfig) {
        try {
            const chatbotConfig = JSON.parse(chatflow.chatbotConfig);
            if (chatbotConfig?.fullFileUpload?.pdfFile) {
                if (chatbotConfig.fullFileUpload.pdfFile.usage) {
                    pdfConfig.usage = chatbotConfig.fullFileUpload.pdfFile.usage;
                }
                if (chatbotConfig.fullFileUpload.pdfFile.legacyBuild !== undefined) {
                    pdfConfig.legacyBuild = chatbotConfig.fullFileUpload.pdfFile.legacyBuild;
                }
            }
        }
        catch (e) {
            // Use default PDF config if parsing fails
        }
    }
    // Find FileLoader node
    const fileLoaderComponent = appServer.nodesPool.componentNodes['fileLoader'];
    const fileLoaderNodeInstanceFilePath = fileLoaderComponent.filePath;
    const fileLoaderNodeModule = await Promise.resolve(`${fileLoaderNodeInstanceFilePath}`).then(s => __importStar(require(s)));
    const fileLoaderNodeInstance = new fileLoaderNodeModule.nodeClass();
    const options = {
        retrieveAttachmentChatId: true,
        chatflowid,
        chatId
    };
    const files = req.files || [];
    const fileAttachments = [];
    if (files.length) {
        const isBase64 = req.body.base64;
        for (const file of files) {
            const fileBuffer = await (0, thub_components_1.getFileFromUpload)(file.path ?? file.key);
            const fileNames = [];
            // Address file name with special characters: https://github.com/expressjs/multer/issues/1104
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
            const storagePath = await (0, thub_components_1.addArrayFilesToStorage)(file.mimetype, fileBuffer, file.originalname, fileNames, chatflowid, chatId);
            const fileInputFieldFromMimeType = (0, thub_components_1.mapMimeTypeToInputField)(file.mimetype);
            const fileExtension = path.extname(file.originalname);
            const fileInputFieldFromExt = (0, thub_components_1.mapExtToInputField)(fileExtension);
            let fileInputField = 'txtFile';
            if (fileInputFieldFromExt !== 'txtFile') {
                fileInputField = fileInputFieldFromExt;
            }
            else if (fileInputFieldFromMimeType !== 'txtFile') {
                fileInputField = fileInputFieldFromExt;
            }
            await (0, thub_components_1.removeSpecificFileFromUpload)(file.path ?? file.key);
            try {
                const nodeData = {
                    inputs: {
                        [fileInputField]: storagePath
                    },
                    outputs: { output: 'document' }
                };
                // Apply PDF specific configuration if this is a PDF file
                if (fileInputField === 'pdfFile') {
                    nodeData.inputs.usage = pdfConfig.usage;
                    nodeData.inputs.legacyBuild = pdfConfig.legacyBuild;
                }
                let content = '';
                if (isBase64) {
                    content = fileBuffer.toString('base64');
                }
                else {
                    const documents = await fileLoaderNodeInstance.init(nodeData, '', options);
                    content = documents.map((doc) => doc.pageContent).join('\n');
                }
                fileAttachments.push({
                    name: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    content
                });
            }
            catch (error) {
                throw new Error(`Failed createFileAttachment: ${file.originalname} (${file.mimetype} - ${(0, utils_1.getErrorMessage)(error)}`);
            }
        }
    }
    return fileAttachments;
};
exports.createFileAttachment = createFileAttachment;
//# sourceMappingURL=createAttachment.js.map