import express from 'express'
import coworkController from '../../controllers/cowork'
import humanInputController from '../../controllers/cowork/humanInput'

const router = express.Router()

router.get('/models', coworkController.getModelProfiles)
router.put('/models/:id', coworkController.updateModelProfileById)
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
