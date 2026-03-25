import client from './client'

// ==========================
// EMAIL AUTH
// ==========================
const register = (body) => client.post('/auth/register', body)

const login = (body) => client.post('/auth/login', body)

// ==========================
// SOCIAL AUTH
// ==========================

// Google login (code based)
const googleLogin = (body) => client.post('/auth/google', body)

// Microsoft / generic OAuth user creation
const microsoftLogin = (body) => client.post('/auth/microsoft', body)

// ==========================
// OTP
// ==========================
const sendOtp = (body) => client.post('/auth/send-otp', body)

const verifyOtp = (body) => client.post('/auth/verify-otp', body)

// ==========================
// EMAIL CHECK
// ==========================
const checkEmail = (body) => client.post('/auth/check-email', body)

// ==========================
// PASSWORD
// ==========================
const forgotPassword = (body) => client.post('/auth/forgot-password', body)

const resetPassword = (token, body) => client.post(`/auth/reset-password/${token}`, body)

// ==========================
// USER DATA
// ==========================
const getUserData = (userId) => client.get(`/auth/userdata?userId=${userId}`)

const updateUser = (body) => client.post('/auth/update-user', body)

// ==========================
// EXPORT
// ==========================
export default {
    register,
    login,
    googleLogin,
    microsoftLogin,
    sendOtp,
    verifyOtp,
    checkEmail,
    forgotPassword,
    resetPassword,
    getUserData,
    updateUser
}
