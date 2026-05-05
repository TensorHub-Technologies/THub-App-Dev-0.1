import client from './client'

//evaluation
const getAllEvaluations = (params) => client.get('/evaluations', { params })
const getIsOutdated = (id, params) => client.get(`/evaluations/is-outdated/${id}`, { params })
const getEvaluation = (id, params) => client.get(`/evaluations/${id}`, { params })
const createEvaluation = (body) => client.post(`/evaluations`, body)
const deleteEvaluation = (id, params) => client.delete(`/evaluations/${id}`, { params })
const runAgain = (id, params) => client.post(`/evaluations/run-again/${id}`, undefined, { params })
const getVersions = (id, params) => client.get(`/evaluations/versions/${id}`, { params })
const deleteEvaluations = (ids, isDeleteAllVersion, tenantId) => client.patch(`/evaluations`, { ids, isDeleteAllVersion, tenantId })

export default {
    createEvaluation,
    deleteEvaluation,
    getAllEvaluations,
    getEvaluation,
    getIsOutdated,
    runAgain,
    getVersions,
    deleteEvaluations
}
