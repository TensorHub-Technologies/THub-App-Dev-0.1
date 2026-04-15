import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { utilBuildChatflow } from '../../utils/buildChatflow.js'
import { InternalFlowiseError } from '../../errors/internalFlowiseError.js'
import { getErrorMessage } from '../../errors/utils.js'

const buildChatflow = async (fullRequest: Request) => {
    try {
        const dbResponse = await utilBuildChatflow(fullRequest)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: predictionsServices.buildChatflow - ${getErrorMessage(error)}`
        )
    }
}

export default {
    buildChatflow
}
