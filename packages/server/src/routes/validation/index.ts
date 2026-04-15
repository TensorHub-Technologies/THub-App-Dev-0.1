import express from 'express'
import validationController from '../../controllers/validation.js'
const router = express.Router()

// READ
router.get('/:id', validationController.checkFlowValidation)

export default router
