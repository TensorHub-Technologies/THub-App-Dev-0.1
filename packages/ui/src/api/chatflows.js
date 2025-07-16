import client from './client'

const getAllChatflows = (tenantId, page = 1, limit = 12) => {
    return client.get(`/chatflows?type=CHATFLOW&tenantId=${tenantId}&page=${page}&limit=${limit}`)
}
const getAllAgentflows = (type, tenantId, page = 1, limit = 12) =>
    client.get(`/chatflows?type=${type}&tenantId=${tenantId}&page=${page}&limit=${limit}`)

const getSpecificChatflow = (id) => client.get(`/chatflows/${id}`)

const getSpecificChatflowFromPublicEndpoint = (id) => client.get(`/public-chatflows/${id}`)

const createNewChatflow = (body) => client.post(`/chatflows`, body)

const importChatflows = (body) => client.post(`/chatflows/importchatflows`, body)

const updateChatflow = (id, body) => client.put(`/chatflows/${id}`, body)

const deleteChatflow = (id) => client.delete(`/chatflows/${id}`)

const getIsChatflowStreaming = (id) => client.get(`/chatflows-streaming/${id}`)

const getAllowChatflowUploads = (id) => client.get(`/chatflows-uploads/${id}`)

const generateAgentflow = (body) => client.post(`/agentflowv2-generator/generate`, body)

export default {
    getAllChatflows,
    getAllAgentflows,
    getSpecificChatflow,
    getSpecificChatflowFromPublicEndpoint,
    createNewChatflow,
    importChatflows,
    updateChatflow,
    deleteChatflow,
    getIsChatflowStreaming,
    getAllowChatflowUploads,
    generateAgentflow
}
