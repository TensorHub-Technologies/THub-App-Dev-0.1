"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const internalTHubError_1 = require("../../errors/internalTHubError");
const http_status_codes_1 = require("http-status-codes");
const evaluations_1 = __importDefault(require("../../services/evaluations"));
const pagination_1 = require("../../utils/pagination");
const createEvaluation = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: evaluationsService.createEvaluation - body not provided!`);
        }
        const body = req.body;
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        body.tenantId = tenantId;
        const httpProtocol = req.get('x-forwarded-proto') || req.get('X-Forwarded-Proto') || req.protocol;
        const baseURL = `${httpProtocol}://${req.get('host')}`;
        const apiResponse = await evaluations_1.default.createEvaluation(body, baseURL);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const runAgain = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: evaluationsService.runAgain - id not provided!`);
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const httpProtocol = req.get('x-forwarded-proto') || req.get('X-Forwarded-Proto') || req.protocol;
        const baseURL = `${httpProtocol}://${req.get('host')}`;
        const apiResponse = await evaluations_1.default.runAgain(req.params.id, baseURL, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getEvaluation = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: evaluationsService.getEvaluation - id not provided!`);
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await evaluations_1.default.getEvaluation(req.params.id, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const deleteEvaluation = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: evaluationsService.deleteEvaluation - id not provided!`);
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await evaluations_1.default.deleteEvaluation(req.params.id, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getAllEvaluations = async (req, res, next) => {
    try {
        const { page, limit } = (0, pagination_1.getPageAndLimitParams)(req);
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await evaluations_1.default.getAllEvaluations(page, limit, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const isOutdated = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: evaluationsService.isOutdated - id not provided!`);
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await evaluations_1.default.isOutdated(req.params.id, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getVersions = async (req, res, next) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: evaluationsService.getVersions - id not provided!`);
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await evaluations_1.default.getVersions(req.params.id, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const patchDeleteEvaluations = async (req, res, next) => {
    try {
        const ids = req.body.ids ?? [];
        const isDeleteAllVersion = req.body.isDeleteAllVersion ?? false;
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        const apiResponse = await evaluations_1.default.patchDeleteEvaluations(ids, isDeleteAllVersion, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createEvaluation,
    getEvaluation,
    deleteEvaluation,
    getAllEvaluations,
    isOutdated,
    runAgain,
    getVersions,
    patchDeleteEvaluations
};
//# sourceMappingURL=index.js.map