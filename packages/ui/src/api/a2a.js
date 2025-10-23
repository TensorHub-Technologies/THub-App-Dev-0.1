import client from './client'

const saveAgentCard = (body) => client.post(`/agent2agent`, body)
const getAgentCardByWorkflowId = (workflowId) => client.get(`/agent2agent/${workflowId}`)

export default {
    saveAgentCard,
    getAgentCardByWorkflowId
}
