import express from 'express'
import versionsController from '../../controllers/versions.js'
const router = express.Router()

// READ
router.get('/', versionsController.getVersion)

export default router
