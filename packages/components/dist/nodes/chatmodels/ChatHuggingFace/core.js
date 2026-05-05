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
exports.HuggingFaceInference = void 0;
const llms_1 = require("@langchain/core/language_models/llms");
const utils_1 = require("../../../src/utils");
const outputs_1 = require("@langchain/core/outputs");
// Define constants for environment variable names
const HF_API_KEY_ENV_NAME = 'HUGGINGFACEHUB_API_KEY';
class HuggingFaceInference extends llms_1.LLM {
    get lc_secrets() {
        return {
            apiKey: process.env.HF_API_KEY_ENV_NAME ?? 'HF_API_KEY_ENV_NAME'
        };
    }
    model = 'gpt2';
    temperature = undefined;
    stopSequences = undefined;
    maxTokens = undefined;
    topP = undefined;
    topK = undefined;
    frequencyPenalty = undefined;
    apiKey = undefined;
    endpointUrl = undefined;
    includeCredentials = undefined;
    constructor(fields) {
        super(fields ?? {});
        this.model = fields?.model ?? this.model;
        this.temperature = fields?.temperature ?? this.temperature;
        this.maxTokens = fields?.maxTokens ?? this.maxTokens;
        this.stopSequences = fields?.stopSequences ?? this.stopSequences;
        this.topP = fields?.topP ?? this.topP;
        this.topK = fields?.topK ?? this.topK;
        this.frequencyPenalty = fields?.frequencyPenalty ?? this.frequencyPenalty;
        this.apiKey = fields?.apiKey ?? (0, utils_1.getEnvironmentVariable)(HF_API_KEY_ENV_NAME);
        this.endpointUrl = fields?.endpointUrl;
        this.includeCredentials = fields?.includeCredentials;
        if (!this.apiKey) {
            throw new Error(`Please set an API key for HuggingFace Hub in the environment variable ${HF_API_KEY_ENV_NAME} or in the apiKey field of the HuggingFaceInference constructor.`);
        }
    }
    _llmType() {
        return 'hf';
    }
    invocationParams(options) {
        return {
            model: this.model,
            parameters: {
                // make it behave similar to openai, returning only the generated text
                return_full_text: false,
                temperature: this.temperature,
                max_new_tokens: this.maxTokens,
                stop: options?.stop ?? this.stopSequences,
                top_p: this.topP,
                top_k: this.topK,
                repetition_penalty: this.frequencyPenalty
            }
        };
    }
    async *_streamResponseChunks(prompt, options, runManager) {
        const hfi = await this._prepareHFInference();
        const stream = await this.caller.call(async () => hfi.textGenerationStream({
            ...this.invocationParams(options),
            inputs: prompt
        }));
        for await (const chunk of stream) {
            const token = chunk.token.text;
            yield new outputs_1.GenerationChunk({ text: token, generationInfo: chunk });
            await runManager?.handleLLMNewToken(token ?? '');
            // stream is done
            if (chunk.generated_text)
                yield new outputs_1.GenerationChunk({
                    text: '',
                    generationInfo: { finished: true }
                });
        }
    }
    /** @ignore */
    async _call(prompt, options) {
        const hfi = await this._prepareHFInference();
        const args = { ...this.invocationParams(options), inputs: prompt };
        const res = await this.caller.callWithOptions({ signal: options.signal }, hfi.textGeneration.bind(hfi), args);
        return res.generated_text;
    }
    /** @ignore */
    async _prepareHFInference() {
        const { HfInference } = await HuggingFaceInference.imports();
        const hfi = new HfInference(this.apiKey, {
            includeCredentials: this.includeCredentials
        });
        return this.endpointUrl ? hfi.endpoint(this.endpointUrl) : hfi;
    }
    /** @ignore */
    static async imports() {
        try {
            const { HfInference } = await Promise.resolve().then(() => __importStar(require('@huggingface/inference')));
            return { HfInference };
        }
        catch (e) {
            throw new Error('Please install huggingface as a dependency with, e.g. `pnpm install @huggingface/inference`');
        }
    }
}
exports.HuggingFaceInference = HuggingFaceInference;
//# sourceMappingURL=core.js.map