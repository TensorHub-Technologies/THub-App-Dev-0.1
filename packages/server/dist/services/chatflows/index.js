"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const thub_components_1 = require("thub-components");
const http_status_codes_1 = require("http-status-codes");
const typeorm_1 = require("typeorm");
const Interface_Metrics_1 = require("../../Interface.Metrics");
const ChatFlow_1 = require("../../database/entities/ChatFlow");
const ChatMessage_1 = require("../../database/entities/ChatMessage");
const ChatMessageFeedback_1 = require("../../database/entities/ChatMessageFeedback");
const UpsertHistory_1 = require("../../database/entities/UpsertHistory");
const internalTHubError_1 = require("../../errors/internalTHubError");
const utils_1 = require("../../errors/utils");
const documentstore_1 = __importDefault(require("../../services/documentstore"));
const utils_2 = require("../../utils");
const fileRepository_1 = require("../../utils/fileRepository");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const getUploadsConfig_1 = require("../../utils/getUploadsConfig");
const logger_1 = __importDefault(require("../../utils/logger"));
const uuid_1 = require("uuid");
// Check if chatflow valid for streaming
const checkIfChatflowIsValidForStreaming = async (chatflowId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        //**
        const chatflow = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
            id: chatflowId
        });
        if (!chatflow) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Workflow ${chatflowId} not found`);
        }
        /* Check for post-processing settings, if available isStreamValid is always false */
        let chatflowConfig = {};
        if (chatflow.chatbotConfig) {
            chatflowConfig = JSON.parse(chatflow.chatbotConfig);
            if (chatflowConfig?.postProcessing?.enabled === true) {
                return { isStreaming: false };
            }
        }
        if (chatflow.type === 'AGENTFLOW') {
            return { isStreaming: true };
        }
        /*** Get Ending Node with Directed Graph  ***/
        const flowData = chatflow.flowData;
        const parsedFlowData = JSON.parse(flowData);
        const nodes = parsedFlowData.nodes;
        const edges = parsedFlowData.edges;
        const { graph, nodeDependencies } = (0, utils_2.constructGraphs)(nodes, edges);
        const endingNodes = (0, utils_2.getEndingNodes)(nodeDependencies, graph, nodes);
        let isStreaming = false;
        for (const endingNode of endingNodes) {
            const endingNodeData = endingNode.data;
            const isEndingNode = endingNodeData?.outputs?.output === 'EndingNode';
            // Once custom function ending node exists, flow is always unavailable to stream
            if (isEndingNode) {
                return { isStreaming: false };
            }
            isStreaming = (0, utils_2.isFlowValidForStream)(nodes, endingNodeData);
        }
        // If it is a Multi/Sequential Agents, always enable streaming
        if (endingNodes.filter((node) => node.data.category === 'Multi Agents' || node.data.category === 'Sequential Agents').length > 0) {
            return { isStreaming: true };
        }
        const dbResponse = { isStreaming: isStreaming };
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.checkIfChatflowIsValidForStreaming - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
// Check if chatflow valid for uploads
const checkIfChatflowIsValidForUploads = async (chatflowId) => {
    try {
        const dbResponse = await (0, getUploadsConfig_1.utilGetUploadsConfig)(chatflowId);
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.checkIfChatflowIsValidForUploads - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const deleteChatflow = async (chatflowId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const dbResponse = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).delete({ id: chatflowId });
        try {
            // Delete all uploads corresponding to this chatflow
            await (0, thub_components_1.removeFolderFromStorage)(chatflowId);
            await documentstore_1.default.updateDocumentStoreUsage(chatflowId, undefined);
            // Delete all chat messages
            await appServer.AppDataSource.getRepository(ChatMessage_1.ChatMessage).delete({ chatflowid: chatflowId });
            // Delete all chat feedback
            await appServer.AppDataSource.getRepository(ChatMessageFeedback_1.ChatMessageFeedback).delete({ chatflowid: chatflowId });
            // Delete all upsert history
            await appServer.AppDataSource.getRepository(UpsertHistory_1.UpsertHistory).delete({ chatflowid: chatflowId });
        }
        catch (e) {
            logger_1.default.error(`[server]: Error deleting file storage for chatflow ${chatflowId}: ${e}`);
        }
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.deleteChatflow - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const getAllChatflows = async (type, tenantId, page = 1, limit = 12) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const repository = appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow);
        const offset = (page - 1) * limit;
        // ✅ Build type condition HERE, not after fetching
        const whereConditions = {};
        if (tenantId) {
            whereConditions.tenantId = tenantId;
        }
        if (type === 'MULTIAGENT' || type === 'AGENTFLOW' || type === 'ASSISTANT') {
            whereConditions.type = type;
        }
        else if (type === 'CHATFLOW') {
            // CHATFLOW includes records where type is 'CHATFLOW' OR null/undefined
            whereConditions.type = (0, typeorm_1.In)(['CHATFLOW', null]); // use TypeORM's In operator
        }
        // ✅ Now count only matching records
        const totalCount = await repository.count({ where: whereConditions });
        // ✅ Now fetch only matching records with pagination
        const dbResponse = await repository.find({
            where: whereConditions,
            order: { updatedDate: 'DESC' },
            skip: offset,
            take: limit
        });
        const totalPages = Math.ceil(totalCount / limit);
        return {
            data: dbResponse,
            total: totalCount,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.getAllChatflows - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const getChatflowByApiKey = async (apiKeyId, keyonly) => {
    try {
        // Here we only get chatflows that are bounded by the apikeyid and chatflows that are not bounded by any apikey
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        let query = appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow)
            .createQueryBuilder('cf')
            .where('cf.apikeyid = :apikeyid', { apikeyid: apiKeyId });
        if (keyonly === undefined) {
            query = query.orWhere('cf.apikeyid IS NULL').orWhere('cf.apikeyid = ""');
        }
        const dbResponse = await query.orderBy('cf.name', 'ASC').getMany();
        if (dbResponse.length < 1) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Workflow not found in the database!`);
        }
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.getChatflowByApiKey - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const getChatflowById = async (chatflowId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const dbResponse = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
            id: chatflowId
        });
        if (!dbResponse) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Workflow ${chatflowId} not found in the database!`);
        }
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.getChatflowById - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const saveChatflow = async (newChatFlow) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        let dbResponse;
        if ((0, fileRepository_1.containsBase64File)(newChatFlow)) {
            // we need a 2-step process, as we need to save the chatflow first and then update the file paths
            // this is because we need the chatflow id to create the file paths
            // step 1 - save with empty flowData
            const incomingFlowData = newChatFlow.flowData;
            newChatFlow.flowData = JSON.stringify({});
            const chatflow = appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).create(newChatFlow);
            const step1Results = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).save(chatflow);
            // step 2 - convert base64 to file paths and update the chatflow
            step1Results.flowData = await (0, fileRepository_1.updateFlowDataWithFilePaths)(step1Results.id, incomingFlowData);
            await _checkAndUpdateDocumentStoreUsage(step1Results);
            dbResponse = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).save(step1Results);
        }
        else {
            const chatflow = appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).create(newChatFlow);
            dbResponse = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).save(chatflow);
        }
        await appServer.telemetry.sendTelemetry('chatflow_created', {
            version: await (0, utils_2.getAppVersion)(),
            chatflowId: dbResponse.id,
            flowGraph: (0, utils_2.getTelemetryFlowObj)(JSON.parse(dbResponse.flowData)?.nodes, JSON.parse(dbResponse.flowData)?.edges)
        });
        appServer.metricsProvider?.incrementCounter(dbResponse?.type === 'MULTIAGENT' ? Interface_Metrics_1.THUB_METRIC_COUNTERS.AGENTFLOW_CREATED : Interface_Metrics_1.THUB_METRIC_COUNTERS.CHATFLOW_CREATED, { status: Interface_Metrics_1.THUB_COUNTER_STATUS.SUCCESS });
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.saveChatflow - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const importChatflows = async (newChatflows, queryRunner) => {
    try {
        for (const data of newChatflows) {
            if (data.id && !(0, uuid_1.validate)(data.id)) {
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: importChatflows - invalid id!`);
            }
        }
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const repository = queryRunner ? queryRunner.manager.getRepository(ChatFlow_1.ChatFlow) : appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow);
        // step 1 - check whether file chatflows array is zero
        if (newChatflows.length == 0)
            return;
        // step 2 - check whether ids are duplicate in database
        let ids = '(';
        let count = 0;
        const lastCount = newChatflows.length - 1;
        newChatflows.forEach((newChatflow) => {
            ids += `'${newChatflow.id}'`;
            if (lastCount != count)
                ids += ',';
            if (lastCount == count)
                ids += ')';
            count += 1;
        });
        const selectResponse = await repository.createQueryBuilder('cf').select('cf.id').where(`cf.id IN ${ids}`).getMany();
        const foundIds = selectResponse.map((response) => {
            return response.id;
        });
        // step 3 - remove ids that are only duplicate
        const prepChatflows = newChatflows.map((newChatflow) => {
            let id = '';
            if (newChatflow.id)
                id = newChatflow.id;
            let flowData = '';
            if (newChatflow.flowData)
                flowData = newChatflow.flowData;
            if (foundIds.includes(id)) {
                newChatflow.id = undefined;
                newChatflow.name += ' (1)';
            }
            newChatflow.flowData = JSON.stringify(JSON.parse(flowData));
            return newChatflow;
        });
        // step 4 - transactional insert array of entities
        const insertResponse = await repository.insert(prepChatflows);
        return insertResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.saveChatflows - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const updateChatflow = async (chatflow, updateChatFlow) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        if (updateChatFlow.flowData && (0, fileRepository_1.containsBase64File)(updateChatFlow)) {
            updateChatFlow.flowData = await (0, fileRepository_1.updateFlowDataWithFilePaths)(chatflow.id, updateChatFlow.flowData);
        }
        const newDbChatflow = appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).merge(chatflow, updateChatFlow);
        await _checkAndUpdateDocumentStoreUsage(newDbChatflow);
        const dbResponse = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).save(newDbChatflow);
        return dbResponse;
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.updateChatflow - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
// Get specific chatflow via id (PUBLIC endpoint, used when sharing chatbot link)
const getSinglePublicChatflow = async (chatflowId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const dbResponse = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
            id: chatflowId
        });
        if (dbResponse && dbResponse.isPublic) {
            return dbResponse;
        }
        else if (dbResponse && !dbResponse.isPublic) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, `Unauthorized`);
        }
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Workflow ${chatflowId} not found`);
    }
    catch (error) {
        if (error instanceof internalTHubError_1.InternalTHubError && error.statusCode === http_status_codes_1.StatusCodes.UNAUTHORIZED) {
            throw error;
        }
        else {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.getSinglePublicChatflow - ${(0, utils_1.getErrorMessage)(error)}`);
        }
    }
};
// Get specific chatflow chatbotConfig via id (PUBLIC endpoint, used to retrieve config for embedded chat)
// Safe as public endpoint as chatbotConfig doesn't contain sensitive credential
const getSinglePublicChatbotConfig = async (chatflowId) => {
    try {
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const dbResponse = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
            id: chatflowId
        });
        if (!dbResponse) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Workflow ${chatflowId} not found`);
        }
        const uploadsConfig = await (0, getUploadsConfig_1.utilGetUploadsConfig)(chatflowId);
        // even if chatbotConfig is not set but uploads are enabled
        // send uploadsConfig to the chatbot
        if (dbResponse.chatbotConfig || uploadsConfig) {
            try {
                const parsedConfig = dbResponse.chatbotConfig ? JSON.parse(dbResponse.chatbotConfig) : {};
                const ttsConfig = typeof dbResponse.textToSpeech === 'string' ? JSON.parse(dbResponse.textToSpeech) : dbResponse.textToSpeech;
                let isTTSEnabled = false;
                if (ttsConfig) {
                    Object.keys(ttsConfig).forEach((provider) => {
                        if (provider !== 'none' && ttsConfig?.[provider]?.status) {
                            isTTSEnabled = true;
                        }
                    });
                }
                delete parsedConfig.allowedOrigins;
                delete parsedConfig.allowedOriginsError;
                return { ...parsedConfig, uploads: uploadsConfig, flowData: dbResponse.flowData, isTTSEnabled };
            }
            catch (e) {
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error parsing Chatbot Config for Chatflow ${chatflowId}`);
            }
        }
        return 'OK';
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: chatflowsService.getSinglePublicChatbotConfig - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const _checkAndUpdateDocumentStoreUsage = async (chatflow) => {
    const parsedFlowData = JSON.parse(chatflow.flowData);
    const nodes = parsedFlowData.nodes;
    // from the nodes array find if there is a node with name == documentStore)
    const node = nodes.length > 0 && nodes.find((node) => node.data.name === 'documentStore');
    if (!node || !node.data || !node.data.inputs || node.data.inputs['selectedStore'] === undefined) {
        await documentstore_1.default.updateDocumentStoreUsage(chatflow.id, undefined);
    }
    else {
        await documentstore_1.default.updateDocumentStoreUsage(chatflow.id, node.data.inputs['selectedStore']);
    }
};
exports.default = {
    checkIfChatflowIsValidForStreaming,
    checkIfChatflowIsValidForUploads,
    deleteChatflow,
    getAllChatflows,
    getChatflowByApiKey,
    getChatflowById,
    saveChatflow,
    importChatflows,
    updateChatflow,
    getSinglePublicChatflow,
    getSinglePublicChatbotConfig
};
//# sourceMappingURL=index.js.map