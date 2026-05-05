import express from 'express'
import variablesController from '../../controllers/variables'
import authorizeResource from '../../middlewares/authorizeResource'
import { Variable } from '../../database/entities/Variable'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

const router = express.Router()

const getVariableByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(Variable).findOneBy({ id })
}

// CREATE
router.post('/', variablesController.createVariable)

// READ
router.get('/', variablesController.getAllVariables)
router.get('/:id', variablesController.getAllVariables)

// UPDATE
router.put(
    '/:id',
    authorizeResource((req) => getVariableByIdFromDB(req.params.id), {
        notFoundMessage: 'Variable not found',
        forbiddenMessage: 'You are not allowed to update this variable'
    }),
    variablesController.updateVariable
)

// DELETE
router.delete(
    '/:id',
    authorizeResource((req) => getVariableByIdFromDB(req.params.id), {
        notFoundMessage: 'Variable not found',
        forbiddenMessage: 'You are not allowed to delete this variable'
    }),
    variablesController.deleteVariable
)

export default router
