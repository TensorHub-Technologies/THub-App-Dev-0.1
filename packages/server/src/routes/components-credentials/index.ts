import express from 'express'
import componentsCredentialsController from '../../controllers/components-credentials.js'
const router = express.Router()

// READ
router.get('/', componentsCredentialsController.getAllComponentsCredentials)
router.get(['/', '/:name'], componentsCredentialsController.getComponentByName)

export default router
