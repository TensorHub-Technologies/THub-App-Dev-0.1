import jwt, { type SignOptions } from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../errors/internalFlowiseError'

export interface AuthTokenPayload {
    uid: string
    email: string
    login_type: string
}

const getJwtSecret = () =>
    process.env.JWT_SECRET || process.env.AUTH_JWT_SECRET || process.env.FLOWISE_SECRETKEY_OVERWRITE || 'thub-dev-jwt-secret'

const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d'

export const signAuthToken = (payload: AuthTokenPayload) =>
    jwt.sign(payload, getJwtSecret(), {
        expiresIn: getJwtExpiresIn()
    } as SignOptions)

export const verifyAuthToken = (token: string): AuthTokenPayload => {
    try {
        const decoded = jwt.verify(token, getJwtSecret())

        if (!decoded || typeof decoded === 'string') {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token')
        }

        const uid = typeof decoded.uid === 'string' ? decoded.uid : ''
        const email = typeof decoded.email === 'string' ? decoded.email : ''
        const loginType = typeof decoded.login_type === 'string' ? decoded.login_type : ''

        if (!uid || !email) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token')
        }

        return {
            uid,
            email,
            login_type: loginType
        }
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            throw error
        }

        throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token')
    }
}
