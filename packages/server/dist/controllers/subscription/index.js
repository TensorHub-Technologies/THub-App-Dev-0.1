"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const internalTHubError_1 = require("../../errors/internalTHubError");
const subscription_1 = __importDefault(require("../../services/subscription"));
const createSubscription = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, 'Error: subscriptionController.createSubscription - body not provided!');
        }
        if (!req.body.customerEmail) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, 'Error: subscriptionController.createSubscription - customerEmail is required!');
        }
        const apiResponse = await subscription_1.default.createSubscription(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const validateSubscription = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, 'Error: subscriptionController.validateSubscription - body not provided!');
        }
        const requiredFields = ['razorpay_subscription_id', 'razorpay_payment_id', 'razorpay_signature', 'planId', 'user_id'];
        const missingField = requiredFields.find((field) => !String(req.body[field] || '').trim());
        if (missingField) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: subscriptionController.validateSubscription - ${missingField} is required!`);
        }
        const apiResponse = await subscription_1.default.validateSubscription(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const activateFreeSubscription = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, 'Error: subscriptionController.activateFreeSubscription - body not provided!');
        }
        if (!req.body.customerEmail || !req.body.user_id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, 'Error: subscriptionController.activateFreeSubscription - customerEmail and user_id are required!');
        }
        const apiResponse = await subscription_1.default.activateFreeSubscription(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const submitEnterpriseMail = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, 'Error: subscriptionController.submitEnterpriseMail - body not provided!');
        }
        const requiredFields = ['firstName', 'lastName', 'companyName', 'designation', 'email', 'contactNumber', 'description'];
        const missingField = requiredFields.find((field) => !String(req.body[field] || '').trim());
        if (missingField) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: subscriptionController.submitEnterpriseMail - ${missingField} is required!`);
        }
        const apiResponse = await subscription_1.default.submitEnterpriseMail(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const enterpriseMailStatus = async (_req, res) => {
    return res.json({
        message: 'Enterprise mail endpoint is available. Use POST to submit inquiries.'
    });
};
exports.default = {
    createSubscription,
    validateSubscription,
    activateFreeSubscription,
    submitEnterpriseMail,
    enterpriseMailStatus
};
//# sourceMappingURL=index.js.map