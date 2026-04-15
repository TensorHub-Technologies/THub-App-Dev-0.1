import { StatusCodes } from 'http-status-codes'
import { findAvailableConfigs } from '../../utils.js'
import { IReactFlowNode } from '../../Interface.js'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp.js'
import { InternalFlowiseError } from '../../errors/internalFlowiseError.js'
import { getErrorMessage } from '../../errors/utils.js'

const getAllNodeConfigs = async (requestBody: any) => {
    try {
        const appServer = getRunningExpressApp()
        const nodes = [{ data: requestBody }] as IReactFlowNode[]
        const dbResponse = findAvailableConfigs(nodes, appServer.nodesPool.componentCredentials)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: nodeConfigsService.getAllNodeConfigs - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getAllNodeConfigs
}
