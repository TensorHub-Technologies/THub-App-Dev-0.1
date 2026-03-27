import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { User } from '../../database/entities/User'
import { Workspace } from '../../database/entities/Workspace'
import { WorkspaceUser } from '../../database/entities/WorkspaceUser'
import { WorkspaceInvite } from '../../database/entities/WorkspaceInvite'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import axios from 'axios'
import { OAuth2Client } from 'google-auth-library'
import transporter from '../../utils/transporter'

const otpStore = new Map<string, { otp: string; expiresAt: number }>()

const OTP_TTL_MS = 10 * 60 * 1000
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000
const INVITE_TTL_MS = 24 * 60 * 60 * 1000
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
const normalizeWorkspaceName = (workspace: string) => workspace.trim().toLowerCase()
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex')

const buildUiBaseUrl = () => {
    return (
        process.env.RESET_PASSWORD_URL ||
        process.env.INVITE_BASE_URL ||
        process.env.APP_URL ||
        process.env.UI_BASE_URL ||
        process.env.VITE_UI_BASE_URL ||
        'http://localhost:3000'
    ).replace(/\/+$/, '')
}

const buildResetPasswordLink = (token: string) => `${buildUiBaseUrl()}/reset-password/${token}`
const buildInviteLink = (token: string) => `${buildUiBaseUrl()}/accept-invite?token=${token}`

const ensureMailDeliveryConfigured = (action: string) => {
    if (!transporter.isConfigured()) {
        throw new InternalFlowiseError(
            StatusCodes.SERVICE_UNAVAILABLE,
            `Unable to ${action} because email delivery is not configured on the server`
        )
    }
}

const ensureAllowedWorkspaceRole = (role: string) => {
    if (!['admin', 'member'].includes(role)) {
        throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid workspace role')
    }
}

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
        designation: user.designation,
        role: user.role,
        workspaceUid: user.workspaceUid,
        profile_completed: Boolean(user.profile_completed),
        profile_skipped: Boolean(user.profile_skipped)
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
            workspace: body.workspace?.trim() || '',
            role: null as any,
            workspaceUid: null as any,
            profile_completed: false,
            profile_skipped: false
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
                phone: '',
                profile_completed: false,
                profile_skipped: false
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

        ensureMailDeliveryConfigured('send OTP email')

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
        const workspaceRepo = appServer.AppDataSource.getRepository(Workspace)
        const workspaceUserRepo = appServer.AppDataSource.getRepository(WorkspaceUser)

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

        const requestedWorkspace = typeof body.workspace === 'string' ? normalizeWorkspaceName(body.workspace) : ''

        if (requestedWorkspace) {
            if (user.workspaceUid && normalizeWorkspaceName(user.workspace || '') !== requestedWorkspace) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace cannot be changed from profile update')
            }

            if (!user.workspaceUid) {
                const existingWorkspace = await workspaceRepo.findOneBy({ name: requestedWorkspace })

                if (existingWorkspace) {
                    throw new InternalFlowiseError(StatusCodes.CONFLICT, 'Workspace already exists')
                }

                const workspace = workspaceRepo.create({
                    id: crypto.randomUUID(),
                    name: requestedWorkspace,
                    created_by: uid,
                    created_at: new Date()
                })

                await workspaceRepo.save(workspace)

                const adminMembership = workspaceUserRepo.create({
                    workspace_id: workspace.id,
                    user_id: uid,
                    role: 'admin'
                })

                await workspaceUserRepo.save(adminMembership)

                user.workspace = workspace.name
                user.workspaceUid = workspace.id
                user.role = 'admin'
            }
        }

        if (typeof body.profile_skipped === 'boolean') {
            user.profile_skipped = body.profile_skipped
        }

        user.profile_completed = true
        user.profile_skipped = false

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
                workspace: body.workspace?.trim() || '',
                profile_completed: false,
                profile_skipped: false
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

        ensureMailDeliveryConfigured('send password reset email')

        const token = crypto.randomBytes(32).toString('hex')
        user.reset_token = hashToken(token)
        user.reset_token_expires_at = new Date(Date.now() + RESET_TOKEN_TTL_MS)
        await userRepo.save(user)

        const resetLink = buildResetPasswordLink(token)

        await transporter.sendMail({
            to: email,
            subject: 'Reset your THub password',
            text: `Reset your THub password using this link: ${resetLink}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #111827;">
                    <p>Hi ${user.name || 'there'},</p>
                    <p>We received a request to reset your THub password.</p>
                    <p><a href="${resetLink}">Reset your password</a></p>
                    <p>This link will expire in 1 hour.</p>
                </div>
            `
        })

        return {
            ...genericResponse,
            ...(isDebugSecretMode() ? { resetToken: token, resetLink } : {})
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

        const hashedToken = hashToken(token)
        const user = await userRepo.findOneBy({ reset_token: hashedToken })

        if (!user) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid or expired reset token')
        }

        if (!user.reset_token_expires_at || new Date(user.reset_token_expires_at).getTime() < Date.now()) {
            user.reset_token = null as any
            user.reset_token_expires_at = null as any
            await userRepo.save(user)
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid or expired reset token')
        }

        const hash = await bcrypt.hash(password, 10)
        user.password_hash = hash
        user.reset_token = null as any
        user.reset_token_expires_at = null as any
        await userRepo.save(user)

        return { message: 'Password has been reset successfully' }
    } catch (error) {
        handleAuthError(error, 'resetPassword')
    }
}

