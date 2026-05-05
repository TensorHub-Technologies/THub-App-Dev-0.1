"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../../../src/utils");
const utils_2 = require("../utils");
class ExecuteFlow_Agentflow {
    label;
    name;
    version;
    description;
    type;
    icon;
    category;
    color;
    baseClasses;
    documentation;
    credential;
    inputs;
    constructor() {
        this.label = 'Execute Flow';
        this.name = 'executeFlowAgentflow';
        this.version = 1.1;
        this.type = 'ExecuteFlow';
        this.category = 'Agent Studio';
        this.description = 'Execute another flow';
        this.baseClasses = [this.type];
        this.color = '#F0F0F5';
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['chatflowApi'],
            optional: true
        };
        this.inputs = [
            {
                label: 'Select Flow',
                name: 'executeFlowSelectedFlow',
                type: 'asyncOptions',
                loadMethod: 'listFlows'
            },
            {
                label: 'Input',
                name: 'executeFlowInput',
                type: 'string',
                rows: 4,
                acceptVariable: true
            },
            {
                label: 'Override Config',
                name: 'executeFlowOverrideConfig',
                description: 'Override the config passed to the flow',
                type: 'json',
                optional: true,
                acceptVariable: true
            },
            {
                label: 'Base URL',
                name: 'executeFlowBaseURL',
                type: 'string',
                description: 'Base URL to THub. By default, it is the URL of the incoming request. Useful when you need to execute flow through an alternative route.',
                placeholder: 'http://localhost:3000',
                optional: true
            },
            {
                label: 'Return Response As',
                name: 'executeFlowReturnResponseAs',
                type: 'options',
                options: [
                    {
                        label: 'User Message',
                        name: 'userMessage'
                    },
                    {
                        label: 'Assistant Message',
                        name: 'assistantMessage'
                    }
                ],
                default: 'userMessage'
            },
            {
                label: 'Update Flow State',
                name: 'executeFlowUpdateState',
                description: 'Update runtime state during the execution of the workflow',
                type: 'array',
                optional: true,
                acceptVariable: true,
                array: [
                    {
                        label: 'Key',
                        name: 'key',
                        type: 'asyncOptions',
                        loadMethod: 'listRuntimeStateKeys',
                        freeSolo: true
                    },
                    {
                        label: 'Value',
                        name: 'value',
                        type: 'string',
                        acceptVariable: true,
                        acceptNodeOutputAsVariable: true
                    }
                ]
            }
        ];
    }
    //@ts-ignore
    loadMethods = {
        async listFlows(_, options) {
            const returnData = [];
            const appDataSource = options.appDataSource;
            const databaseEntities = options.databaseEntities;
            if (appDataSource === undefined || !appDataSource) {
                return returnData;
            }
            let tenantId = options.tenantId;
            try {
                // Fix: Use proper object syntax for findBy with tenantId
                const whereClause = tenantId ? { tenantId: tenantId } : {};
                const chatflows = await appDataSource.getRepository(databaseEntities['ChatFlow']).findBy(whereClause);
                for (let i = 0; i < chatflows.length; i += 1) {
                    let cfType = 'Workflow';
                    if (chatflows[i].type === 'AGENTFLOW') {
                        cfType = 'Agentflow V2';
                    }
                    else if (chatflows[i].type === 'MULTIAGENT') {
                        cfType = 'Agentflow V1';
                    }
                    const data = {
                        label: chatflows[i].name,
                        name: chatflows[i].id,
                        description: cfType
                    };
                    returnData.push(data);
                }
            }
            catch (error) {
                console.error('Error fetching flows by tenantId:', error);
                // Return empty array on error to prevent breaking the UI
            }
            // order by label
            return returnData.sort((a, b) => a.label.localeCompare(b.label));
        },
        async listRuntimeStateKeys(_, options) {
            const previousNodes = options.previousNodes;
            const startAgentflowNode = previousNodes.find((node) => node.name === 'startAgentflow');
            const state = startAgentflowNode?.inputs?.startState;
            return state.map((item) => ({ label: item.key, name: item.key }));
        }
    };
    async run(nodeData, _, options) {
        const baseURL = nodeData.inputs?.executeFlowBaseURL || options.baseURL;
        const selectedFlowId = nodeData.inputs?.executeFlowSelectedFlow;
        const flowInput = nodeData.inputs?.executeFlowInput;
        const returnResponseAs = nodeData.inputs?.executeFlowReturnResponseAs;
        const _executeFlowUpdateState = nodeData.inputs?.executeFlowUpdateState;
        let overrideConfig = nodeData.inputs?.executeFlowOverrideConfig;
        if (typeof overrideConfig === 'string' && overrideConfig.startsWith('{') && overrideConfig.endsWith('}')) {
            try {
                // Handle escaped square brackets and other common escape sequences
                const unescapedConfig = overrideConfig.replace(/\\(\[|\])/g, '$1');
                overrideConfig = JSON.parse(unescapedConfig);
            }
            catch (parseError) {
                throw new Error(`Invalid JSON in executeFlowOverrideConfig: ${parseError.message}`);
            }
        }
        const state = options.agentflowRuntime?.state;
        const runtimeChatHistory = options.agentflowRuntime?.chatHistory ?? [];
        const isLastNode = options.isLastNode;
        const sseStreamer = options.sseStreamer;
        try {
            const credentialData = await (0, utils_1.getCredentialData)(nodeData.credential ?? '', options);
            const chatflowApiKey = (0, utils_1.getCredentialParam)('chatflowApiKey', credentialData, nodeData);
            if (selectedFlowId === options.chatflowid)
                throw new Error('Cannot call the same agentflow!');
            // Additional security check: Verify the selected flow belongs to the same tenant
            const appDataSource = options.appDataSource;
            const databaseEntities = options.databaseEntities;
            const tenantId = options.tenantId;
            if (tenantId && appDataSource && databaseEntities) {
                try {
                    const selectedFlow = await appDataSource
                        .getRepository(databaseEntities['ChatFlow'])
                        .findOneBy({ id: selectedFlowId, tenantId: tenantId });
                    if (!selectedFlow) {
                        throw new Error(`Flow ${selectedFlowId} not found or access denied`);
                    }
                }
                catch (error) {
                    console.error('Error verifying flow access:', error);
                    throw new Error('Access denied to the selected flow');
                }
            }
            let headers = {
                'Content-Type': 'application/json',
                'thub-tool': 'true'
            };
            if (chatflowApiKey)
                headers = { ...headers, Authorization: `Bearer ${chatflowApiKey}` };
            const finalUrl = `${baseURL}/api/v1/prediction/${selectedFlowId}`;
            const requestConfig = {
                method: 'POST',
                url: finalUrl,
                headers,
                data: {
                    question: flowInput,
                    chatId: options.chatId,
                    overrideConfig
                }
            };
            const response = await (0, axios_1.default)(requestConfig);
            let resultText = '';
            if (response.data.text)
                resultText = response.data.text;
            else if (response.data.json)
                resultText = '```json\n' + JSON.stringify(response.data.json, null, 2);
            else
                resultText = JSON.stringify(response.data, null, 2);
            if (isLastNode && sseStreamer) {
                sseStreamer.streamTokenEvent(options.chatId, resultText);
            }
            // Update flow state if needed
            let newState = { ...state };
            if (_executeFlowUpdateState && Array.isArray(_executeFlowUpdateState) && _executeFlowUpdateState.length > 0) {
                newState = (0, utils_2.updateFlowState)(state, _executeFlowUpdateState);
            }
            // Process template variables in state
            if (newState && Object.keys(newState).length > 0) {
                for (const key in newState) {
                    if (newState[key].toString().includes('{{ output }}')) {
                        newState[key] = newState[key].replaceAll('{{ output }}', resultText);
                    }
                }
            }
            // Only add to runtime chat history if this is the first node
            const inputMessages = [];
            if (!runtimeChatHistory.length) {
                inputMessages.push({ role: 'user', content: flowInput });
            }
            let returnRole = 'user';
            if (returnResponseAs === 'assistantMessage') {
                returnRole = 'assistant';
            }
            const returnOutput = {
                id: nodeData.id,
                name: this.name,
                input: {
                    messages: [
                        {
                            role: 'user',
                            content: flowInput
                        }
                    ]
                },
                output: {
                    content: resultText
                },
                state: newState,
                chatHistory: [
                    ...inputMessages,
                    {
                        role: returnRole,
                        content: resultText,
                        name: nodeData?.label ? nodeData?.label.toLowerCase().replace(/\s/g, '_').trim() : nodeData?.id
                    }
                ]
            };
            return returnOutput;
        }
        catch (error) {
            console.error('ExecuteFlow Error:', error);
            // Format error response
            const errorResponse = {
                id: nodeData.id,
                name: this.name,
                input: {
                    messages: [
                        {
                            role: 'user',
                            content: flowInput
                        }
                    ]
                },
                error: {
                    name: error.name || 'Error',
                    message: error.message || 'An error occurred during the execution of the flow'
                },
                state
            };
            // Add more error details if available
            if (error.response) {
                errorResponse.error.status = error.response.status;
                errorResponse.error.statusText = error.response.statusText;
                errorResponse.error.data = error.response.data;
                errorResponse.error.headers = error.response.headers;
            }
            throw new Error(error);
        }
    }
}
module.exports = { nodeClass: ExecuteFlow_Agentflow };
//# sourceMappingURL=ExecuteFlow.js.map