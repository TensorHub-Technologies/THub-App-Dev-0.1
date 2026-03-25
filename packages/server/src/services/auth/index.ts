import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { User } from '../../database/entities/User'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import axios from 'axios'
import { OAuth2Client } from 'google-auth-library'
import transporter from '../../utils/transporter'

const otpStore = new Map<string, { otp: string; expiresAt: number }>()

const OTP_TTL_MS = 10 * 60 * 1000
const RETRYABLE_DB_ERROR_CODES = new Set([
    'ECONNRESET',
    'PROTOCOL_CONNECTION_LOST',
    'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
    'ETIMEDOUT',
    'EPIPE',
    'ECONNREFUSED'
])
const RETRYABLE_HTTP_ERROR_CODES = new Set(['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EPIPE'])

const isDebugSecretMode = () => process.env.AUTH_DEBUG_EXPOSE_SECRETS === 'true'

const handleAuthError = (error: unknown, context: string): never => {
    if (error instanceof InternalFlowiseError) {
        throw error
    }

    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: authService.${context} - ${message}`)
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getErrorCode = (error: unknown): string | undefined => {
    if (error && typeof error === 'object' && 'code' in error) {
        const code = (error as { code?: unknown }).code
        return typeof code === 'string' ? code : undefined
    }
    return undefined
}

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    return String(error)
}

const isRetryableDbError = (error: unknown) => {
    const code = getErrorCode(error)
    if (code && RETRYABLE_DB_ERROR_CODES.has(code)) return true

    const message = getErrorMessage(error).toLowerCase()
    return message.includes('econnreset') || message.includes('connection lost') || message.includes('read epipe')
}

const isRetryableHttpError = (error: unknown) => {
    const code = getErrorCode(error)
    if (code && RETRYABLE_HTTP_ERROR_CODES.has(code)) return true

    if (axios.isAxiosError(error)) {
        if (!error.response) return true
        return error.response.status >= 500
    }

    return false
}

const withRetry = async <T>(operation: () => Promise<T>, shouldRetry: (error: unknown) => boolean, retries = 1, retryDelayMs = 250) => {
    let lastError: unknown

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await operation()
        } catch (error) {
            lastError = error
            if (attempt >= retries || !shouldRetry(error)) throw error
            await sleep(retryDelayMs * (attempt + 1))
        }
    }

    throw lastError
}

const resolveGoogleOAuthConfig = () => {
    const clientId =
        process.env.GOOGLE_CLIENT_ID ||
        process.env.AUTH_GOOGLE_CLIENT_ID ||
        process.env.AZURE_GOOGLE_CLIENT_ID ||
        process.env.VITE_GOOGLE_CLIENT_ID
    const clientSecret =
        process.env.GOOGLE_CLIENT_SECRET ||
        process.env.AUTH_GOOGLE_CLIENT_SECRET ||
        process.env.AZURE_GOOGLE_CLIENT_SECRET ||
        process.env.VITE_GOOGLE_CLIENT_SECRET

    return { clientId, clientSecret }
}

const sanitizeUser = (user: User) => {
    return {
        uid: user.uid,
        email: user.email,
        name: user.name,
        login_type: user.login_type,
        workspace: user.workspace,
        picture: user.picture,
        phone: user.phone,
        company: user.company,
        department: user.department,
        designation: user.designation
    }
}

// ==========================
// REGISTER
// ==========================
const register = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const email = normalizeEmail(body.email)
        const password = body.password
        const firstName = body.firstName?.trim() || ''
        const lastName = body.lastName?.trim() || ''
        const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0]

        if (!email || !password) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email and password are required')
        }

        const existingUser = await userRepo.findOneBy({ email })
        if (existingUser) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, `Email already registered using ${existingUser.login_type}`)
        }

        const uid = crypto.randomUUID()
        const hash = await bcrypt.hash(password, 10)

        const user = userRepo.create({
            uid,
            email,
            name: fullName,
            phone: body.phone?.trim() || '',
            password_hash: hash,
            login_type: 'email',
            workspace: body.workspace?.trim() || ''
        })

        const savedUser = await userRepo.save(user)

        return {
            message: 'Registration successful',
            userId: savedUser.uid,
            user: sanitizeUser(savedUser)
        }
    } catch (error) {
        handleAuthError(error, 'register')
    }
}

// ==========================
// LOGIN
// ==========================
const login = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const email = normalizeEmail(body.email)
        const password = body.password

        if (!email || !password) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email and password are required')
        }

        const user = await withRetry(() => userRepo.findOneBy({ email }), isRetryableDbError, 1)

        if (!user) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Invalid credentials')
        }

        if (user.login_type !== 'email') {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, `Use ${user.login_type} login`)
        }

        const storedPassword = String(user.password_hash || '').trim()
        if (!storedPassword) {
            throw new InternalFlowiseError(
                StatusCodes.BAD_REQUEST,
                'Password not set for this account. Please use forgot password to set a new password.'
            )
        }

        let match = false
        let needsHashUpgrade = false

        if (storedPassword.startsWith('$2')) {
            match = await bcrypt.compare(password, storedPassword)
        } else {
            // Legacy migration: allow one-time login if plain password was stored, then upgrade to bcrypt.
            match = storedPassword === password
            needsHashUpgrade = match
        }

        if (!match) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Invalid credentials')
        }

        if (needsHashUpgrade) {
            try {
                user.password_hash = await bcrypt.hash(password, 10)
                await withRetry(() => userRepo.save(user), isRetryableDbError, 1)
            } catch (upgradeError) {
                console.error('Password hash upgrade failed:', getErrorMessage(upgradeError))
            }
        }

        return {
            userId: user.uid,
            workspace: user.workspace || '',
            user: sanitizeUser(user)
        }
    } catch (error) {
        handleAuthError(error, 'login')
    }
}

// ==========================
// GOOGLE LOGIN
// ==========================
const googleLogin = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const code = body.code
        if (!code) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Google authorization code is required')
        }
        const { clientId, clientSecret } = resolveGoogleOAuthConfig()
        if (!clientId || !clientSecret) {
            throw new InternalFlowiseError(
                StatusCodes.BAD_REQUEST,
                'Google auth is not configured on the server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in packages/server/.env'
            )
        }

        const params = new URLSearchParams()
        params.append('code', code)
        params.append('client_id', clientId)
        params.append('client_secret', clientSecret)
        params.append('redirect_uri', 'postmessage')
        params.append('grant_type', 'authorization_code')

        let response
        try {
            response = await withRetry(
                () =>
                    axios.post('https://oauth2.googleapis.com/token', params.toString(), {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        timeout: 10000
                    }),
                isRetryableHttpError,
                1
            )
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const googleError = (error.response?.data as { error?: string; error_description?: string } | undefined) || {}
                const status = error.response?.status || StatusCodes.BAD_REQUEST
                const description = googleError.error_description || googleError.error || 'Google token exchange failed'
                throw new InternalFlowiseError(
                    status >= 400 && status < 500 ? status : StatusCodes.BAD_REQUEST,
                    `Google login failed: ${description}`
                )
            }
            throw error
        }

        const idToken: string | undefined = response.data?.id_token
        const accessToken: string | undefined = response.data?.access_token

        if (!idToken) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid Google token response')
        }

        const oauthClient = new OAuth2Client(clientId)
        const ticket = await oauthClient.verifyIdToken({
            idToken,
            audience: clientId
        })

        const payload = ticket.getPayload()
        const email = payload?.email ? normalizeEmail(payload.email) : ''
        const name = payload?.name || ''
        const picture = payload?.picture || ''
        const providerUserId = payload?.sub || crypto.randomUUID()

        if (!email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Google account email is required')
        }

        let user = await withRetry(() => userRepo.findOneBy({ email }), isRetryableDbError, 1)

        if (user && user.login_type !== 'google') {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, `Already registered using ${user.login_type}`)
        }

        if (!user) {
            const createdUser = userRepo.create({
                uid: providerUserId,
                email,
                name,
                picture,
                login_type: 'google',
                access_token: accessToken,
                workspace: body.workspace?.trim() || '',
                phone: ''
            })

            user = await withRetry(() => userRepo.save(createdUser), isRetryableDbError, 1)
            try {
                await transporter.sendMail({
                    to: email,
                    subject: 'Welcome to THub',
                    html: `<p>Hi ${name || 'there'}, welcome to THub.</p>`
                })
            } catch (mailError) {
                console.error('Failed to send Google welcome email:', getErrorMessage(mailError))
            }
        } else {
            const existingUser = user
            existingUser.access_token = accessToken || existingUser.access_token
            existingUser.name = name || existingUser.name
            existingUser.picture = picture || existingUser.picture

            user = await withRetry(() => userRepo.save(existingUser), isRetryableDbError, 1)
        }

        return {
            userId: user.uid,
            workspace: user.workspace || '',
            user: sanitizeUser(user)
        }
    } catch (error) {
        handleAuthError(error, 'googleLogin')
    }
}

// ==========================
// OTP
// ==========================
const sendOtp = async (body: any) => {
    try {
        const email = normalizeEmail(body.email)

        if (!email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required')
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        otpStore.set(email, { otp, expiresAt: Date.now() + OTP_TTL_MS })

        await transporter.sendMail({
            to: email,
            subject: 'THub OTP Verification',
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`
        })

        return {
            message: 'OTP sent successfully',
            ...(isDebugSecretMode() ? { otp } : {})
        }
    } catch (error) {
        handleAuthError(error, 'sendOtp')
    }
}

