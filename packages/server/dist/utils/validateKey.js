"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAPIKey = exports.validateChatflowAPIKey = void 0;
const apiKey_1 = require("./apiKey");
const apikey_1 = __importDefault(require("../services/apikey"));
/**
 * Validate Workflow API Key
 * @param {Request} req
 * @param {ChatFlow} chatflow
 */
const validateChatflowAPIKey = async (req, chatflow) => {
    const chatFlowApiKeyId = chatflow?.apikeyid;
    if (!chatFlowApiKeyId)
        return true;
    const authorizationHeader = req.headers['Authorization'] ?? req.headers['authorization'] ?? '';
    if (chatFlowApiKeyId && !authorizationHeader)
        return false;
    const suppliedKey = authorizationHeader.split(`Bearer `).pop();
    if (suppliedKey) {
        const keys = await apikey_1.default.getAllApiKeys();
        const apiSecret = keys.find((key) => key.id === chatFlowApiKeyId)?.apiSecret;
        if (!(0, apiKey_1.compareKeys)(apiSecret, suppliedKey))
            return false;
        return true;
    }
    return false;
};
exports.validateChatflowAPIKey = validateChatflowAPIKey;
/**
 * Validate API Key
 * @param {Request} req
 */
const validateAPIKey = async (req) => {
    const authorizationHeader = req.headers['Authorization'] ?? req.headers['authorization'] ?? '';
    if (!authorizationHeader)
        return false;
    const suppliedKey = authorizationHeader.split(`Bearer `).pop();
    if (suppliedKey) {
        const keys = await apikey_1.default.getAllApiKeys();
        const apiSecret = keys.find((key) => key.apiKey === suppliedKey)?.apiSecret;
        if (!apiSecret)
            return false;
        if (!(0, apiKey_1.compareKeys)(apiSecret, suppliedKey))
            return false;
        return true;
    }
    return false;
};
exports.validateAPIKey = validateAPIKey;
//# sourceMappingURL=validateKey.js.map