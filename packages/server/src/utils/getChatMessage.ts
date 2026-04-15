import { MoreThanOrEqual, LessThanOrEqual, Between, In } from 'typeorm'
import { ChatMessageRatingType, ChatType } from '../Interface.js'
import { ChatMessage } from '../database/entities/ChatMessage.js'
import { ChatMessageFeedback } from '../database/entities/ChatMessageFeedback.js'
import { getRunningExpressApp } from '../utils/getRunningExpressApp.js'
import { aMonthAgo } from '.'

/**
 * Method that get chat messages.
 * @param {string} chatflowid
 * @param {ChatType[]} chatTypes
 * @param {string} sortOrder
 * @param {string} chatId
 * @param {string} memoryType
 * @param {string} sessionId
 * @param {string} startDate
 * @param {string} endDate
 * @param {boolean} feedback
 * @param {ChatMessageRatingType[]} feedbackTypes
 */
interface GetChatMessageParams {
    chatflowid: string
    chatTypes?: ChatType[]
    sortOrder?: string
    chatId?: string
    memoryType?: string
    sessionId?: string
    startDate?: string
    endDate?: string
    messageId?: string
    feedback?: boolean
    feedbackTypes?: ChatMessageRatingType[]
}

export const utilGetChatMessage = async ({
    chatflowid,
    chatTypes,
    sortOrder = 'ASC',
    chatId,
    memoryType,
    sessionId,
    startDate,
    endDate,
    messageId,
    feedback,
    feedbackTypes
}: GetChatMessageParams): Promise<ChatMessage[]> => {
    const appServer = getRunningExpressApp()

    if (feedback) {
        const query = await appServer.AppDataSource.getRepository(ChatMessage).createQueryBuilder('chat_message')

        // Force collation on the JOIN
        query
            .leftJoinAndSelect('chat_message.execution', 'execution')
            .leftJoinAndMapOne(
                'chat_message.feedback',
                ChatMessageFeedback,
                'feedback',
                'CAST(feedback.messageId AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci = CAST(chat_message.id AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci'
            )
            .where('chat_message.chatflowid = :chatflowid COLLATE utf8mb4_unicode_ci', { chatflowid })

        // Force collation on all WHERE clauses
        if (chatTypes && chatTypes.length > 0) {
            query.andWhere('chat_message.chatType IN (:...chatTypes)', { chatTypes })
        }
        if (chatId) {
            query.andWhere('CAST(chat_message.chatId AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci = :chatId', { chatId })
        }
        if (memoryType) {
            query.andWhere('chat_message.memoryType = :memoryType', { memoryType })
        }
        if (sessionId) {
            query.andWhere('CAST(chat_message.sessionId AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci = :sessionId', {
                sessionId
            })
        }

        if (startDate) {
            query.andWhere('chat_message.createdDate >= :startDateTime', { startDateTime: startDate ? new Date(startDate) : aMonthAgo() })
        }
        if (endDate) {
            query.andWhere('chat_message.createdDate <= :endDateTime', { endDateTime: endDate ? new Date(endDate) : new Date() })
        }

        query.orderBy('chat_message.createdDate', sortOrder === 'DESC' ? 'DESC' : 'ASC')

        const messages = (await query.getMany()) as Array<ChatMessage & { feedback: ChatMessageFeedback }>

        if (feedbackTypes && feedbackTypes.length > 0) {
            const indicesToKeep = new Set()

            messages.forEach((message, index) => {
                if (message.role === 'apiMessage' && message.feedback && feedbackTypes.includes(message.feedback.rating)) {
                    if (index > 0) indicesToKeep.add(index - 1)
                    indicesToKeep.add(index)
                }
            })

            return messages.filter((_, index) => indicesToKeep.has(index))
        }

        return messages
    }

    // ... rest of your code stays the same
    let createdDateQuery
    if (startDate || endDate) {
        if (startDate && endDate) {
            createdDateQuery = Between(new Date(startDate), new Date(endDate))
        } else if (startDate) {
            createdDateQuery = MoreThanOrEqual(new Date(startDate))
        } else if (endDate) {
            createdDateQuery = LessThanOrEqual(new Date(endDate))
        }
    }

    return await appServer.AppDataSource.getRepository(ChatMessage).find({
        where: {
            chatflowid,
            chatType: chatTypes?.length ? In(chatTypes) : undefined,
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
    })
}
