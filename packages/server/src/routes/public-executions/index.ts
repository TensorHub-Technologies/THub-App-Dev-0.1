import express from 'express'
import executionController from '../../controllers/executions.js'
const router = express.Router()

// CREATE

// READ
router.get(['/', '/:id'], executionController.getPublicExecutionById)

// UPDATE

// DELETE

export default router
