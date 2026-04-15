import express from 'express'
import predictionsController from '../../controllers/predictions.js'
import { getMulterStorage } from '../../utils.js'

const router = express.Router()

// CREATE
router.post(
    ['/', '/:id'],
    getMulterStorage().array('files'),
    predictionsController.getRateLimiterMiddleware,
    predictionsController.createPrediction
)

export default router
