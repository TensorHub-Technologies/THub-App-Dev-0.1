import express from 'express'
import authController from '../../controllers/auth'

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
router.post('/invite-user', authController.inviteUser)
router.get('/invite/validate', authController.validateInvite)
router.post('/invite/accept', authController.acceptInvite)
router.get('/workspace-users', authController.getWorkspaceUsers)
router.delete('/workspace-user', authController.deleteWorkspaceUser)
router.patch('/workspace-user/role', authController.updateWorkspaceUserRole)
router.post('/workspace-user/transfer-admin', authController.transferWorkspaceAdmin)
router.get('/superadmin/workspaces', authController.getSuperadminWorkspaces)
router.delete('/superadmin/workspace', authController.deleteSuperadminWorkspace)

// USER
router.get('/userdata', authController.getUserData)
router.post('/update-user', authController.updateUser)

export default router
