import express from 'express'
import statsController from '../../controllers/stats.js'

const router = express.Router()

// READ
router.get(['/', '/:id'], statsController.getChatflowStats)

export default router
