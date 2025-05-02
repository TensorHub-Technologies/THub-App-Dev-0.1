import client from './client'

const getAllChatflows = (tenantId) => client.get(`/chatflows/${tenantId}`)

const getAllChatflowsWp = (workspaceUid) => client.get(`/chatflows/workspaces/${workspaceUid}`)

const getAllChatflowsPaginated = (tenantId, page = 1, limit = 12) =>
    client.get(`/chatflows/paginated/${tenantId}?page=${page}&limit=${limit}`)

const getAllChatflowsWpPaginated = (workspaceUid, page = 1, limit = 12) =>
    client.get(`/chatflows/wp/paginated/${workspaceUid}?page=${page}&limit=${limit}`)

const getSpecificChatflow = (chatflowId) => client.get(`/chatflows/getChatflowById/${chatflowId}`)

const getSpecificChatflowFromPublicEndpoint = (id) => client.get(`/public-chatflows/${id}`)

const createNewChatflow = (body) => client.post(`/chatflows`, body)

const importChatflows = (body) => client.post(`/chatflows/importchatflows`, body)

const updateChatflow = (id, body) => client.put(`/chatflows/${id}`, body)

const deleteChatflow = (id) => client.delete(`/chatflows/${id}`)

const getIsChatflowStreaming = (id) => client.get(`/chatflows-streaming/${id}`)

const getAllowChatflowUploads = (id) => client.get(`/chatflows-uploads/${id}`)

export default {
    getAllChatflows,
    getAllChatflowsWp,
    getSpecificChatflow,
    getSpecificChatflowFromPublicEndpoint,
    createNewChatflow,
    importChatflows,
    updateChatflow,
    deleteChatflow,
    getIsChatflowStreaming,
    getAllowChatflowUploads,
    getAllChatflowsPaginated,
    getAllChatflowsWpPaginated
}
