import express from 'express'
import a2aController from '../../controllers/a2a'
const router = express.Router()

// Well-known agent card endpoint
router.get('/:workflowId/.well-known/agent-card.json', a2aController.getAgentCard)

// Get agent card by workflow ID
router.get('/:workflowId', a2aController.getAgentCard)

// Save agent card
router.post('/', a2aController.saveAgentCard)

// Get agent response (this might be missing!)
router.post('/:workflowId', a2aController.getAgentResponse)

export default router
