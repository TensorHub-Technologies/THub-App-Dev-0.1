import client from './client'

const getAllDatasets = (params) => client.get('/datasets', { params })

//dataset
const getDataset = (id, params) => client.get(`/datasets/set/${id}`, { params })
const createDataset = (body) => client.post(`/datasets/set`, body)
const updateDataset = (id, body) => client.put(`/datasets/set/${id}`, body)
const deleteDataset = (id, tenantId) => client.delete(`/datasets/set/${id}`, { params: { tenantId } })

// rows
const createDatasetRow = (body) => client.post(`/datasets/rows`, body)
const updateDatasetRow = (id, body) => client.put(`/datasets/rows/${id}`, body)
const deleteDatasetRow = (id, params) => client.delete(`/datasets/rows/${id}`, { params })
const deleteDatasetItems = (ids, tenantId) => client.patch(`/datasets/rows`, { ids, tenantId })
const reorderDatasetRow = (body) => client.post(`/datasets/reorder`, body)

export default {
    getAllDatasets,
    getDataset,
    createDataset,
    updateDataset,
    deleteDataset,
    createDatasetRow,
    updateDatasetRow,
    deleteDatasetRow,
    deleteDatasetItems,
    reorderDatasetRow
}
