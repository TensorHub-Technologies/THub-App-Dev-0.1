import client from './client'

const createSession = (body) => client.post('/cowork/sessions', body)
const listSessions = (page = 1, limit = 20) => client.get(`/cowork/sessions?page=${page}&limit=${limit}`)
const getSession = (id) => client.get(`/cowork/sessions/${id}`)
const startSession = (id) => client.post(`/cowork/sessions/${id}/start`)
const cancelSession = (id) => client.delete(`/cowork/sessions/${id}`)
const retryTask = (sid, tid) => client.patch(`/cowork/sessions/${sid}/tasks/${tid}/retry`)
const getArtifacts = (id) => client.get(`/cowork/sessions/${id}/artifacts`)
const listSkills = (params = {}) => client.get('/cowork/skills', { params })
const getMarketplace = (params = {}) => client.get('/cowork/skills/marketplace', { params })
const cloneSkill = (id) => client.post(`/cowork/skills/${id}/clone`)
const listPrompts = () => client.get('/cowork/prompts')
const createPrompt = (body) => client.post('/cowork/prompts', body)
const updatePrompt = (id, body) => client.put(`/cowork/prompts/${id}`, body)
const deletePrompt = (id) => client.delete(`/cowork/prompts/${id}`)
const approveTask = (sid, tid) => client.post(`/cowork/sessions/${sid}/tasks/${tid}/approve`)
const rejectTask = (sid, tid, body) => client.post(`/cowork/sessions/${sid}/tasks/${tid}/reject`, body)
const getPendingApprovals = (sid) => client.get(`/cowork/sessions/${sid}/pending-approvals`)
const getUsageAnalytics = (params = {}) => client.get('/analytics/usage', { params })

export default {
    createSession,
    listSessions,
    getSession,
    startSession,
    cancelSession,
    retryTask,
    getArtifacts,
    listSkills,
    getMarketplace,
    cloneSkill,
    listPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    approveTask,
    rejectTask,
    getPendingApprovals,
    getUsageAnalytics
}
