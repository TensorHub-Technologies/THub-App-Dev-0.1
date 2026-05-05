import express from 'express'
import chatflowsController from '../../controllers/chatflows'

const router = express.Router()

router.get('/:apikey', chatflowsController.getChatflowByApiKey)

export default router