const inviteUser = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const workspaceRepo = appServer.AppDataSource.getRepository(Workspace)
        const workspaceUserRepo = appServer.AppDataSource.getRepository(WorkspaceUser)
        const workspaceInviteRepo = appServer.AppDataSource.getRepository(WorkspaceInvite)

        const email = normalizeEmail(body.email)
        const workspaceName = normalizeWorkspaceName(body.workspace || '')
        const invitedBy = String(body.invitedBy || '').trim()
        const role = String(body.role || 'member')
            .trim()
            .toLowerCase()

        if (!email || !workspaceName || !invitedBy) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Missing required fields')
        }

        ensureAllowedWorkspaceRole(role)
        ensureMailDeliveryConfigured('send workspace invitation email')

        const workspace = await workspaceRepo.findOneBy({ name: workspaceName })
        if (!workspace) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Workspace not found')
        }

        const inviterMembership = await workspaceUserRepo.findOneBy({
            workspace_id: workspace.id,
            user_id: invitedBy
        })
        const inviter = await userRepo.findOneBy({ uid: invitedBy })

        if (inviter?.role !== 'superadmin' && inviterMembership?.role !== 'admin') {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Only admin can invite users')
        }

        const existingInvite = await workspaceInviteRepo.findOneBy({
            email,
            workspace_id: workspace.id,
            used: false
        })
        if (existingInvite && new Date(existingInvite.expires_at).getTime() > Date.now()) {
            throw new InternalFlowiseError(StatusCodes.CONFLICT, 'Invite already sent')
        }

        const existingUser = await userRepo.findOneBy({ email })
        if (existingUser?.workspaceUid === workspace.id) {
            throw new InternalFlowiseError(StatusCodes.CONFLICT, 'User already in workspace')
        }

        const token = crypto.randomBytes(32).toString('hex')
        const invite = workspaceInviteRepo.create({
            id: crypto.randomUUID(),
            email,
            workspace_id: workspace.id,
            workspace_name: workspace.name,
            role,
            token,
            invited_by: invitedBy,
            expires_at: new Date(Date.now() + INVITE_TTL_MS),
            used: false
        })

        await workspaceInviteRepo.save(invite)

        try {
            await transporter.sendMail({
                to: email,
                subject: `You're invited to join ${workspace.name} on THub`,
                text: `Accept your THub invite here: ${buildInviteLink(token)}`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #111827;">
                        <p>You have been invited to join <strong>${workspace.name}</strong> on THub.</p>
                        <p>Role: <strong>${role}</strong></p>
                        <p><a href="${buildInviteLink(token)}">Accept invite</a></p>
                        <p>This invite will expire in 24 hours.</p>
                    </div>
                `
            })
        } catch (mailError) {
            await workspaceInviteRepo.delete({ id: invite.id })
            throw mailError
        }

        return { message: 'Invite sent successfully' }
    } catch (error) {
        handleAuthError(error, 'inviteUser')
    }
}

const validateInvite = async (token: string) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const workspaceInviteRepo = appServer.AppDataSource.getRepository(WorkspaceInvite)

        const invite = await workspaceInviteRepo.findOneBy({ token: String(token || '').trim() })
        if (!invite) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Invite not found')
        }

        if (invite.used || new Date(invite.expires_at).getTime() < Date.now()) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invite is invalid or expired')
        }

        const inviter = await userRepo.findOneBy({ uid: invite.invited_by })

        return {
            valid: true,
            email: invite.email,
            workspace: invite.workspace_name,
            role: invite.role,
            invitedBy: inviter?.name || inviter?.email || 'Admin'
        }
    } catch (error) {
        handleAuthError(error, 'validateInvite')
    }
}

const acceptInvite = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const workspaceUserRepo = appServer.AppDataSource.getRepository(WorkspaceUser)
        const workspaceInviteRepo = appServer.AppDataSource.getRepository(WorkspaceInvite)

        const token = String(body.token || '').trim()
        const uid = String(body.uid || '').trim()
        const email = normalizeEmail(body.email || '')

        if (!token || !uid || !email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Missing required fields')
        }

        const invite = await workspaceInviteRepo.findOneBy({ token })
        if (!invite || new Date(invite.expires_at).getTime() < Date.now()) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid invite')
        }

        if (invite.used) {
            return { message: 'Already joined' }
        }

        if (invite.email !== email) {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Email mismatch')
        }

        const user = await userRepo.findOneBy({ uid })
        if (!user || normalizeEmail(user.email) !== email) {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Email mismatch')
        }

        const existingMembership = await workspaceUserRepo.findOneBy({
            workspace_id: invite.workspace_id,
            user_id: uid
        })

        if (!existingMembership) {
            await workspaceUserRepo.save(
                workspaceUserRepo.create({
                    workspace_id: invite.workspace_id,
                    user_id: uid,
                    role: invite.role
                })
            )
        }

        user.workspaceUid = invite.workspace_id
        user.workspace = invite.workspace_name
        user.role = invite.role
        user.profile_skipped = false
        await userRepo.save(user)

        invite.used = true
        await workspaceInviteRepo.save(invite)

        return { message: 'Joined workspace successfully' }
    } catch (error) {
        handleAuthError(error, 'acceptInvite')
    }
}

const getWorkspaceUsers = async (workspace: string) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const workspaceRepo = appServer.AppDataSource.getRepository(Workspace)
        const workspaceUserRepo = appServer.AppDataSource.getRepository(WorkspaceUser)

        const workspaceName = normalizeWorkspaceName(workspace || '')
        if (!workspaceName) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace required')
        }

        const existingWorkspace = await workspaceRepo.findOneBy({ name: workspaceName })
        if (!existingWorkspace) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Workspace not found')
        }

        const memberships = await workspaceUserRepo.findBy({ workspace_id: existingWorkspace.id })
        const users = memberships.length ? await userRepo.findBy(memberships.map((membership) => ({ uid: membership.user_id }))) : []
        const userMap = new Map(users.map((user) => [user.uid, user]))

        return memberships
            .map((membership) => {
                const user = userMap.get(membership.user_id)
                return user
                    ? {
                          uid: user.uid,
                          name: user.name,
                          company: user.company,
                          department: user.department,
                          designation: user.designation,
                          role: membership.role
                      }
                    : null
            })
            .filter(Boolean)
            .sort((left: any, right: any) => {
                if (left.role === right.role) return String(left.name || '').localeCompare(String(right.name || ''))
                return left.role === 'admin' ? -1 : 1
            })
    } catch (error) {
        handleAuthError(error, 'getWorkspaceUsers')
    }
}

const deleteWorkspaceUser = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const workspaceRepo = appServer.AppDataSource.getRepository(Workspace)
        const workspaceUserRepo = appServer.AppDataSource.getRepository(WorkspaceUser)

        const userId = String(body.userId || '').trim()
        const workspaceName = normalizeWorkspaceName(body.workspace || '')

        if (!userId || !workspaceName) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid request')
        }

        const workspace = await workspaceRepo.findOneBy({ name: workspaceName })
        if (!workspace) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Workspace not found')
        }

        const membership = await workspaceUserRepo.findOneBy({
            workspace_id: workspace.id,
            user_id: userId
        })
        if (!membership) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not in workspace')
        }

        if (membership.role === 'admin') {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Admin cannot be removed')
        }

        await workspaceUserRepo.delete({ id: membership.id })

        const user = await userRepo.findOneBy({ uid: userId })
        if (user) {
            user.company = null as any
            user.department = null as any
            user.designation = null as any
            user.workspace = null as any
            user.workspaceUid = null as any
            user.role = null as any
            user.profile_completed = false
            user.profile_skipped = false
            await userRepo.save(user)
        }

        return { message: 'User removed and reset successfully' }
    } catch (error) {
        handleAuthError(error, 'deleteWorkspaceUser')
    }
}

const updateWorkspaceUserRole = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const workspaceRepo = appServer.AppDataSource.getRepository(Workspace)
        const workspaceUserRepo = appServer.AppDataSource.getRepository(WorkspaceUser)

        const userId = String(body.userId || '').trim()
        const role = String(body.role || '')
            .trim()
            .toLowerCase()
        const workspaceName = normalizeWorkspaceName(body.workspace || '')

        if (!userId || !role || !workspaceName) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Missing required fields')
        }

        ensureAllowedWorkspaceRole(role)

        const workspace = await workspaceRepo.findOneBy({ name: workspaceName })
        if (!workspace) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Workspace not found')
        }

        const currentAdmin = await workspaceUserRepo.findOneBy({
            workspace_id: workspace.id,
            role: 'admin'
        })
        if (currentAdmin?.user_id === userId && role !== 'admin') {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Admin cannot change his own role')
        }

        const membership = await workspaceUserRepo.findOneBy({
            workspace_id: workspace.id,
            user_id: userId
        })
        if (!membership) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not in workspace')
        }

        membership.role = role
        await workspaceUserRepo.save(membership)

        const user = await userRepo.findOneBy({ uid: userId })
        if (user) {
            user.role = role
            await userRepo.save(user)
        }

        return { message: 'User role updated successfully' }
    } catch (error) {
        handleAuthError(error, 'updateWorkspaceUserRole')
    }
}

const transferWorkspaceAdmin = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const workspaceRepo = appServer.AppDataSource.getRepository(Workspace)
        const workspaceUserRepo = appServer.AppDataSource.getRepository(WorkspaceUser)

        const fromUserId = String(body.fromUserId || '').trim()
        const toUserId = String(body.toUserId || '').trim()
        const workspaceName = normalizeWorkspaceName(body.workspace || '')

        if (!fromUserId || !toUserId || !workspaceName) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Missing fields')
        }

        const workspace = await workspaceRepo.findOneBy({ name: workspaceName })
        if (!workspace) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Workspace not found')
        }

        const fromMembership = await workspaceUserRepo.findOneBy({
            workspace_id: workspace.id,
            user_id: fromUserId
        })
        const toMembership = await workspaceUserRepo.findOneBy({
            workspace_id: workspace.id,
            user_id: toUserId
        })

        if (!fromMembership || fromMembership.role !== 'admin') {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Only admin can transfer ownership')
        }

        if (!toMembership) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Target user not found in workspace')
        }

        fromMembership.role = 'member'
        toMembership.role = 'admin'
        await workspaceUserRepo.save([fromMembership, toMembership])

        const fromUser = await userRepo.findOneBy({ uid: fromUserId })
        if (fromUser) {
            fromUser.role = 'member'
            await userRepo.save(fromUser)
        }

        const toUser = await userRepo.findOneBy({ uid: toUserId })
        if (toUser) {
            toUser.role = 'admin'
            await userRepo.save(toUser)
        }

        return { message: 'Admin transferred successfully' }
    } catch (error) {
        handleAuthError(error, 'transferWorkspaceAdmin')
    }
}

const getSuperadminWorkspaces = async (uid: string) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const workspaceRepo = appServer.AppDataSource.getRepository(Workspace)
        const workspaceUserRepo = appServer.AppDataSource.getRepository(WorkspaceUser)

        const user = await userRepo.findOneBy({ uid })
        if (!user || user.role !== 'superadmin') {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Not allowed')
        }

        const workspaces = await workspaceRepo.find()
        const adminMemberships = await workspaceUserRepo.findBy({ role: 'admin' })
        const adminIds = [...new Set(adminMemberships.map((membership) => membership.user_id))]
        const admins = adminIds.length ? await userRepo.findBy(adminIds.map((id) => ({ uid: id }))) : []
        const adminMap = new Map(admins.map((admin) => [admin.uid, admin]))
        const adminByWorkspace = new Map(adminMemberships.map((membership) => [membership.workspace_id, membership]))

        return workspaces
            .map((workspace) => {
                const membership = adminByWorkspace.get(workspace.id)
                const admin = membership ? adminMap.get(membership.user_id) : null
                return {
                    workspaceId: workspace.id,
                    workspace: workspace.name,
                    adminEmail: admin?.email || '',
                    adminName: admin?.name || '',
                    created_at: workspace.created_at
                }
            })
            .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    } catch (error) {
        handleAuthError(error, 'getSuperadminWorkspaces')
    }
}

const deleteSuperadminWorkspace = async (body: any) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const workspaceRepo = appServer.AppDataSource.getRepository(Workspace)
        const workspaceUserRepo = appServer.AppDataSource.getRepository(WorkspaceUser)
        const workspaceInviteRepo = appServer.AppDataSource.getRepository(WorkspaceInvite)

        const uid = String(body.uid || '').trim()
        const workspaceId = String(body.workspaceId || '').trim()

        if (!uid || !workspaceId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Missing required fields')
        }

        const user = await userRepo.findOneBy({ uid })
        if (!user || user.role !== 'superadmin') {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Not allowed')
        }

        const workspace = await workspaceRepo.findOneBy({ id: workspaceId })
        if (!workspace) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Workspace not found')
        }

        const memberships = await workspaceUserRepo.findBy({ workspace_id: workspaceId })
        for (const membership of memberships) {
            const workspaceUser = await userRepo.findOneBy({ uid: membership.user_id })
            if (workspaceUser && workspaceUser.role !== 'superadmin') {
                workspaceUser.workspace = null as any
                workspaceUser.workspaceUid = null as any
                workspaceUser.role = null as any
                workspaceUser.profile_completed = false
                workspaceUser.profile_skipped = false
                await userRepo.save(workspaceUser)
            }
        }

        await workspaceInviteRepo.delete({ workspace_id: workspaceId })
        for (const membership of memberships) {
            await workspaceUserRepo.delete({ id: membership.id })
        }
        await workspaceRepo.delete({ id: workspaceId })

        return { message: 'Workspace deleted' }
    } catch (error) {
        handleAuthError(error, 'deleteSuperadminWorkspace')
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
    inviteUser,
    validateInvite,
    acceptInvite,
    getWorkspaceUsers,
    deleteWorkspaceUser,
    updateWorkspaceUserRole,
    transferWorkspaceAdmin,
    getSuperadminWorkspaces,
    deleteSuperadminWorkspace,
    getUserData,
    updateUser
}