const verifyOtp = async (body: any) => {
    try {
        const email = normalizeEmail(body.email)
        const otp = String(body.otp || '').trim()

        if (!email || !otp) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email and OTP are required')
        }

        const record = otpStore.get(email)
        if (!record) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'OTP not found. Please request a new OTP')
        }

        if (record.expiresAt < Date.now()) {
            otpStore.delete(email)
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'OTP expired. Please request a new OTP')
        }

        if (record.otp !== otp) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid OTP')
        }

        otpStore.delete(email)
        return { message: 'OTP verified' }
    } catch (error) {
        handleAuthError(error, 'verifyOtp')
    }
}

// ==========================
// USER
// ==========================
const getUserData = async (userId: string) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const user = await userRepo.findOneBy({ uid: userId })

        if (!user) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not found')
        }

        return sanitizeUser(user)
    } catch (error) {
        handleAuthError(error, 'getUserData')
    }
}

const updateUser = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const uid = body.uid

        const user = await userRepo.findOneBy({ uid })
        if (!user) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not found')
        }

        if (typeof body.company === 'string') user.company = body.company
        if (typeof body.department === 'string') user.department = body.department
        if (typeof body.designation === 'string') user.designation = body.designation
        if (typeof body.workspace === 'string') user.workspace = body.workspace
        if (typeof body.picture === 'string') user.picture = body.picture
        if (typeof body.name === 'string') user.name = body.name
        if (typeof body.phone === 'string') user.phone = body.phone

        const savedUser = await userRepo.save(user)
        return {
            message: 'User profile updated successfully',
            user: sanitizeUser(savedUser)
        }
    } catch (error) {
        handleAuthError(error, 'updateUser')
    }
}

