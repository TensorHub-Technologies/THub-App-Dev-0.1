import express from 'express'
import leadsController from '../../controllers/leads.js'
const router = express.Router()

// CREATE
router.post('/', leadsController.createLeadInChatflow)

// READ
router.get(['/', '/:id'], leadsController.getAllLeadsForChatflow)

export default router
