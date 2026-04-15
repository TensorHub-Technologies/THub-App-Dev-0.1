import express from 'express'
import apikeyController from '../../controllers/apikey.js'
const router = express.Router()

// CREATE
router.post('/', apikeyController.createApiKey)
router.post('/import', apikeyController.importKeys)

// READ
router.get('/:tenantId', apikeyController.getAllApiKeys)

// UPDATE
router.put(['/', '/:id'], apikeyController.updateApiKey)

// DELETE
router.delete(['/', '/:id'], apikeyController.deleteApiKey)

export default router
