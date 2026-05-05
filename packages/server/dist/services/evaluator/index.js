"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const internalTHubError_1 = require("../../errors/internalTHubError");
const utils_1 = require("../../errors/utils");
const Evaluator_1 = require("../../database/entities/Evaluator");
const Interface_Evaluation_1 = require("../../Interface.Evaluation");
const getAllEvaluators = async (page = -1, limit = -1, tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const queryBuilder = appServer.AppDataSource.getRepository(Evaluator_1.Evaluator).createQueryBuilder('ev').orderBy('ev.updatedDate', 'DESC');
        if (tenantId) {
            queryBuilder.andWhere('ev.tenantId = :tenantId', { tenantId });
        }
        if (page > 0 && limit > 0) {
            queryBuilder.skip((page - 1) * limit);
            queryBuilder.take(limit);
        }
        const [data, total] = await queryBuilder.getManyAndCount();
        if (page > 0 && limit > 0) {
            return {
                total,
                data: Interface_Evaluation_1.EvaluatorDTO.fromEntities(data)
            };
        }
        else {
            return Interface_Evaluation_1.EvaluatorDTO.fromEntities(data);
        }
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: evaluatorService.getAllEvaluators - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const getEvaluator = async (id, tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const queryBuilder = appServer.AppDataSource.getRepository(Evaluator_1.Evaluator).createQueryBuilder('ev').where('ev.id = :id', { id });
        if (tenantId) {
            queryBuilder.andWhere('ev.tenantId = :tenantId', { tenantId });
        }
        const evaluator = await queryBuilder.getOne();
        if (!evaluator)
            throw new Error(`Evaluator ${id} not found`);
        return Interface_Evaluation_1.EvaluatorDTO.fromEntity(evaluator);
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: evaluatorService.getEvaluator - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
// Create new Evaluator
const createEvaluator = async (body) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const newDs = Interface_Evaluation_1.EvaluatorDTO.toEntity(body);
        if (body.tenantId) {
            newDs.tenantId = body.tenantId;
        }
        const evaluator = appServer.AppDataSource.getRepository(Evaluator_1.Evaluator).create(newDs);
        const result = await appServer.AppDataSource.getRepository(Evaluator_1.Evaluator).save(evaluator);
        return Interface_Evaluation_1.EvaluatorDTO.fromEntity(result);
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: evaluatorService.createEvaluator - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
// Update Evaluator
const updateEvaluator = async (id, body) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const queryBuilder = appServer.AppDataSource.getRepository(Evaluator_1.Evaluator).createQueryBuilder('ev').where('ev.id = :id', { id });
        if (body.tenantId) {
            queryBuilder.andWhere('ev.tenantId = :tenantId', { tenantId: body.tenantId });
        }
        const evaluator = await queryBuilder.getOne();
        if (!evaluator)
            throw new Error(`Evaluator ${id} not found`);
        const updateEvaluator = Interface_Evaluation_1.EvaluatorDTO.toEntity(body);
        updateEvaluator.id = id;
        if (body.tenantId) {
            updateEvaluator.tenantId = body.tenantId;
        }
        appServer.AppDataSource.getRepository(Evaluator_1.Evaluator).merge(evaluator, updateEvaluator);
        const result = await appServer.AppDataSource.getRepository(Evaluator_1.Evaluator).save(evaluator);
        return Interface_Evaluation_1.EvaluatorDTO.fromEntity(result);
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: evaluatorService.updateEvaluator - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
// Delete Evaluator via id
const deleteEvaluator = async (id, tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        if (tenantId) {
            const evaluator = await appServer.AppDataSource.getRepository(Evaluator_1.Evaluator)
                .createQueryBuilder('ev')
                .where('ev.id = :id', { id })
                .andWhere('ev.tenantId = :tenantId', { tenantId })
                .getOne();
            if (!evaluator)
                throw new Error(`Evaluator ${id} not found`);
        }
        return await appServer.AppDataSource.getRepository(Evaluator_1.Evaluator).delete({ id: id });
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: evaluatorService.deleteEvaluator - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
exports.default = {
    getAllEvaluators,
    getEvaluator,
    createEvaluator,
    updateEvaluator,
    deleteEvaluator
};
//# sourceMappingURL=index.js.map