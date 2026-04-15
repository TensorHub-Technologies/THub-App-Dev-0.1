import { Client } from 'langchainhub'
import { StatusCodes } from 'http-status-codes'
import { parsePrompt } from '../../utils/hub.js'
import { InternalFlowiseError } from '../../errors/internalFlowiseError.js'
import { getErrorMessage } from '../../errors/utils.js'

const createPrompt = async (promptName: string): Promise<any> => {
    try {
        let hub = new Client()
        const prompt = await hub.pull(promptName)
        const templates = parsePrompt(prompt)
        const dbResponse = {
            status: 'OK',
            prompt: promptName,
            templates: templates
        }
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: loadPromptsService.createPrompt - ${getErrorMessage(error)}`
        )
    }
}

export default {
    createPrompt
}
