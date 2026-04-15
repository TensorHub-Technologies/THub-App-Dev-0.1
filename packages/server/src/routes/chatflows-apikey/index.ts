import express from 'express'
import chatflowsController from '../../controllers/chatflows.js'

const router = express.Router()

router.get('/:apikey', chatflowsController.getChatflowByApiKey)

export default router
