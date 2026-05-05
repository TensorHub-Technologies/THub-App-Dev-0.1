"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const nodevm_1 = require("@flowiseai/nodevm");
const manager_1 = require("@langchain/core/callbacks/manager");
const tools_1 = require("@langchain/core/tools");
const utils_1 = require("../../../src/utils");
const uuid_1 = require("uuid");
class ChatflowTool_Tools {
    label;
    name;
    version;
    description;
    type;
    icon;
    category;
    baseClasses;
    credential;
    inputs;
    constructor() {
        this.label = 'Workflow Tool';
        this.name = 'ChatflowTool';
        this.version = 5.1;
        this.type = 'ChatflowTool';
        this.icon = 'chatflowTool.svg';
        this.category = 'Tools';
        this.description = 'Use as a tool to execute another chatflow';
        this.baseClasses = [this.type, 'Tool'];
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['chatflowApi'],
            optional: true
        };
        this.inputs = [
            {
                label: 'Select Workflow',
                name: 'selectedChatflow',
                type: 'asyncOptions',
                loadMethod: 'listChatflows'
            },
            {
                label: 'Tool Name',
                name: 'name',
                type: 'string'
            },
            {
                label: 'Tool Description',
                name: 'description',
                type: 'string',
                description: 'Description of what the tool does. This is for LLM to determine when to use this tool.',
                rows: 3,
                placeholder: 'State of the Union QA - useful for when you need to ask questions about the most recent state of the union address.'
            },
            {
                label: 'Return Direct',
                name: 'returnDirect',
                type: 'boolean',
                optional: true
            },
            {
                label: 'Override Config',
                name: 'overrideConfig',
                description: 'Override the config passed to the Workflow.',
                type: 'json',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Base URL',
                name: 'baseURL',
                type: 'string',
                description: 'Base URL to THub. By default, it is the URL of the incoming request. Useful when you need to execute the Workflow through an alternative route.',
                placeholder: 'http://localhost:3000',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Start new session per message',
                name: 'startNewSession',
                type: 'boolean',
                description: 'Whether to continue the session with the Workflow tool or start a new one with each interaction. Useful for Chatflows with memory if you want to avoid it.',
                default: false,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Use Question from Chat',
                name: 'useQuestionFromChat',
                type: 'boolean',
                description: 'Whether to use the question from the chat as input to the chatflow. If turned on, this will override the custom input.',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Custom Input',
                name: 'customInput',
                type: 'string',
                description: 'Custom input to be passed to the chatflow. Leave empty to let LLM decides the input.',
                optional: true,
                additionalParams: true,
                show: {
                    useQuestionFromChat: false
                }
            }
        ];
    }
    //@ts-ignore
    loadMethods = {
        async listChatflows(_, options) {
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
                    let type = chatflows[i].type;
                    if (type === 'AGENTFLOW') {
                        type = 'AgentflowV2';
                    }
                    else if (type === 'MULTIAGENT') {
                        type = 'AgentflowV1';
                    }
                    else if (type === 'ASSISTANT') {
                        type = 'Custom Assistant';
                    }
                    else {
                        type = 'Workflow';
                    }
                    const data = {
                        label: chatflows[i].name,
                        name: chatflows[i].id,
                        description: type
                    };
                    returnData.push(data);
                }
            }
            catch (error) {
                console.error('Error fetching chatflows by tenantId:', error);
                // Return empty array on error to prevent breaking the UI
            }
            return returnData;
        }
    };
    async init(nodeData, input, options) {
        const selectedChatflowId = nodeData.inputs?.selectedChatflow;
        const _name = nodeData.inputs?.name;
        const description = nodeData.inputs?.description;
        const useQuestionFromChat = nodeData.inputs?.useQuestionFromChat;
        const returnDirect = nodeData.inputs?.returnDirect;
        const customInput = nodeData.inputs?.customInput;
        const overrideConfig = typeof nodeData.inputs?.overrideConfig === 'string' &&
            nodeData.inputs.overrideConfig.startsWith('{') &&
            nodeData.inputs.overrideConfig.endsWith('}')
            ? JSON.parse(nodeData.inputs.overrideConfig)
            : nodeData.inputs?.overrideConfig;
        const startNewSession = nodeData.inputs?.startNewSession;
        const baseURL = nodeData.inputs?.baseURL || options.baseURL;
        const credentialData = await (0, utils_1.getCredentialData)(nodeData.credential ?? '', options);
        const chatflowApiKey = (0, utils_1.getCredentialParam)('chatflowApiKey', credentialData, nodeData);
        if (selectedChatflowId === options.chatflowid)
            throw new Error('Cannot call the same chatflow!');
        // Additional security check: Verify the selected chatflow belongs to the same tenant
        const appDataSource = options.appDataSource;
        const databaseEntities = options.databaseEntities;
        const tenantId = options.tenantId;
        if (tenantId && appDataSource && databaseEntities) {
            try {
                const selectedChatflow = await appDataSource
                    .getRepository(databaseEntities['ChatFlow'])
                    .findOneBy({ id: selectedChatflowId, tenantId: tenantId });
                if (!selectedChatflow) {
                    throw new Error(`Chatflow ${selectedChatflowId} not found or access denied`);
                }
            }
            catch (error) {
                console.error('Error verifying chatflow access:', error);
                throw new Error('Access denied to the selected chatflow');
            }
        }
        let headers = {};
        if (chatflowApiKey)
            headers = { Authorization: `Bearer ${chatflowApiKey}` };
        let toolInput = '';
        if (useQuestionFromChat) {
            toolInput = input;
        }
        else if (customInput) {
            toolInput = customInput;
        }
        let name = _name || 'chatflow_tool';
        return new ChatflowTool({
            name,
            baseURL,
            description,
            returnDirect,
            chatflowid: selectedChatflowId,
            startNewSession,
            headers,
            input: toolInput,
            overrideConfig
        });
    }
}
class ChatflowTool extends tools_1.StructuredTool {
    static lc_name() {
        return 'ChatflowTool';
    }
    name = 'chatflow_tool';
    description = 'Execute another chatflow';
    input = '';
    chatflowid = '';
    startNewSession = false;
    baseURL = 'http://localhost:3000';
    headers = {};
    overrideConfig;
    schema = zod_1.z.object({
        input: zod_1.z.string().describe('input question')
        // overrideConfig: z.record(z.any()).optional().describe('override config'), // This will be passed to the Agent, so comment it for now.
    });
    constructor({ name, description, returnDirect, input, chatflowid, startNewSession, baseURL, headers, overrideConfig }) {
        super();
        this.name = name;
        this.description = description;
        this.input = input;
        this.baseURL = baseURL;
        this.startNewSession = startNewSession;
        this.headers = headers;
        this.chatflowid = chatflowid;
        this.overrideConfig = overrideConfig;
        this.returnDirect = returnDirect;
    }
    async call(arg, configArg, tags, flowConfig) {
        const config = (0, manager_1.parseCallbackConfigArg)(configArg);
        if (config.runName === undefined) {
            config.runName = this.name;
        }
        let parsed;
        try {
            parsed = await this.schema.parseAsync(arg);
        }
        catch (e) {
            throw new Error(`Received tool input did not match expected schema: ${JSON.stringify(arg)}`);
        }
        const callbackManager_ = await manager_1.CallbackManager.configure(config.callbacks, this.callbacks, config.tags || tags, this.tags, config.metadata, this.metadata, { verbose: this.verbose });
        const runManager = await callbackManager_?.handleToolStart(this.toJSON(), typeof parsed === 'string' ? parsed : JSON.stringify(parsed), undefined, undefined, undefined, undefined, config.runName);
        let result;
        try {
            result = await this._call(parsed, runManager, flowConfig);
        }
        catch (e) {
            await runManager?.handleToolError(e);
            throw e;
        }
        if (result && typeof result !== 'string') {
            result = JSON.stringify(result);
        }
        await runManager?.handleToolEnd(result);
        return result;
    }
    // @ts-ignore
    async _call(arg, _, flowConfig) {
        const inputQuestion = this.input || arg.input;
        const body = {
            question: inputQuestion,
            chatId: this.startNewSession ? (0, uuid_1.v4)() : flowConfig?.chatId,
            overrideConfig: {
                sessionId: this.startNewSession ? (0, uuid_1.v4)() : flowConfig?.sessionId,
                ...(this.overrideConfig ?? {}),
                ...(arg.overrideConfig ?? {})
            }
        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'thub-tool': 'true',
                ...this.headers
            },
            body: JSON.stringify(body)
        };
        let sandbox = {
            $callOptions: options,
            $callBody: body,
            util: undefined,
            Symbol: undefined,
            child_process: undefined,
            fs: undefined,
            process: undefined
        };
        const code = `
const fetch = require('node-fetch');
const url = "${this.baseURL}/api/v1/prediction/${this.chatflowid}";

const body = $callBody;

const options = $callOptions;

try {
	const response = await fetch(url, options);
	const resp = await response.json();
	return resp.text;
} catch (error) {
	console.error(error);
	return '';
}
`;
        const builtinDeps = process.env.TOOL_FUNCTION_BUILTIN_DEP
            ? utils_1.defaultAllowBuiltInDep.concat(process.env.TOOL_FUNCTION_BUILTIN_DEP.split(','))
            : utils_1.defaultAllowBuiltInDep;
        const externalDeps = process.env.TOOL_FUNCTION_EXTERNAL_DEP ? process.env.TOOL_FUNCTION_EXTERNAL_DEP.split(',') : [];
        const deps = utils_1.availableDependencies.concat(externalDeps);
        const vmOptions = {
            console: 'inherit',
            sandbox,
            require: {
                external: { modules: deps },
                builtin: builtinDeps
            },
            eval: false,
            wasm: false,
            timeout: 10000
        };
        const vm = new nodevm_1.NodeVM(vmOptions);
        const response = await vm.run(`module.exports = async function() {${code}}()`, __dirname);
        return response;
    }
}
module.exports = { nodeClass: ChatflowTool_Tools };
//# sourceMappingURL=ChatflowTool.js.map