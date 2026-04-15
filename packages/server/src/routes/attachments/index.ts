import express from 'express'
import attachmentsController from '../../controllers/attachments.js'
import { getMulterStorage } from '../../utils.js'

const router = express.Router()

// CREATE
router.post('/:chatflowId/:chatId', getMulterStorage().array('files'), attachmentsController.createAttachment)

export default router
