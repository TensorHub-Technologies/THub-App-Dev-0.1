import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { createFileAttachment } from '../../utils/createAttachment.js'
import { InternalFlowiseError } from '../../errors/internalFlowiseError.js'
import { getErrorMessage } from '../../errors/utils.js'

const createAttachment = async (req: Request) => {
    try {
        return await createFileAttachment(req)
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: attachmentService.createAttachment - ${getErrorMessage(error)}`
        )
    }
}

export default {
    createAttachment
}
