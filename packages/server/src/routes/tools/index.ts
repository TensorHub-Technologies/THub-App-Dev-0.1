import express from 'express'
import toolsController from '../../controllers/tools'
import authorizeResource from '../../middlewares/authorizeResource'
import { Tool } from '../../database/entities/Tool'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

const router = express.Router()

const getToolByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(Tool).findOneBy({ id })
}

// CREATE
router.post('/', toolsController.createTool)

// READ
router.get('/', toolsController.getAllTools)
router.get('/:id', toolsController.getAllTools)
router.get(
    '/getToolById/:id',
    authorizeResource((req) => getToolByIdFromDB(req.params.id), {
        notFoundMessage: 'Tool not found',
        forbiddenMessage: 'You are not allowed to access this tool'
    }),
    toolsController.getToolById
)

// UPDATE
router.put(
    '/:id',
    authorizeResource((req) => getToolByIdFromDB(req.params.id), {
        notFoundMessage: 'Tool not found',
        forbiddenMessage: 'You are not allowed to update this tool'
    }),
    toolsController.updateTool
)

// DELETE
router.delete(
    '/:id',
    authorizeResource((req) => getToolByIdFromDB(req.params.id), {
        notFoundMessage: 'Tool not found',
        forbiddenMessage: 'You are not allowed to delete this tool'
    }),
    toolsController.deleteTool
)

export default router
