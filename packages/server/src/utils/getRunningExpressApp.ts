import * as Server from '../index.js'

export const getRunningExpressApp = function () {
    const runningExpressInstance = Server.getInstance()
    if (typeof runningExpressInstance === 'undefined') {
        throw new Error('Error: getRunningExpressApp failed! Express app instance is not available')
    }

    if (!runningExpressInstance.AppDataSource?.isInitialized) {
        throw new Error('Error: getRunningExpressApp failed! Data source is not initialized')
    }

    return runningExpressInstance
}
