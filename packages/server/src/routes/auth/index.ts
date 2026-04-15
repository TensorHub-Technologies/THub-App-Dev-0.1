import express from 'express'
import authController from '../../controllers/auth.js'
import requireAuth from '../../middlewares/auth.js'

const router = express.Router()

// CREATE (REGISTER / SOCIAL)
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/google', authController.googleLogin)
router.post('/microsoft', authController.microsoftLogin)

// OTP
router.post('/send-otp', authController.sendOtp)
router.post('/verify-otp', authController.verifyOtp)

// EMAIL CHECK
router.post('/check-email', authController.checkEmail)

// PASSWORD
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password/:token', authController.resetPassword)

// WORKSPACE / INVITES
router.post('/invite-user', requireAuth, authController.inviteUser)
router.get('/invite/validate', authController.validateInvite)
router.post('/invite/accept', requireAuth, authController.acceptInvite)
router.get('/workspace-users', requireAuth, authController.getWorkspaceUsers)
router.delete('/workspace-user', requireAuth, authController.deleteWorkspaceUser)
router.patch('/workspace-user/role', requireAuth, authController.updateWorkspaceUserRole)
router.post('/workspace-user/transfer-admin', requireAuth, authController.transferWorkspaceAdmin)
router.get('/superadmin/workspaces', requireAuth, authController.getSuperadminWorkspaces)
router.delete('/superadmin/workspace', requireAuth, authController.deleteSuperadminWorkspace)

// USER
router.get('/me', requireAuth, authController.getCurrentUser)
router.get('/protected', requireAuth, authController.getProtectedExample)
router.get('/userdata', requireAuth, authController.getUserData)
router.post('/update-user', requireAuth, authController.updateUser)

export default router
