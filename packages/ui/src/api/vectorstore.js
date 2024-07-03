import client from './client'

const upsertVectorStore = (tenantId, id, input) => client.post(`/vector/internal-upsert?id=${id}&tenantId=${tenantId}`, input)
const getUpsertHistory = (tenantId, id, params = {}) =>
    client.get(`/upsert-history?id=${id}&tenantId=${tenantId}`, { params: { order: 'DESC', ...params } })
const deleteUpsertHistory = (ids) => client.patch(`/upsert-history`, { ids })

export default {
    getUpsertHistory,
    upsertVectorStore,
    deleteUpsertHistory
}
