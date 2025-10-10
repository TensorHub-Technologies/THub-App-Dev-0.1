import client from './client'

const saveAgentCard = (body) => client.post(`/agent2agent`, body)

export default {
    saveAgentCard
}
