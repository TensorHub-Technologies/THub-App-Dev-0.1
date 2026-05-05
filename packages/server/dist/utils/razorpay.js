"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRazorpaySubscriptionSignature = exports.getRazorpayClient = void 0;
const crypto_1 = __importDefault(require("crypto"));
const http_status_codes_1 = require("http-status-codes");
const razorpay_1 = __importDefault(require("razorpay"));
const internalTHubError_1 = require("../errors/internalTHubError");
const getRequiredEnv = (envKey) => {
    const value = String(process.env[envKey] || '').trim();
    if (!value) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE, `${envKey} is not configured`);
    }
    return value;
};
const getRazorpayClient = () => {
    return new razorpay_1.default({
        key_id: getRequiredEnv('RAZORPAY_KEY_ID'),
        key_secret: getRequiredEnv('RAZORPAY_SECRET')
    });
};
exports.getRazorpayClient = getRazorpayClient;
const verifyRazorpaySubscriptionSignature = (subscriptionId, paymentId, signature) => {
    const secret = getRequiredEnv('RAZORPAY_SECRET');
    const payload = `${paymentId}|${subscriptionId}`;
    const digest = crypto_1.default.createHmac('sha256', secret).update(payload).digest('hex');
    const digestBuffer = Buffer.from(digest);
    const signatureBuffer = Buffer.from(signature);
    if (digestBuffer.length !== signatureBuffer.length)
        return false;
    return crypto_1.default.timingSafeEqual(digestBuffer, signatureBuffer);
};
exports.verifyRazorpaySubscriptionSignature = verifyRazorpaySubscriptionSignature;
//# sourceMappingURL=razorpay.js.map