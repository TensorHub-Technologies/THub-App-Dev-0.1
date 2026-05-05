import { AnthropicInput, ChatAnthropic as LangchainChatAnthropic } from '@langchain/anthropic';
import { type BaseChatModelParams } from '@langchain/core/language_models/chat_models';
import { IVisionChatModal, IMultiModalOption } from '../../../src';
export declare class ChatAnthropic extends LangchainChatAnthropic implements IVisionChatModal {
    configuredModel: string;
    configuredMaxToken: number;
    multiModalOption: IMultiModalOption;
    id: string;
    constructor(id: string, fields?: Partial<AnthropicInput> & BaseChatModelParams);
    /**
     * Override invocationParams to sanitize Langchain's sentinel default values (-1)
     * for topP and topK which newer Anthropic models reject.
     */
    invocationParams(options?: any): any;
    revertToOriginalModel(): void;
    setMultiModalOption(multiModalOption: IMultiModalOption): void;
    setVisionModel(): void;
}
