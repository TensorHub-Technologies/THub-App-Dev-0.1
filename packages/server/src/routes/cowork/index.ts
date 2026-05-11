import express from 'express'
import coworkController from '../../controllers/cowork'
import humanInputController from '../../controllers/cowork/humanInput'
import promptsController from '../../controllers/cowork/prompts'
import skillsController from '../../controllers/cowork/skills'

const router = express.Router()

router.get('/models', coworkController.getModelProfiles)
router.put('/models/:id', coworkController.updateModelProfileById)

router.get('/prompts', promptsController.listPrompts)
router.get('/prompts/:id', promptsController.getPrompt)
router.post('/prompts', promptsController.createPrompt)
router.put('/prompts/:id', promptsController.updatePrompt)
router.delete('/prompts/:id', promptsController.deletePrompt)

router.get('/skills/marketplace', skillsController.getMarketplace)
router.put('/skills/:id', skillsController.updateSkill)
router.delete('/skills/:id', skillsController.deleteSkill)
router.post('/skills/:id/clone', skillsController.cloneSkill)

router.post('/sessions', coworkController.createSession)
router.get('/sessions', coworkController.getSessions)
router.get('/sessions/:id', coworkController.getSessionById)
router.post('/sessions/:id/start', coworkController.startSession)
router.delete('/sessions/:id', coworkController.deleteSession)
router.get('/sessions/:id/stream', coworkController.streamSession)

router.patch('/sessions/:sessionId/tasks/:taskId/retry', coworkController.retryTask)
router.post('/sessions/:sessionId/tasks/:taskId/approve', humanInputController.approveTask)
router.post('/sessions/:sessionId/tasks/:taskId/reject', humanInputController.rejectTask)
router.get('/sessions/:sessionId/pending-approvals', humanInputController.getPendingApprovals)

export default router
