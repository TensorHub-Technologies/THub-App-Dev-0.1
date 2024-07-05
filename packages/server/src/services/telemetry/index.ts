// ../services/telemetry.js

import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

const createEvent = async (eventInfo: any) => {
    try {
        const appServer = getRunningExpressApp()
        console.log('App Server:', appServer)
        if (!appServer.telemetry) {
            throw new Error('Telemetry service is not available in appServer')
        }
        await appServer.telemetry.sendTelemetry(eventInfo.name, eventInfo.data)
        console.log('Telemetry event sent successfully')
    } catch (error) {
        console.error('Error in createEvent:', error)
        throw error
    }
}

export default {
    createEvent
}
