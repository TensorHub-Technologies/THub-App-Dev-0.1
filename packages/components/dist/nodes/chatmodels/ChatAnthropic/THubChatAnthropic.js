"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatAnthropic = void 0;
const anthropic_1 = require("@langchain/anthropic");
const DEFAULT_IMAGE_MODEL = 'claude-3-5-haiku-latest';
const DEFAULT_IMAGE_MAX_TOKEN = 2048;
class ChatAnthropic extends anthropic_1.ChatAnthropic {
    configuredModel;
    configuredMaxToken;
    multiModalOption;
    id;
    constructor(id, fields) {
        // @ts-ignore
        super(fields ?? {});
        this.id = id;
        this.configuredModel = fields?.modelName || '';
        this.configuredMaxToken = fields?.maxTokens ?? 2048;
    }
    /**
     * Override invocationParams to sanitize Langchain's sentinel default values (-1)
     * for topP and topK which newer Anthropic models reject.
     */
    invocationParams(options) {
        const params = super.invocationParams(options);
        // Anthropic API rejects top_p: -1 and top_k: -1 (Langchain sentinel defaults).
        // Strip them out so Anthropic uses its own defaults.
        if (params.top_p === -1)
            delete params.top_p;
        if (params.top_k === -1)
            delete params.top_k;
        return params;
    }
    revertToOriginalModel() {
        this.modelName = this.configuredModel;
        this.maxTokens = this.configuredMaxToken;
    }
    setMultiModalOption(multiModalOption) {
        this.multiModalOption = multiModalOption;
    }
    setVisionModel() {
        if (!this.modelName.startsWith('claude-3')) {
            this.modelName = DEFAULT_IMAGE_MODEL;
            this.maxTokens = this.configuredMaxToken ? this.configuredMaxToken : DEFAULT_IMAGE_MAX_TOKEN;
        }
    }
}
exports.ChatAnthropic = ChatAnthropic;
//# sourceMappingURL=THubChatAnthropic.js.map