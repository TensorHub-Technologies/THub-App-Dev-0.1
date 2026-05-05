import { Request, Response, NextFunction } from 'express'
import { InternalTHubError } from '../../errors/internalTHubError'
import datasetService from '../../services/dataset'
import { StatusCodes } from 'http-status-codes'
import { getPageAndLimitParams } from '../../utils/pagination'

const getAllDatasets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = getPageAndLimitParams(req)
        const tenantId = req.user?.id
        if (!tenantId) {
            throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authentication required')
        }

        const apiResponse = await datasetService.getAllDatasets(page, limit, tenantId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getDataset = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.getDataset - id not provided!`)
        }
        const { page, limit } = getPageAndLimitParams(req)
        const tenantId = req.user?.id
        if (!tenantId) {
            throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authentication required')
        }

        const apiResponse = await datasetService.getDataset(req.params.id, page, limit, tenantId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const createDataset = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.createDataset - body not provided!`)
        }
        req.body.tenantId = req.user?.id
        const apiResponse = await datasetService.createDataset(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const updateDataset = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.updateDataset - body not provided!`)
        }
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.updateDataset - id not provided!`)
        }
        const apiResponse = await datasetService.updateDataset(req.params.id, req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const deleteDataset = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.deleteDataset - id not provided!`)
        }
        const tenantId = req.user?.id
        if (!tenantId) {
            throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authentication required')
        }

        const apiResponse = await datasetService.deleteDataset(req.params.id, tenantId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const addDatasetRow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.addDatasetRow - body not provided!`)
        }
        if (!req.body.datasetId) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.addDatasetRow - datasetId not provided!`)
        }
        req.body.tenantId = req.user?.id
        const apiResponse = await datasetService.addDatasetRow(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const updateDatasetRow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.updateDatasetRow - body not provided!`)
        }
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.updateDatasetRow - id not provided!`)
        }
        const apiResponse = await datasetService.updateDatasetRow(req.params.id, req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const deleteDatasetRow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.deleteDatasetRow - id not provided!`)
        }
        const apiResponse = await datasetService.deleteDatasetRow(req.params.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const patchDeleteRows = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ids = req.body.ids ?? []
        const tenantId = req.user?.id
        if (!tenantId) {
            throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authentication required')
        }

        const apiResponse = await datasetService.patchDeleteRows(ids, tenantId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const reorderDatasetRow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: datasetService.reorderDatasetRow - body not provided!`)
        }
        const apiResponse = await datasetService.reorderDatasetRow(req.body.datasetId, req.body.rows)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    getAllDatasets,
    getDataset,
    createDataset,
    updateDataset,
    deleteDataset,
    addDatasetRow,
    updateDatasetRow,
    deleteDatasetRow,
    patchDeleteRows,
    reorderDatasetRow
}
