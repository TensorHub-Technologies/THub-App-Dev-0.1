import { ChatGoogleGenerativeAI as LangchainChatGoogleGenerativeAI, GoogleGenerativeAIChatInput } from '@langchain/google-genai';
import { IMultiModalOption, IVisionChatModal } from '../../../src';
export declare class ChatGoogleGenerativeAI extends LangchainChatGoogleGenerativeAI implements IVisionChatModal {
    configuredModel: string;
    configuredMaxToken?: number;
    multiModalOption: IMultiModalOption;
    id: string;
    constructor(id: string, fields: GoogleGenerativeAIChatInput);
    revertToOriginalModel(): void;
    setMultiModalOption(multiModalOption: IMultiModalOption): void;
    setVisionModel(): void;
}
