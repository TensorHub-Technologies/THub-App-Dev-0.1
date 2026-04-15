import express from 'express'
import chatMessagesController from '../../controllers/chat-messages.js'
const router = express.Router()

// CREATE

// READ
router.get(['/', '/:id'], chatMessagesController.getAllInternalChatMessages)

// UPDATE

// DELETE

export default router
