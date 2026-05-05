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
const http_status_codes_1 = require("http-status-codes");
const internalTHubError_1 = require("../../errors/internalTHubError");
const utils_1 = require("../../errors/utils");
const utils_2 = require("../../utils");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const ChatFlow_1 = require("../../database/entities/ChatFlow");
const function_calling_1 = require("@langchain/core/utils/function_calling");
const uuid_1 = require("uuid");
const Variable_1 = require("../../database/entities/Variable");
const SOURCE_DOCUMENTS_PREFIX = '\n\n----THUB_SOURCE_DOCUMENTS----\n\n';
const ARTIFACTS_PREFIX = '\n\n----THUB_ARTIFACTS----\n\n';
const buildAndInitTool = async (chatflowid, _chatId, _apiMessageId) => {
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    const chatflow = await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
        id: chatflowid
    });
    if (!chatflow) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Workflow ${chatflowid} not found`);
    }
    const chatId = _chatId || (0, uuid_1.v4)();
    const apiMessageId = _apiMessageId || (0, uuid_1.v4)();
    const flowData = JSON.parse(chatflow.flowData);
    const nodes = flowData.nodes;
    const edges = flowData.edges;
    const toolAgentNode = nodes.find((node) => node.data.inputAnchors.find((acr) => acr.type === 'Tool') && node.data.category === 'Agents');
    if (!toolAgentNode) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Agent with tools not found in chatflow ${chatflowid}`);
    }
    const { graph, nodeDependencies } = (0, utils_2.constructGraphs)(nodes, edges);
    const directedGraph = graph;
    const endingNodes = (0, utils_2.getEndingNodes)(nodeDependencies, directedGraph, nodes);
    /*** Get Starting Nodes with Reversed Graph ***/
    const constructedObj = (0, utils_2.constructGraphs)(nodes, edges, { isReversed: true });
    const nonDirectedGraph = constructedObj.graph;
    let startingNodeIds = [];
    let depthQueue = {};
    const endingNodeIds = endingNodes.map((n) => n.id);
    for (const endingNodeId of endingNodeIds) {
        const resx = (0, utils_2.getStartingNodes)(nonDirectedGraph, endingNodeId);
        startingNodeIds.push(...resx.startingNodeIds);
        depthQueue = Object.assign(depthQueue, resx.depthQueue);
    }
    startingNodeIds = [...new Set(startingNodeIds)];
    const availableVariables = await appServer.AppDataSource.getRepository(Variable_1.Variable).find();
    const { nodeOverrides, variableOverrides, apiOverrideStatus } = (0, utils_2.getAPIOverrideConfig)(chatflow);
    const reactFlowNodes = await (0, utils_2.buildFlow)({
        startingNodeIds,
        reactFlowNodes: nodes,
        reactFlowEdges: edges,
        graph,
        depthQueue,
        componentNodes: appServer.nodesPool.componentNodes,
        question: '',
        chatHistory: [],
        chatId: chatId,
        sessionId: chatId,
        chatflowid,
        apiMessageId,
        appDataSource: appServer.AppDataSource,
        apiOverrideStatus,
        nodeOverrides,
        availableVariables,
        variableOverrides
    });
    const nodeToExecute = endingNodeIds.length === 1
        ? reactFlowNodes.find((node) => endingNodeIds[0] === node.id)
        : reactFlowNodes[reactFlowNodes.length - 1];
    if (!nodeToExecute) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Node not found`);
    }
    const flowDataObj = { chatflowid, chatId };
    const reactFlowNodeData = await (0, utils_2.resolveVariables)(nodeToExecute.data, reactFlowNodes, '', [], flowDataObj, '', availableVariables, variableOverrides);
    let nodeToExecuteData = reactFlowNodeData;
    const nodeInstanceFilePath = appServer.nodesPool.componentNodes[nodeToExecuteData.name].filePath;
    const nodeModule = await Promise.resolve(`${nodeInstanceFilePath}`).then(s => __importStar(require(s)));
    const nodeInstance = new nodeModule.nodeClass();
    const agent = await nodeInstance.init(nodeToExecuteData, '', {
        chatflowid,
        chatId,
        appDataSource: appServer.AppDataSource,
        databaseEntities: utils_2.databaseEntities,
        analytic: chatflow.analytic
    });
    return agent;
};
const getAgentTools = async (chatflowid) => {
    try {
        const agent = await buildAndInitTool(chatflowid);
        const tools = agent.tools;
        return tools.map(function_calling_1.convertToOpenAIFunction);
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: openaiRealTimeService.getAgentTools - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
const executeAgentTool = async (chatflowid, chatId, toolName, inputArgs, apiMessageId) => {
    try {
        const agent = await buildAndInitTool(chatflowid, chatId, apiMessageId);
        const tools = agent.tools;
        const tool = tools.find((tool) => tool.name === toolName);
        if (!tool) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, `Tool ${toolName} not found`);
        }
        const inputArgsObj = typeof inputArgs === 'string' ? JSON.parse(inputArgs) : inputArgs;
        let toolOutput = await tool.call(inputArgsObj, undefined, undefined, { chatId });
        if (typeof toolOutput === 'object') {
            toolOutput = JSON.stringify(toolOutput);
        }
        let sourceDocuments = [];
        if (typeof toolOutput === 'string' && toolOutput.includes(SOURCE_DOCUMENTS_PREFIX)) {
            const _splitted = toolOutput.split(SOURCE_DOCUMENTS_PREFIX);
            toolOutput = _splitted[0];
            const _sourceDocuments = JSON.parse(_splitted[1].trim());
            if (Array.isArray(_sourceDocuments)) {
                sourceDocuments = _sourceDocuments;
            }
            else {
                sourceDocuments.push(_sourceDocuments);
            }
        }
        let artifacts = [];
        if (typeof toolOutput === 'string' && toolOutput.includes(ARTIFACTS_PREFIX)) {
            const _splitted = toolOutput.split(ARTIFACTS_PREFIX);
            toolOutput = _splitted[0];
            const _artifacts = JSON.parse(_splitted[1].trim());
            if (Array.isArray(_artifacts)) {
                artifacts = _artifacts;
            }
            else {
                artifacts.push(_artifacts);
            }
        }
        return {
            output: toolOutput,
            sourceDocuments,
            artifacts
        };
    }
    catch (error) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, `Error: openaiRealTimeService.executeAgentTool - ${(0, utils_1.getErrorMessage)(error)}`);
    }
};
exports.default = {
    getAgentTools,
    executeAgentTool
};
//# sourceMappingURL=index.js.map