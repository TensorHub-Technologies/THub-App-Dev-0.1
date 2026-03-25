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

// USER
router.get('/userdata', authController.getUserData)
router.post('/update-user', authController.updateUser)

export default router
