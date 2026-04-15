import express from 'express'
import apikeyController from '../../controllers/apikey.js'
const router = express.Router()

// READ
router.get(['/apikey/', '/apikey/:apikey'], apikeyController.verifyApiKey)

export default router
