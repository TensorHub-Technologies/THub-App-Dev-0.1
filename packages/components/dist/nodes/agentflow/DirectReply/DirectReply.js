"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DirectReply_Agentflow {
    label;
    name;
    version;
    description;
    type;
    icon;
    category;
    color;
    hideOutput;
    hint;
    baseClasses;
    documentation;
    credential;
    inputs;
    constructor() {
        this.label = 'Direct Reply';
        this.name = 'directReplyAgentflow';
        this.version = 1.0;
        this.type = 'DirectReply';
        this.category = 'Agent Studio';
        this.description = 'Directly reply to the user with a message';
        this.baseClasses = [this.type];
        this.color = '#06D6A0';
        this.hideOutput = true;
        this.inputs = [
            {
                label: 'Message',
                name: 'directReplyMessage',
                type: 'string',
                rows: 4,
                acceptVariable: true
            }
        ];
    }
    async run(nodeData, _, options) {
        const directReplyMessage = nodeData.inputs?.directReplyMessage;
        const state = options.agentflowRuntime?.state;
        const chatId = options.chatId;
        const isLastNode = options.isLastNode;
        const isStreamable = isLastNode && options.sseStreamer !== undefined;
        if (isStreamable) {
            const sseStreamer = options.sseStreamer;
            sseStreamer.streamTokenEvent(chatId, directReplyMessage);
        }
        const returnOutput = {
            id: nodeData.id,
            name: this.name,
            input: {},
            output: {
                content: directReplyMessage
            },
            state
        };
        return returnOutput;
    }
}
module.exports = { nodeClass: DirectReply_Agentflow };
//# sourceMappingURL=DirectReply.js.map