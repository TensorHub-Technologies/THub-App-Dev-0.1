"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utilGetChatMessage = void 0;
const typeorm_1 = require("typeorm");
const ChatMessage_1 = require("../database/entities/ChatMessage");
const ChatMessageFeedback_1 = require("../database/entities/ChatMessageFeedback");
const getRunningExpressApp_1 = require("../utils/getRunningExpressApp");
const _1 = require(".");
const utilGetChatMessage = async ({ chatflowid, chatTypes, sortOrder = 'ASC', chatId, memoryType, sessionId, startDate, endDate, messageId, feedback, feedbackTypes }) => {
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    if (feedback) {
        const query = await appServer.AppDataSource.getRepository(ChatMessage_1.ChatMessage).createQueryBuilder('chat_message');
        // Force collation on the JOIN
        query
            .leftJoinAndSelect('chat_message.execution', 'execution')
            .leftJoinAndMapOne('chat_message.feedback', ChatMessageFeedback_1.ChatMessageFeedback, 'feedback', 'CAST(feedback.messageId AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci = CAST(chat_message.id AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci')
            .where('chat_message.chatflowid = :chatflowid COLLATE utf8mb4_unicode_ci', { chatflowid });
        // Force collation on all WHERE clauses
        if (chatTypes && chatTypes.length > 0) {
            query.andWhere('chat_message.chatType IN (:...chatTypes)', { chatTypes });
        }
        if (chatId) {
            query.andWhere('CAST(chat_message.chatId AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci = :chatId', { chatId });
        }
        if (memoryType) {
            query.andWhere('chat_message.memoryType = :memoryType', { memoryType });
        }
        if (sessionId) {
            query.andWhere('CAST(chat_message.sessionId AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci = :sessionId', {
                sessionId
            });
        }
        if (startDate) {
            query.andWhere('chat_message.createdDate >= :startDateTime', { startDateTime: startDate ? new Date(startDate) : (0, _1.aMonthAgo)() });
        }
        if (endDate) {
            query.andWhere('chat_message.createdDate <= :endDateTime', { endDateTime: endDate ? new Date(endDate) : new Date() });
        }
        query.orderBy('chat_message.createdDate', sortOrder === 'DESC' ? 'DESC' : 'ASC');
        const messages = (await query.getMany());
        if (feedbackTypes && feedbackTypes.length > 0) {
            const indicesToKeep = new Set();
            messages.forEach((message, index) => {
                if (message.role === 'apiMessage' && message.feedback && feedbackTypes.includes(message.feedback.rating)) {
                    if (index > 0)
                        indicesToKeep.add(index - 1);
                    indicesToKeep.add(index);
                }
            });
            return messages.filter((_, index) => indicesToKeep.has(index));
        }
        return messages;
    }
    // ... rest of your code stays the same
    let createdDateQuery;
    if (startDate || endDate) {
        if (startDate && endDate) {
            createdDateQuery = (0, typeorm_1.Between)(new Date(startDate), new Date(endDate));
        }
        else if (startDate) {
            createdDateQuery = (0, typeorm_1.MoreThanOrEqual)(new Date(startDate));
        }
        else if (endDate) {
            createdDateQuery = (0, typeorm_1.LessThanOrEqual)(new Date(endDate));
        }
    }
    return await appServer.AppDataSource.getRepository(ChatMessage_1.ChatMessage).find({
        where: {
            chatflowid,
            chatType: chatTypes?.length ? (0, typeorm_1.In)(chatTypes) : undefined,
            chatId,
            memoryType: memoryType ?? undefined,
            sessionId: sessionId ?? undefined,
            createdDate: createdDateQuery,
            id: messageId ?? undefined
        },
        relations: {
            execution: true
        },
        order: {
            createdDate: sortOrder === 'DESC' ? 'DESC' : 'ASC'
        }
    });
};
exports.utilGetChatMessage = utilGetChatMessage;
//# sourceMappingURL=getChatMessage.js.map