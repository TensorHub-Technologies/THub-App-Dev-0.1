import express from 'express'
import internalPredictionsController from '../../controllers/internal-predictions.js'
const router = express.Router()

// CREATE
router.post(['/', '/:id'], internalPredictionsController.createInternalPrediction)

export default router
