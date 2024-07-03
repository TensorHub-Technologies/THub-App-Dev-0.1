import client from './client'

const getAllAPIKeys = (tenantId) => client.get(`/apikey/${tenantId}`)

const createNewAPI = (tenantId, body) => client.post(`/apikey?tenantId=${tenantId}`, body)

const updateAPI = (tenantId, id, body) => client.put(`/apikey?id=${id}&tenantId=${tenantId}`, body)

const deleteAPI = (tenantId, id) => client.delete(`/apikey/${tenantId}/${id}`)

export default {
    getAllAPIKeys,
    createNewAPI,
    updateAPI,
    deleteAPI
}
