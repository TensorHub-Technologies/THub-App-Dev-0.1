import client from './client'

const getAllEvaluators = (params) => client.get('/evaluators', { params })

//evaluators
const createEvaluator = (body) => client.post(`/evaluators`, body)
const getEvaluator = (id, params) => client.get(`/evaluators/${id}`, { params })
const updateEvaluator = (id, body) => client.put(`/evaluators/${id}`, body)
const deleteEvaluator = (id, tenantId) => client.delete(`/evaluators/${id}`, { params: { tenantId } })

export default {
    getAllEvaluators,
    createEvaluator,
    getEvaluator,
    updateEvaluator,
    deleteEvaluator
}
