import express from 'express'
import evaluatorsController from '../../controllers/evaluators.js'
import authorizeResource from '../../middlewares/authorizeResource.js'
import { Evaluator } from '../../database/entities/Evaluator.js'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp.js'
const router = express.Router()

const getEvaluatorByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(Evaluator).findOneBy({ id })
}

router.get('/', evaluatorsController.getAllEvaluators)
router.get(
    '/:id',
    authorizeResource((req) => getEvaluatorByIdFromDB(req.params.id), {
        notFoundMessage: 'Evaluator not found',
        forbiddenMessage: 'You are not allowed to access this evaluator'
    }),
    evaluatorsController.getEvaluator
)
router.post('/', evaluatorsController.createEvaluator)
router.put(
    '/:id',
    authorizeResource((req) => getEvaluatorByIdFromDB(req.params.id), {
        notFoundMessage: 'Evaluator not found',
        forbiddenMessage: 'You are not allowed to update this evaluator'
    }),
    evaluatorsController.updateEvaluator
)
router.delete(
    '/:id',
    authorizeResource((req) => getEvaluatorByIdFromDB(req.params.id), {
        notFoundMessage: 'Evaluator not found',
        forbiddenMessage: 'You are not allowed to delete this evaluator'
    }),
    evaluatorsController.deleteEvaluator
)

export default router
