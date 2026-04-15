import express from 'express'
import subscriptionController from '../../controllers/subscription.js'

const router = express.Router()

router.post('/create', subscriptionController.createSubscription)
router.post('/validate', subscriptionController.validateSubscription)
router.post('/activate-free', subscriptionController.activateFreeSubscription)
router.post('/enterprise-mail', subscriptionController.submitEnterpriseMail)
router.get('/enterprise-mail', subscriptionController.enterpriseMailStatus)

export default router
