import express from 'express'
import executionController from '../../controllers/executions.js'
import authorizeResource from '../../middlewares/authorizeResource.js'
import { Execution } from '../../database/entities/Execution.js'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp.js'
const router = express.Router()

const getExecutionByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(Execution).findOneBy({ id })
}

// READ
router.get('/', executionController.getAllExecutions)
router.get(
    '/:id',
    authorizeResource((req) => getExecutionByIdFromDB(req.params.id), {
        notFoundMessage: 'Execution not found',
        forbiddenMessage: 'You are not allowed to access this execution'
    }),
    executionController.getExecutionById
)

// PUT
router.put(
    '/:id',
    authorizeResource((req) => getExecutionByIdFromDB(req.params.id), {
        notFoundMessage: 'Execution not found',
        forbiddenMessage: 'You are not allowed to update this execution'
    }),
    executionController.updateExecution
)

// DELETE - single execution or multiple executions
router.delete(
    '/:id',
    authorizeResource((req) => getExecutionByIdFromDB(req.params.id), {
        notFoundMessage: 'Execution not found',
        forbiddenMessage: 'You are not allowed to delete this execution'
    }),
    executionController.deleteExecutions
)
router.delete('/', executionController.deleteExecutions)

export default router
