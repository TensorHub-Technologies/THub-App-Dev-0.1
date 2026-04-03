import * as Server from '../index'

export const getRunningExpressApp = function () {
    const runningExpressInstance = Server.getInstance()
    if (typeof runningExpressInstance === 'undefined') {
        throw new Error('Error: getRunningExpressApp failed! Express app instance is not available')
    }

    // Keep auth and other DB-only APIs available even when optional runtime modules
    // (like nodes pool / telemetry) are not initialized in a specific deployment.
    if (!runningExpressInstance.AppDataSource?.isInitialized) {
        throw new Error('Error: getRunningExpressApp failed! Data source is not initialized')
    }

    return runningExpressInstance
}
