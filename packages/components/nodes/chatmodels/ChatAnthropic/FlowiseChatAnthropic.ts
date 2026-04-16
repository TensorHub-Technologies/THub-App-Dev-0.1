import { AnthropicInput, ChatAnthropic as LangchainChatAnthropic } from '@langchain/anthropic'
import { type BaseChatModelParams } from '@langchain/core/language_models/chat_models'
import { IVisionChatModal, IMultiModalOption } from '../../../src/index.js'

const DEFAULT_IMAGE_MODEL = 'claude-3-5-haiku-latest'
const DEFAULT_IMAGE_MAX_TOKEN = 2048

export class ChatAnthropic extends LangchainChatAnthropic implements IVisionChatModal {
    configuredModel: string
    configuredMaxToken: number
    multiModalOption: IMultiModalOption
    id: string

    constructor(id: string, fields?: Partial<AnthropicInput> & BaseChatModelParams) {
        // @ts-ignore
        super(fields ?? {})
        this.id = id
        this.configuredModel = fields?.modelName || ''
        this.configuredMaxToken = fields?.maxTokens ?? 2048
    }

    /**
     * Override invocationParams to sanitize Langchain's sentinel default values (-1)
     * for topP and topK which newer Anthropic models reject.
     */
    invocationParams(options?: any): any {
        const params = super.invocationParams(options)

        // Anthropic API rejects top_p: -1 and top_k: -1 (Langchain sentinel defaults).
        // Strip them out so Anthropic uses its own defaults.
        if (params.top_p === -1) delete params.top_p
        if (params.top_k === -1) delete params.top_k

        return params
    }

    revertToOriginalModel(): void {
        this.modelName = this.configuredModel
        this.maxTokens = this.configuredMaxToken
    }

    setMultiModalOption(multiModalOption: IMultiModalOption): void {
        this.multiModalOption = multiModalOption
    }

    setVisionModel(): void {
        if (!this.modelName.startsWith('claude-3')) {
            this.modelName = DEFAULT_IMAGE_MODEL
            this.maxTokens = this.configuredMaxToken ? this.configuredMaxToken : DEFAULT_IMAGE_MAX_TOKEN
        }
    }
}
