"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationRunTracerLlama = void 0;
exports.extractText = extractText;
const llamaindex_1 = require("llamaindex");
const EvaluationRunner_1 = require("./EvaluationRunner");
const src_1 = require("../src");
const tiktoken_1 = require("@dqbd/tiktoken");
class EvaluationRunTracerLlama {
    evaluationRunId;
    static cbInit = false;
    static startTimes = new Map();
    static models = new Map();
    static tokenCounts = new Map();
    constructor(id) {
        this.evaluationRunId = id;
        EvaluationRunTracerLlama.constructCallBacks();
    }
    static constructCallBacks = () => {
        if (!EvaluationRunTracerLlama.cbInit) {
            llamaindex_1.Settings.callbackManager.on('llm-start', (event) => {
                const evalID = event.reason.parent?.caller?.evaluationRunId || event.reason.caller?.evaluationRunId;
                if (!evalID)
                    return;
                const model = event.reason?.caller?.model;
                if (model) {
                    EvaluationRunTracerLlama.models.set(evalID, model);
                    try {
                        const encoding = (0, tiktoken_1.encoding_for_model)(model);
                        if (encoding) {
                            const { messages } = event.detail.payload;
                            let tokenCount = messages.reduce((count, message) => {
                                return count + encoding.encode(extractText(message.content)).length;
                            }, 0);
                            EvaluationRunTracerLlama.tokenCounts.set(evalID + '_promptTokens', tokenCount);
                            EvaluationRunTracerLlama.tokenCounts.set(evalID + '_outputTokens', 0);
                        }
                    }
                    catch (e) {
                        // catch the error and continue to work.
                    }
                }
                EvaluationRunTracerLlama.startTimes.set(evalID + '_llm', event.timeStamp);
            });
            llamaindex_1.Settings.callbackManager.on('llm-end', (event) => {
                this.calculateAndSetMetrics(event, 'llm');
            });
            llamaindex_1.Settings.callbackManager.on('llm-stream', (event) => {
                const evalID = event.reason.parent?.caller?.evaluationRunId || event.reason.caller?.evaluationRunId;
                if (!evalID)
                    return;
                const { chunk } = event.detail.payload;
                const { delta } = chunk;
                const model = event.reason?.caller?.model;
                try {
                    const encoding = (0, tiktoken_1.encoding_for_model)(model);
                    if (encoding) {
                        let tokenCount = EvaluationRunTracerLlama.tokenCounts.get(evalID + '_outputTokens') || 0;
                        tokenCount += encoding.encode(extractText(delta)).length;
                        EvaluationRunTracerLlama.tokenCounts.set(evalID + '_outputTokens', tokenCount);
                    }
                }
                catch (e) {
                    // catch the error and continue to work.
                }
            });
            llamaindex_1.Settings.callbackManager.on('retrieve-start', (event) => {
                const evalID = event.reason.parent?.caller?.evaluationRunId || event.reason.caller?.evaluationRunId;
                if (evalID) {
                    EvaluationRunTracerLlama.startTimes.set(evalID + '_retriever', event.timeStamp);
                }
            });
            llamaindex_1.Settings.callbackManager.on('retrieve-end', (event) => {
                this.calculateAndSetMetrics(event, 'retriever');
            });
            llamaindex_1.Settings.callbackManager.on('agent-start', (event) => {
                const evalID = event.reason.parent?.caller?.evaluationRunId || event.reason.caller?.evaluationRunId;
                if (evalID) {
                    EvaluationRunTracerLlama.startTimes.set(evalID + '_agent', event.timeStamp);
                }
            });
            llamaindex_1.Settings.callbackManager.on('agent-end', (event) => {
                this.calculateAndSetMetrics(event, 'agent');
            });
            EvaluationRunTracerLlama.cbInit = true;
        }
    };
    static calculateAndSetMetrics(event, label) {
        const evalID = event.reason.parent?.caller?.evaluationRunId || event.reason.caller?.evaluationRunId;
        if (!evalID)
            return;
        const startTime = EvaluationRunTracerLlama.startTimes.get(evalID + '_' + label);
        let model = event.reason?.caller?.model || event.reason?.caller?.llm?.model || EvaluationRunTracerLlama.models.get(evalID);
        if (event.detail.payload?.response?.message && model) {
            try {
                const encoding = (0, tiktoken_1.encoding_for_model)(model);
                if (encoding) {
                    let tokenCount = EvaluationRunTracerLlama.tokenCounts.get(evalID + '_outputTokens') || 0;
                    tokenCount += encoding.encode(event.detail.payload.response?.message?.content || '').length;
                    EvaluationRunTracerLlama.tokenCounts.set(evalID + '_outputTokens', tokenCount);
                }
            }
            catch (e) {
                // catch the error and continue to work.
            }
        }
        // Anthropic
        if (event.detail?.payload?.response?.raw?.usage) {
            const usage = event.detail.payload.response.raw.usage;
            if (usage.output_tokens) {
                const metric = {
                    completionTokens: usage.output_tokens,
                    promptTokens: usage.input_tokens,
                    model: model,
                    totalTokens: usage.input_tokens + usage.output_tokens
                };
                EvaluationRunner_1.EvaluationRunner.addMetrics(evalID, JSON.stringify(metric));
            }
            else if (usage.completion_tokens) {
                const metric = {
                    completionTokens: usage.completion_tokens,
                    promptTokens: usage.prompt_tokens,
                    model: model,
                    totalTokens: usage.total_tokens
                };
                EvaluationRunner_1.EvaluationRunner.addMetrics(evalID, JSON.stringify(metric));
            }
        }
        else if (event.detail?.payload?.response?.raw['amazon-bedrock-invocationMetrics']) {
            const usage = event.detail?.payload?.response?.raw['amazon-bedrock-invocationMetrics'];
            const metric = {
                completionTokens: usage.outputTokenCount,
                promptTokens: usage.inputTokenCount,
                model: event.detail?.payload?.response?.raw.model,
                totalTokens: usage.inputTokenCount + usage.outputTokenCount
            };
            EvaluationRunner_1.EvaluationRunner.addMetrics(evalID, JSON.stringify(metric));
        }
        else {
            const metric = {
                [label]: (event.timeStamp - startTime).toFixed(2),
                completionTokens: EvaluationRunTracerLlama.tokenCounts.get(evalID + '_outputTokens'),
                promptTokens: EvaluationRunTracerLlama.tokenCounts.get(evalID + '_promptTokens'),
                model: model || EvaluationRunTracerLlama.models.get(evalID) || '',
                totalTokens: (EvaluationRunTracerLlama.tokenCounts.get(evalID + '_outputTokens') || 0) +
                    (EvaluationRunTracerLlama.tokenCounts.get(evalID + '_promptTokens') || 0)
            };
            EvaluationRunner_1.EvaluationRunner.addMetrics(evalID, JSON.stringify(metric));
        }
        //cleanup
        EvaluationRunTracerLlama.startTimes.delete(evalID + '_' + label);
        EvaluationRunTracerLlama.startTimes.delete(evalID + '_outputTokens');
        EvaluationRunTracerLlama.startTimes.delete(evalID + '_promptTokens');
        EvaluationRunTracerLlama.models.delete(evalID);
    }
    static async injectEvaluationMetadata(nodeData, options, callerObj) {
        if (options.evaluationRunId && callerObj) {
            // these are needed for evaluation runs
            options.llamaIndex = true;
            await (0, src_1.additionalCallbacks)(nodeData, options);
            Object.defineProperty(callerObj, 'evaluationRunId', {
                enumerable: true,
                configurable: true,
                writable: true,
                value: options.evaluationRunId
            });
        }
    }
}
exports.EvaluationRunTracerLlama = EvaluationRunTracerLlama;
// from https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/utils.ts
function extractText(message) {
    if (typeof message !== 'string' && !Array.isArray(message)) {
        console.warn('extractText called with non-MessageContent message, this is likely a bug.');
        return `${message}`;
    }
    else if (typeof message !== 'string' && Array.isArray(message)) {
        // message is of type MessageContentDetail[] - retrieve just the text parts and concatenate them
        // so we can pass them to the context generator
        return message
            .filter((c) => c.type === 'text')
            .map((c) => c.text)
            .join('\n\n');
    }
    else {
        return message;
    }
}
//# sourceMappingURL=EvaluationRunTracerLlama.js.map