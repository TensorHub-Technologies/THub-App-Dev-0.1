import client from './client'

const saveAgentCard = (body) => client.post(`/a2a`, body)

export default {
    saveAgentCard
}
