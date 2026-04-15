import express from 'express'
import evaluationsController from '../../controllers/evaluations.js'
import authorizeResource from '../../middlewares/authorizeResource.js'
import { Evaluation } from '../../database/entities/Evaluation.js'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp.js'
const router = express.Router()

const getEvaluationByIdFromDB = async (id?: string) => {
    if (!id) return null
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(Evaluation).findOneBy({ id })
}

router.get('/', evaluationsController.getAllEvaluations)
router.post('/', evaluationsController.createEvaluation)
router.get(
    '/:id',
    authorizeResource((req) => getEvaluationByIdFromDB(req.params.id), {
        notFoundMessage: 'Evaluation not found',
        forbiddenMessage: 'You are not allowed to access this evaluation'
    }),
    evaluationsController.getEvaluation
)
router.delete(
    '/:id',
    authorizeResource((req) => getEvaluationByIdFromDB(req.params.id), {
        notFoundMessage: 'Evaluation not found',
        forbiddenMessage: 'You are not allowed to delete this evaluation'
    }),
    evaluationsController.deleteEvaluation
)
router.get(
    '/is-outdated/:id',
    authorizeResource((req) => getEvaluationByIdFromDB(req.params.id), {
        notFoundMessage: 'Evaluation not found',
        forbiddenMessage: 'You are not allowed to access this evaluation'
    }),
    evaluationsController.isOutdated
)
router.post(
    '/run-again/:id',
    authorizeResource((req) => getEvaluationByIdFromDB(req.params.id), {
        notFoundMessage: 'Evaluation not found',
        forbiddenMessage: 'You are not allowed to rerun this evaluation'
    }),
    evaluationsController.runAgain
)
router.get(
    '/versions/:id',
    authorizeResource((req) => getEvaluationByIdFromDB(req.params.id), {
        notFoundMessage: 'Evaluation not found',
        forbiddenMessage: 'You are not allowed to access this evaluation'
    }),
    evaluationsController.getVersions
)
router.patch('/', evaluationsController.patchDeleteEvaluations)
export default router
