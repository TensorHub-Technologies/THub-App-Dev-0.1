"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../../src/a2a/client/index.js");
const tools_1 = require("@langchain/core/tools");
const uuid_1 = require("uuid");
const lodash_1 = require("lodash");
class A2AClientTool extends tools_1.Tool {
    name = 'a2a_client';
    description = `client for A2A server`;
    serverUrl;
    constructor(serverUrl) {
        super();
        this.serverUrl = serverUrl;
    }
    async _call(initialInput) {
        let result_A2A = '';
        if (!initialInput || typeof initialInput !== 'string') {
            return JSON.stringify({ error: 'Input must be a single URL string.' });
        }
        try {
            const client = new index_js_1.A2AClient(this.serverUrl);
            const messageId = (0, uuid_1.v4)();
            let taskId;
            // 1. Send a message to the agent.
            const sendParams = {
                message: {
                    messageId: messageId,
                    role: 'user',
                    parts: [{ kind: 'text', text: initialInput }],
                    kind: 'message'
                },
                configuration: {
                    blocking: true,
                    acceptedOutputModes: ['text/plain']
                }
            };
            const agentCard = await client.getAgentCard();
            //console.log("Agent Card:", agentCard);
            const sendResponse = await client.sendMessage(sendParams);
            //console.log("Send Message Response:", sendResponse);
            // On success, the result can be a Task or a Message. Check which one it is.
            const result = sendResponse.result;
            if (result.kind === 'task') {
                const taskResult = result;
                const getParams = { id: taskResult.id };
                const getResponse = await client.getTask(getParams);
                const getTaskResult = getResponse.result;
                console.log('getTaskResult.status.message.parts:', getTaskResult.status?.message?.parts);
                //console.log("getTaskResult.status.message.part:", getTaskResult.status?.message?.parts?.[0]);
                (0, lodash_1.forEach)(getTaskResult.status?.message?.parts, (part) => {
                    if (part.kind === 'text' && part.text) {
                        result_A2A += part.text;
                    }
                });
                if (getTaskResult.status?.message?.parts) {
                    ;
                    getTaskResult.status.message.parts.forEach((part) => {
                        if (part.kind === 'text' && part.text) {
                            console.log('Task output:', part.text);
                            return part.text;
                        }
                    });
                }
            }
            else if (result.kind === 'message') {
                const messageResult = result;
                messageResult.parts.forEach((part) => {
                    if (part.kind === 'text') {
                        console.log('Agent says:', part.text);
                    }
                });
            }
            // 2. If a task was created, get its status.
            if (taskId) {
                const getParams = { id: taskId };
                const getResponse = await client.getTask(getParams);
                const getTaskResult = getResponse.result;
                (0, lodash_1.forEach)(getTaskResult.status?.message?.parts, (part) => {
                    if (part.kind === 'text' && part.text) {
                        result_A2A += part.text;
                    }
                });
            }
            if (result_A2A && result_A2A.length > 0) {
                return result_A2A;
            }
            else {
                return `A2A client called with input: ${initialInput}`;
            }
        }
        catch (error) {
            return JSON.stringify({ error: `Failed scrape operation: ${error?.message || 'Unknown error'}` });
        }
    }
}
class A2A {
    label;
    name;
    version;
    description;
    type;
    icon;
    category;
    baseClasses;
    documentation;
    credential;
    inputs;
    constructor() {
        this.label = 'A2A Client';
        this.name = 'A2A Client';
        this.version = 1.1;
        this.type = 'A2A Client';
        this.icon = 'google.svg';
        this.category = 'Tools';
        this.description = 'A2A Client';
        this.documentation = 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search';
        this.inputs = [
            {
                label: 'A2A Server url',
                name: 'A2AServerurl',
                type: 'string',
                placeholder: 'A2A Server Url'
            }
        ];
        this.baseClasses = ['Tool'];
    }
    async init(nodeData, _) {
        console.log('A2AServerurl: ', nodeData.inputs?.A2AServerurl);
        const tool = new A2AClientTool(nodeData.inputs?.A2AServerurl);
        return tool;
    }
}
module.exports = { nodeClass: A2A };
//# sourceMappingURL=A2A.js.map