import client from './client'

const getAllChatflows = (tenantId) => client.get(`/chatflows/${tenantId}`)

const getAllChatflowsWp = (workspaceUid) => client.get(`/chatflows/workspaces/${workspaceUid}`)

const getSpecificChatflow = (chatflowId) => client.get(`/chatflows/getChatflowById/${chatflowId}`)

const getSpecificChatflowFromPublicEndpoint = (id) => client.get(`/public-chatflows/${id}`)

const createNewChatflow = (body) => client.post(`/chatflows`, body)

const getAllAgentflows = () => client.get('/chatflows?type=MULTIAGENT')

const importChatflows = (body) => client.post(`/chatflows/importchatflows`, body)

const updateChatflow = (id, body) => client.put(`/chatflows/${id}`, body)

const deleteChatflow = (id) => client.delete(`/chatflows/${id}`)

const getIsChatflowStreaming = (id) => client.get(`/chatflows-streaming/${id}`)

const getAllowChatflowUploads = (id) => client.get(`/chatflows-uploads/${id}`)

export default {
    getAllChatflows,
    getAllChatflowsWp,
    getAllAgentflows,
    getSpecificChatflow,
    getSpecificChatflowFromPublicEndpoint,
    createNewChatflow,
    importChatflows,
    updateChatflow,
    deleteChatflow,
    getIsChatflowStreaming,
    getAllowChatflowUploads
}
