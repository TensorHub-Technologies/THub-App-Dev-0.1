import express from 'express'
import credentialsController from '../../controllers/credentials'
const router = express.Router()

// CREATE
router.post('/', credentialsController.createCredential)

// READ
//router.get('/:id', credentialsController.getAllCredentials)
router.get(['/:tenantId', '/:id'], credentialsController.getAllCredentials)
router.get(['/', '/:id'], credentialsController.getCredentialById)

// UPDATE
router.put(['/', '/:id'], credentialsController.updateCredential)

// DELETE
router.delete(['/', '/:id'], credentialsController.deleteCredentials)

export default router
