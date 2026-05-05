import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { utilBuildChatflow } from '../../utils/buildChatflow'
import { InternalTHubError } from '../../errors/internalTHubError'
import { getErrorMessage } from '../../errors/utils'

const buildChatflow = async (fullRequest: Request) => {
    try {
        const dbResponse = await utilBuildChatflow(fullRequest)
        return dbResponse
    } catch (error) {
        throw new InternalTHubError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: predictionsServices.buildChatflow - ${getErrorMessage(error)}`
        )
    }
}

export default {
    buildChatflow
}
