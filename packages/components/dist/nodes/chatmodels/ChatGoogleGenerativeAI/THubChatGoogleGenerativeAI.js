"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGoogleGenerativeAI = void 0;
const google_genai_1 = require("@langchain/google-genai");
class ChatGoogleGenerativeAI extends google_genai_1.ChatGoogleGenerativeAI {
    configuredModel;
    configuredMaxToken;
    multiModalOption;
    id;
    constructor(id, fields) {
        super(fields);
        this.id = id;
        this.configuredModel = fields?.model ?? '';
        this.configuredMaxToken = fields?.maxOutputTokens;
    }
    revertToOriginalModel() {
        this.model = this.configuredModel;
        this.maxOutputTokens = this.configuredMaxToken;
    }
    setMultiModalOption(multiModalOption) {
        this.multiModalOption = multiModalOption;
    }
    setVisionModel() {
        // pass
    }
}
exports.ChatGoogleGenerativeAI = ChatGoogleGenerativeAI;
//# sourceMappingURL=THubChatGoogleGenerativeAI.js.map