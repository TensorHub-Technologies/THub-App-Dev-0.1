"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const typeorm_1 = require("typeorm");
const ChatMessage_1 = require("../../database/entities/ChatMessage");
const Execution_1 = require("../../database/entities/Execution");
const internalTHubError_1 = require("../../errors/internalTHubError");
const utils_1 = require("../../errors/utils");
const utils_2 = require("../../utils");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const getExecutionById = async (executionId, tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const executionRepository = appServer.AppDataSource.getRepository(Execution_1.Execution);
        const query = { id: executionId };
        if (tenantId)
            query.tenantId = tenantId;
        const res = await executionRepository.findOne({
            where: query,
            select: {
                id: true,
                executionData: true,
                state: true,
                agentflowId: true,
                sessionId: true,
                action: true,
                isPublic: true,
                tenantId: true,
                total_tokens: true,
                agentTokens: true,
                total_time: true,
                createdDate: true,
                updatedDate: true,
                stoppedDate: true
            }
        });
        if (!res) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Execution ${executionId} not found`);
        }
        return res;
    }
    catch (error) {
        if (error instanceof internalTHubError_1.InternalTHubError)
            throw error;
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: executionsService.getExecutionById - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const getPublicExecutionById = async (executionId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const executionRepository = appServer.AppDataSource.getRepository(Execution_1.Execution);
        const res = await executionRepository.findOne({
            where: { id: executionId, isPublic: true },
            select: {
                id: true,
                executionData: true,
                state: true,
                agentflowId: true,
                sessionId: true,
                action: true,
                isPublic: true,
                tenantId: true,
                total_tokens: true,
                agentTokens: true,
                total_time: true,
                createdDate: true,
                updatedDate: true,
                stoppedDate: true
            }
        });
        if (!res) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Execution ${executionId} not found`);
        }
        const executionData = typeof res?.executionData === 'string' ? JSON.parse(res?.executionData) : res?.executionData;
        const executionDataWithoutCredentialId = executionData.map((data) => (0, utils_2._removeCredentialId)(data));
        const stringifiedExecutionData = JSON.stringify(executionDataWithoutCredentialId);
        return { ...res, executionData: stringifiedExecutionData };
    }
    catch (error) {
        if (error instanceof internalTHubError_1.InternalTHubError)
            throw error;
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: executionsService.getPublicExecutionById - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const getAllExecutions = async (filters = {}) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const { id, agentflowId, agentflowName, sessionId, state, startDate, endDate, tenantId, page = 1, limit = 12 } = filters;
        // Handle UUID fields properly using raw parameters to avoid type conversion issues
        // This uses the query builder instead of direct objects for compatibility with UUID fields
        const queryBuilder = appServer.AppDataSource.getRepository(Execution_1.Execution)
            .createQueryBuilder('execution')
            .leftJoinAndSelect('execution.agentflow', 'agentflow')
            .orderBy('execution.updatedDate', 'DESC')
            .addOrderBy('execution.createdDate', 'DESC')
            .addOrderBy('execution.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        if (tenantId)
            queryBuilder.andWhere('execution.tenantId = :tenantId', { tenantId });
        if (id)
            queryBuilder.andWhere('execution.id = :id', { id });
        if (agentflowId)
            queryBuilder.andWhere('execution.agentflowId = :agentflowId', { agentflowId });
        if (agentflowName)
            queryBuilder.andWhere('LOWER(agentflow.name) LIKE LOWER(:agentflowName)', { agentflowName: `%${agentflowName}%` });
        if (sessionId)
            queryBuilder.andWhere('execution.sessionId = :sessionId', { sessionId });
        if (state)
            queryBuilder.andWhere('execution.state = :state', { state });
        // Date range conditions
        if (startDate && endDate) {
            queryBuilder.andWhere('execution.createdDate BETWEEN :startDate AND :endDate', { startDate, endDate });
        }
        else if (startDate) {
            queryBuilder.andWhere('execution.createdDate >= :startDate', { startDate });
        }
        else if (endDate) {
            queryBuilder.andWhere('execution.createdDate <= :endDate', { endDate });
        }
        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: executionsService.getAllExecutions - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const updateExecution = async (executionId, data, tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const query = { id: executionId };
        if (tenantId)
            query.tenantId = tenantId;
        const execution = await appServer.AppDataSource.getRepository(Execution_1.Execution).findOneBy(query);
        if (!execution) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Execution ${executionId} not found`);
        }
        const updateExecution = new Execution_1.Execution();
        Object.assign(updateExecution, { ...data, tenantId: execution.tenantId });
        await appServer.AppDataSource.getRepository(Execution_1.Execution).merge(execution, updateExecution);
        const dbResponse = await appServer.AppDataSource.getRepository(Execution_1.Execution).save(execution);
        return dbResponse;
    }
    catch (error) {
        if (error instanceof internalTHubError_1.InternalTHubError)
            throw error;
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: executionsService.updateExecution - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
/**
 * Delete multiple executions by their IDs
 * @param executionIds Array of execution IDs to delete
 * @param tenantId Optional tenant ID to filter executions
 * @returns Object with success status and count of deleted executions
 */
const deleteExecutions = async (executionIds, tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const executionRepository = appServer.AppDataSource.getRepository(Execution_1.Execution);
        const whereCondition = { id: (0, typeorm_1.In)(executionIds) };
        if (tenantId)
            whereCondition.tenantId = tenantId;
        const result = await executionRepository.delete(whereCondition);
        await appServer.AppDataSource.getRepository(ChatMessage_1.ChatMessage).update({ executionId: (0, typeorm_1.In)(executionIds) }, { executionId: null });
        return {
            success: true,
            deletedCount: result.affected || 0
        };
    }
    catch (error) {
        if (error instanceof internalTHubError_1.InternalTHubError)
            throw error;
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: executionsService.deleteExecutions - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
exports.default = {
    getExecutionById,
    getAllExecutions,
    deleteExecutions,
    getPublicExecutionById,
    updateExecution
};
//# sourceMappingURL=index.js.map