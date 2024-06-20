import { StatusCodes } from 'http-status-codes'
import { addAPIKey, deleteAPIKey, getAPIKeys, updateAPIKey } from '../../utils/apiKey'
import { addChatflowsCount } from '../../utils/addChatflowsCount'
import { getApiKey } from '../../utils/apiKey'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'

const getAllApiKeys = async (tenantId: string) => {
    try {
        const keys = await getAPIKeys(tenantId)
        const dbResponse = await addChatflowsCount(keys)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: apikeyService.getAllApiKeys - ${getErrorMessage(error)}`)
    }
}

const createApiKey = async (keyName: string, tenantId: any) => {
    try {
        const keys = await addAPIKey(keyName, tenantId)
        const dbResponse = await addChatflowsCount(keys)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: apikeyService.createApiKey - ${getErrorMessage(error)}`)
    }
}

// Update api key
const updateApiKey = async (id: any, keyName: string, tenantId: any) => {
    try {
        const keys = await updateAPIKey(id, keyName, tenantId)
        const dbResponse = await addChatflowsCount(keys)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: apikeyService.updateApiKey - ${getErrorMessage(error)}`)
    }
}

const deleteApiKey = async (id: any, tenantId: any) => {
    try {
        const keys = await deleteAPIKey(id, tenantId)
        const dbResponse = await addChatflowsCount(keys)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: apikeyService.deleteApiKey - ${getErrorMessage(error)}`)
    }
}

const verifyApiKey = async (paramApiKey: string, tenantId: string): Promise<string> => {
    console.log('server/src/apikey/index.ts/verifyApiKey tenantId: ', tenantId)
    console.log('server/src/apikey/index.ts/verifyApiKey paramApiKey: ', paramApiKey)
    try {
        const apiKey = await getApiKey(paramApiKey, tenantId)
        if (!apiKey) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, `Unauthorized`)
        }
        const dbResponse = 'OK'
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFlowiseError && error.statusCode === StatusCodes.UNAUTHORIZED) {
            throw error
        } else {
            throw new InternalFlowiseError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: apikeyService.verifyApiKey - ${getErrorMessage(error)}`
            )
        }
    }
}

export default {
    createApiKey,
    deleteApiKey,
    getAllApiKeys,
    updateApiKey,
    verifyApiKey
}
