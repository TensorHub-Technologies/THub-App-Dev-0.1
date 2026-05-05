import { DeleteResult, FindOptionsWhere } from 'typeorm';
import { ChatMessage } from '../../database/entities/ChatMessage';
import { ChatMessageFeedback } from '../../database/entities/ChatMessageFeedback';
import { ChatMessageRatingType, ChatType, IChatMessage } from '../../Interface';
declare function getAllMessages(): Promise<ChatMessage[]>;
declare function getAllMessagesFeedback(): Promise<ChatMessageFeedback[]>;
declare const _default: {
    createChatMessage: (chatMessage: Partial<IChatMessage>) => Promise<ChatMessage>;
    getAllChatMessages: (chatflowId: string, chatTypes: ChatType[] | undefined, sortOrder?: string, chatId?: string, memoryType?: string, sessionId?: string, startDate?: string, endDate?: string, messageId?: string, feedback?: boolean, feedbackTypes?: ChatMessageRatingType[]) => Promise<ChatMessage[]>;
    getAllInternalChatMessages: (chatflowId: string, chatTypes: ChatType[] | undefined, sortOrder?: string, chatId?: string, memoryType?: string, sessionId?: string, startDate?: string, endDate?: string, messageId?: string, feedback?: boolean, feedbackTypes?: ChatMessageRatingType[]) => Promise<ChatMessage[]>;
    removeAllChatMessages: (chatId: string, chatflowid: string, deleteOptions: FindOptionsWhere<ChatMessage>) => Promise<DeleteResult>;
    removeChatMessagesByMessageIds: (chatflowid: string, chatIdMap: Map<string, ChatMessage[]>, messageIds: string[]) => Promise<DeleteResult>;
    abortChatMessage: (chatId: string, chatflowid: string) => Promise<void>;
    getAllMessages: typeof getAllMessages;
    getAllMessagesFeedback: typeof getAllMessagesFeedback;
};
export default _default;
