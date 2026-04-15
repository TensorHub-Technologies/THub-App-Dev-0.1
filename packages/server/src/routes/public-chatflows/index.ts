import express from 'express'
import chatflowsController from '../../controllers/chatflows.js'
const router = express.Router()

// CREATE

// READ
router.get(['/', '/:id'], chatflowsController.getSinglePublicChatflow)

// UPDATE

// DELETE

export default router
