import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { User } from '../database/entities/User'
import { InternalTHubError } from '../errors/internalTHubError'
import { getRunningExpressApp } from '../utils/getRunningExpressApp'
import { verifyAuthToken } from '../utils/jwt'

export interface AuthenticatedUser {
    uid: string
    email: string
    role?: string
    login_type?: string
}

declare global {
    namespace Express {
        interface User {
            id: string
            email?: string
            role?: string
            login_type?: string
        }

        interface Request {
            authUser?: AuthenticatedUser
            authorizedResource?: unknown
        }
    }
}

const getBearerToken = (req: Request) => {
    const authorizationHeader = String(req.headers['authorization'] || '').trim()
    if (!authorizationHeader.toLowerCase().startsWith('bearer ')) return ''
    return authorizationHeader.slice(7).trim()
}

const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const token = getBearerToken(req)
        if (!token) {
            throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authentication token is required')
        }

        const payload = verifyAuthToken(token)
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const user = await userRepo.findOneBy({ uid: payload.uid })

        if (!user) {
            throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authenticated user not found')
        }

        req.user = {
            id: user.uid,
            email: user.email,
            role: user.role,
            login_type: user.login_type
        }
        req.authUser = {
            uid: user.uid,
            email: user.email,
            role: user.role,
            login_type: user.login_type
        }
        next()
    } catch (error) {
        next(error)
    }
}

export default authMiddleware
