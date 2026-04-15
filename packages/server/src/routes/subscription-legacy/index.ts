import express from 'express'
import subscriptionController from '../../controllers/subscription.js'

const router = express.Router()

// Backward compatibility for existing UI calls.
router.post('/create-subscription', subscriptionController.createSubscription)
router.post('/validate-subscription', subscriptionController.validateSubscription)
router.post('/activate-free-subscription', subscriptionController.activateFreeSubscription)
router.post('/enterprice-mail', subscriptionController.submitEnterpriseMail)
router.get('/enterprice-mail', subscriptionController.enterpriseMailStatus)
router.post('/enterprise-mail', subscriptionController.submitEnterpriseMail)
router.get('/enterprise-mail', subscriptionController.enterpriseMailStatus)
router.post('/api/subscription/create', subscriptionController.createSubscription)
router.post('/api/subscription/validate', subscriptionController.validateSubscription)
router.post('/api/subscription/activate-free', subscriptionController.activateFreeSubscription)
router.post('/api/subscription/enterprise-mail', subscriptionController.submitEnterpriseMail)
router.get('/api/subscription/enterprise-mail', subscriptionController.enterpriseMailStatus)

export default router
