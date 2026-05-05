"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatXAI = void 0;
const xai_1 = require("@langchain/xai");
class ChatXAI extends xai_1.ChatXAI {
    configuredModel;
    configuredMaxToken;
    multiModalOption;
    id;
    constructor(id, fields) {
        super(fields);
        this.id = id;
        this.configuredModel = fields?.model ?? '';
        this.configuredMaxToken = fields?.maxTokens;
    }
    revertToOriginalModel() {
        this.modelName = this.configuredModel;
        this.maxTokens = this.configuredMaxToken;
    }
    setMultiModalOption(multiModalOption) {
        this.multiModalOption = multiModalOption;
    }
    setVisionModel() {
        // pass
    }
}
exports.ChatXAI = ChatXAI;
//# sourceMappingURL=THubChatXAI.js.map