"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const Tool_1 = require("../../database/entities/Tool");
const internalTHubError_1 = require("../../errors/internalTHubError");
const utils_1 = require("../../errors/utils");
const utils_2 = require("../../utils");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const Interface_Metrics_1 = require("../../Interface.Metrics");
const uuid_1 = require("uuid");
const createTool = async (requestBody) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const newTool = new Tool_1.Tool();
        Object.assign(newTool, requestBody);
        const tool = await appServer.AppDataSource.getRepository(Tool_1.Tool).create(newTool);
        const dbResponse = await appServer.AppDataSource.getRepository(Tool_1.Tool).save(tool);
        await appServer.telemetry.sendTelemetry('tool_created', {
            version: await (0, utils_2.getAppVersion)(),
            toolId: dbResponse.id,
            toolName: dbResponse.name
        });
        appServer.metricsProvider?.incrementCounter(Interface_Metrics_1.THUB_METRIC_COUNTERS.TOOL_CREATED, { status: Interface_Metrics_1.THUB_COUNTER_STATUS.SUCCESS });
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: toolsService.createTool - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const deleteTool = async (toolId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const dbResponse = await appServer.AppDataSource.getRepository(Tool_1.Tool).delete({
            id: toolId
        });
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: toolsService.deleteTool - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const getAllTools = async (tenantId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const dbResponse = await appServer.AppDataSource.getRepository(Tool_1.Tool).findBy({ tenantId });
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: toolsService.getAllTools - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const getToolById = async (toolId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const dbResponse = await appServer.AppDataSource.getRepository(Tool_1.Tool).findOneBy({
            id: toolId
        });
        if (!dbResponse) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Tool ${toolId} not found`);
        }
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: toolsService.getToolById - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const updateTool = async (toolId, toolBody) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const tool = await appServer.AppDataSource.getRepository(Tool_1.Tool).findOneBy({
            id: toolId
        });
        if (!tool) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Tool ${toolId} not found`);
        }
        const updateTool = new Tool_1.Tool();
        Object.assign(updateTool, toolBody);
        await appServer.AppDataSource.getRepository(Tool_1.Tool).merge(tool, updateTool);
        const dbResponse = await appServer.AppDataSource.getRepository(Tool_1.Tool).save(tool);
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: toolsService.updateTool - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const importTools = async (newTools, queryRunner) => {
    try {
        for (const data of newTools) {
            if (data.id && !(0, uuid_1.validate)(data.id)) {
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: importTools - invalid id!`);
            }
        }
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const repository = queryRunner ? queryRunner.manager.getRepository(Tool_1.Tool) : appServer.AppDataSource.getRepository(Tool_1.Tool);
        // step 1 - check whether file tools array is zero
        if (newTools.length == 0)
            return;
        // step 2 - check whether ids are duplicate in database
        let ids = '(';
        let count = 0;
        const lastCount = newTools.length - 1;
        newTools.forEach((newTools) => {
            ids += `'${newTools.id}'`;
            if (lastCount != count)
                ids += ',';
            if (lastCount == count)
                ids += ')';
            count += 1;
        });
        const selectResponse = await repository.createQueryBuilder('t').select('t.id').where(`t.id IN ${ids}`).getMany();
        const foundIds = selectResponse.map((response) => {
            return response.id;
        });
        // step 3 - remove ids that are only duplicate
        const prepTools = newTools.map((newTool) => {
            let id = '';
            if (newTool.id)
                id = newTool.id;
            if (foundIds.includes(id)) {
                newTool.id = undefined;
                newTool.name += ' (1)';
            }
            return newTool;
        });
        // step 4 - transactional insert array of entities
        const insertResponse = await repository.insert(prepTools);
        return insertResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: toolsService.importTools - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
exports.default = {
    createTool,
    deleteTool,
    getAllTools,
    getToolById,
    updateTool,
    importTools
};
//# sourceMappingURL=index.js.map