"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const executions_1 = __importDefault(require("../../services/executions"));
const getExecutionById = async (req, res, next) => {
    try {
        const executionId = req.params.id;
        const tenantId = req.user?.id;
        if (!tenantId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const execution = await executions_1.default.getExecutionById(executionId, tenantId);
        return res.json(execution);
    }
    catch (error) {
        next(error);
    }
};
const getPublicExecutionById = async (req, res, next) => {
    try {
        const executionId = req.params.id;
        const execution = await executions_1.default.getPublicExecutionById(executionId);
        return res.json(execution);
    }
    catch (error) {
        next(error);
    }
};
const updateExecution = async (req, res, next) => {
    try {
        const executionId = req.params.id;
        const tenantId = req.user?.id;
        if (!tenantId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const execution = await executions_1.default.updateExecution(executionId, req.body, tenantId);
        return res.json(execution);
    }
    catch (error) {
        next(error);
    }
};
const getAllExecutions = async (req, res, next) => {
    try {
        // Extract all possible filters from query params
        const filters = {};
        // ID filter
        if (req.query.id)
            filters.id = req.query.id;
        // Flow and session filters
        if (req.query.agentflowId)
            filters.agentflowId = req.query.agentflowId;
        if (req.query.agentflowName)
            filters.agentflowName = req.query.agentflowName;
        if (req.query.sessionId)
            filters.sessionId = req.query.sessionId;
        if (req.user?.id)
            filters.tenantId = req.user.id;
        else
            return res.status(401).json({ message: 'Authentication required' });
        // State filter
        if (req.query.state) {
            const stateValue = req.query.state;
            if (['INPROGRESS', 'FINISHED', 'ERROR', 'TERMINATED', 'TIMEOUT', 'STOPPED'].includes(stateValue)) {
                filters.state = stateValue;
            }
        }
        // Date filters
        if (req.query.startDate) {
            filters.startDate = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            filters.endDate = new Date(req.query.endDate);
        }
        // Pagination
        if (req.query.page) {
            filters.page = parseInt(req.query.page, 10);
        }
        if (req.query.limit) {
            filters.limit = parseInt(req.query.limit, 10);
        }
        const apiResponse = await executions_1.default.getAllExecutions(filters);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
/**
 * Delete multiple executions by their IDs
 * If a single ID is provided in the URL params, it will delete that execution
 * If an array of IDs is provided in the request body, it will delete all those executions
 */
const deleteExecutions = async (req, res, next) => {
    try {
        let executionIds = [];
        // Check if we're deleting a single execution from URL param
        if (req.params.id) {
            executionIds = [req.params.id];
        }
        // Check if we're deleting multiple executions from request body
        else if (req.body.executionIds && Array.isArray(req.body.executionIds)) {
            executionIds = req.body.executionIds;
        }
        else {
            return res.status(400).json({ success: false, message: 'No execution IDs provided' });
        }
        const tenantId = req.user?.id;
        if (!tenantId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const result = await executions_1.default.deleteExecutions(executionIds, tenantId);
        return res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getAllExecutions,
    deleteExecutions,
    getExecutionById,
    getPublicExecutionById,
    updateExecution
};
//# sourceMappingURL=index.js.map