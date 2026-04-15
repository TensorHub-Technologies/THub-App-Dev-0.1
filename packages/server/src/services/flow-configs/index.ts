import { StatusCodes } from 'http-status-codes'
import { findAvailableConfigs } from '../../utils.js'
import { IReactFlowObject } from '../../Interface.js'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp.js'
import chatflowsService from '../chatflows.js'
import { InternalFlowiseError } from '../../errors/internalFlowiseError.js'
import { getErrorMessage } from '../../errors/utils.js'

const getSingleFlowConfig = async (chatflowId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const chatflow = await chatflowsService.getChatflowById(chatflowId)
        if (!chatflow) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Workflow ${chatflowId} not found in the database!`)
        }
        const flowData = chatflow.flowData
        const parsedFlowData: IReactFlowObject = JSON.parse(flowData)
        const nodes = parsedFlowData.nodes
        const dbResponse = findAvailableConfigs(nodes, appServer.nodesPool.componentCredentials)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: flowConfigService.getSingleFlowConfig - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getSingleFlowConfig
}
