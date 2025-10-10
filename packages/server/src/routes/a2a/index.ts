import express from 'express'
import a2aController from '../../controllers/a2a'
const router = express.Router()

// CREATE
router.post('/:workflowId', a2aController.getAgentResponse)

// READ
router.get('/:workflowId/.well-known/agent-card.json', a2aController.getAgentCard)
//router.get(['/', '/:taskId'], a2aController.getResponse)

router.post('/', a2aController.saveAgentCard)
export default router