// ==========================
// CHECK EMAIL
// ==========================
const checkEmail = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const email = normalizeEmail(body.email)

        if (!email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required')
        }

        const user = await userRepo.findOneBy({ email })
        return {
            exists: !!user,
            login_type: user?.login_type || null
        }
    } catch (error) {
        handleAuthError(error, 'checkEmail')
    }
}

// ==========================
// MICROSOFT LOGIN
// ==========================
const microsoftLogin = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const uid = body.uid
        const email = normalizeEmail(body.email)
        const name = body.name || ''
        const phone = body.phone || ''
        const loginType = body.login_type || 'azure_ad'

        if (!uid || !email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'uid and email are required')
        }

        let user = await withRetry(() => userRepo.findOneBy({ email }), isRetryableDbError, 1)

        if (user && user.login_type !== 'azure_ad' && user.login_type !== 'microsoft') {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, `Already registered using ${user.login_type}`)
        }

        if (!user) {
            user = userRepo.create({
                uid,
                email,
                name,
                phone,
                login_type: loginType,
                workspace: body.workspace?.trim() || ''
            })
            user = await withRetry(() => userRepo.save(user as User), isRetryableDbError, 1)

            try {
                await transporter.sendMail({
                    to: email,
                    subject: 'Welcome to THub',
                    html: `<p>Hi ${name || 'there'}, welcome to THub.</p>`
                })
            } catch (mailError) {
                console.error('Failed to send Microsoft welcome email:', getErrorMessage(mailError))
            }
        } else {
            user.name = name || user.name
            user.phone = phone || user.phone
            if (typeof body.workspace === 'string') {
                user.workspace = body.workspace
            }
            user = await withRetry(() => userRepo.save(user as User), isRetryableDbError, 1)
        }

        return {
            userId: user.uid,
            workspace: user.workspace || '',
            user: sanitizeUser(user)
        }
    } catch (error) {
        handleAuthError(error, 'microsoftLogin')
    }
}

// ==========================
// FORGOT PASSWORD
// ==========================
const forgotPassword = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const email = normalizeEmail(body.email)
        if (!email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required')
        }

        const genericResponse = { message: 'If that email exists, a reset link has been sent.' }
        const user = await userRepo.findOneBy({ email })

        if (!user || user.login_type !== 'email') {
            return genericResponse
        }

        const token = crypto.randomBytes(32).toString('hex')
        user.reset_token = token
        await userRepo.save(user)

        const resetLink = `${process.env.RESET_PASSWORD_URL || 'http://localhost:8080'}/reset-password/${token}`

        await transporter.sendMail({
            to: email,
            subject: 'Reset your THub password',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
        })

        return {
            ...genericResponse,
            ...(isDebugSecretMode() ? { resetToken: token } : {})
        }
    } catch (error) {
        handleAuthError(error, 'forgotPassword')
    }
}

// ==========================
// RESET PASSWORD
// ==========================
const resetPassword = async (token: string, body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const password = String(body.password || '')

        if (!password) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'New password is required')
        }
        if (password.length < 6) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Password must be at least 6 characters')
        }

        const user = await userRepo.findOneBy({ reset_token: token })

        if (!user) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid or expired reset token')
        }

        const hash = await bcrypt.hash(password, 10)
        user.password_hash = hash
        user.reset_token = null as any
        await userRepo.save(user)

        return { message: 'Password has been reset successfully' }
    } catch (error) {
        handleAuthError(error, 'resetPassword')
    }
}

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
