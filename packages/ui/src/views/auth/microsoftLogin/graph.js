import { graphConfig } from './config/msalConfig'

export async function callMsGraph(accessToken) {
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${accessToken}`)

    const options = {
        method: 'GET',
        headers: headers
    }

    try {
        const response = await fetch(graphConfig.graphMeEndpoint, options)
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching user data:', error)
        throw error
    }
}
