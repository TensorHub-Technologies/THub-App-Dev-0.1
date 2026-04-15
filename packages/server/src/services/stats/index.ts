import { StatusCodes } from 'http-status-codes'
import { ChatMessageRatingType, ChatType } from '../../Interface.js'
import { ChatMessage } from '../../database/entities/ChatMessage.js'
import { utilGetChatMessage } from '../../utils/getChatMessage.js'
import { ChatMessageFeedback } from '../../database/entities/ChatMessageFeedback.js'
import { InternalFlowiseError } from '../../errors/internalFlowiseError.js'
import { getErrorMessage } from '../../errors/utils.js'

// get stats for showing in chatflow
const getChatflowStats = async (
    chatflowid: string,
    chatTypes: ChatType[] | undefined,
    startDate?: string,
    endDate?: string,
    messageId?: string,
    feedback?: boolean,
    feedbackTypes?: ChatMessageRatingType[]
): Promise<any> => {
    try {
        const chatmessages = (await utilGetChatMessage({
            chatflowid,
            chatTypes,
            startDate,
            endDate,
            messageId,
            feedback,
            feedbackTypes
        })) as Array<ChatMessage & { feedback?: ChatMessageFeedback }>
        const totalMessages = chatmessages.length
        const totalFeedback = chatmessages.filter((message) => message?.feedback).length
        const positiveFeedback = chatmessages.filter((message) => message?.feedback?.rating === 'THUMBS_UP').length
        const dbResponse = {
            totalMessages,
            totalFeedback,
            positiveFeedback
        }

        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: statsService.getChatflowStats - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getChatflowStats
}
