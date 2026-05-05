import { Request, Response, NextFunction } from 'express'
import assistantsService from '../../services/assistants'
import { InternalTHubError } from '../../errors/internalTHubError'
import { StatusCodes } from 'http-status-codes'
import { AssistantType } from '../../Interface'

const createAssistant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.createAssistant - body not provided!`)
        }
        const apiResponse = await assistantsService.createAssistant(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const deleteAssistant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.deleteAssistant - id not provided!`)
        }
        const apiResponse = await assistantsService.deleteAssistant(req.params.id, req.query.isDeleteBoth)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getAllAssistants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = req.query.type as AssistantType
        const tenantId = req.user?.id
        if (!tenantId) {
            throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authentication required')
        }
        if (req.params.id && req.params.id !== tenantId) {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'Forbidden')
        }
        const apiResponse = await assistantsService.getAllAssistants(type, tenantId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getAssistantById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.getAssistantById - id not provided!`)
        }
        const apiResponse = await assistantsService.getAssistantById(req.params.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const updateAssistant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.updateAssistant - id not provided!`)
        }
        if (!req.body) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: assistantsController.updateAssistant - body not provided!`)
        }
        const apiResponse = await assistantsService.updateAssistant(req.params.id, req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getChatModels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiResponse = await assistantsService.getChatModels()
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getDocumentStores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.user?.id
        if (!tenantId) {
            throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authentication required')
        }
        const apiResponse = await assistantsService.getDocumentStores(tenantId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getTools = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiResponse = await assistantsService.getTools()
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const generateAssistantInstruction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: assistantsController.generateAssistantInstruction - body not provided!`
            )
        }
        const apiResponse = await assistantsService.generateAssistantInstruction(req.body.task, req.body.selectedChatModel)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    createAssistant,
    deleteAssistant,
    getAllAssistants,
    getAssistantById,
    updateAssistant,
    getChatModels,
    getDocumentStores,
    getTools,
    generateAssistantInstruction
}
