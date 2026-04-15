import { Request, Response, NextFunction } from 'express'
import authService from '../../services/auth'
import { InternalTHubError } from '../../errors/internalTHubError'
import { StatusCodes } from 'http-status-codes'

const getAuthenticatedUser = (req: Request) => {
    if (!req.authUser) {
        throw new InternalTHubError(StatusCodes.UNAUTHORIZED, 'Authentication required')
    }

    return req.authUser
}

// ================= CREATE =================
const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.register - body not provided!`)
        }
        const apiResponse = await authService.register(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.login - body not provided!`)
        }
        const apiResponse = await authService.login(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

// ================= SOCIAL =================
const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body?.code) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.googleLogin - code not provided!`)
        }
        const apiResponse = await authService.googleLogin(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const microsoftLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.microsoftLogin - body not provided!`)
        }
        const apiResponse = await authService.microsoftLogin(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

// ================= OTP =================
const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body?.email) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.sendOtp - email not provided!`)
        }
        const apiResponse = await authService.sendOtp(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body?.email || !req.body?.otp) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.verifyOtp - missing fields!`)
        }
        const apiResponse = await authService.verifyOtp(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

// ================= READ =================
const getUserData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)
        const requestedUserId = typeof req.query?.userId === 'string' ? req.query.userId : authUser.uid

        if (requestedUserId !== authUser.uid && authUser.role !== 'superadmin') {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'You can only access your own user data')
        }

        const apiResponse = await authService.getUserData(requestedUserId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body?.email) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.checkEmail - email not provided!`)
        }
        const apiResponse = await authService.checkEmail(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

// ================= UPDATE =================
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)
        const requestedUid = typeof req.body?.uid === 'string' ? req.body.uid : authUser.uid

        if (requestedUid !== authUser.uid && authUser.role !== 'superadmin') {
            throw new InternalTHubError(StatusCodes.FORBIDDEN, 'You can only update your own profile')
        }

        const apiResponse = await authService.updateUser({
            ...req.body,
            uid: requestedUid
        })
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

// ================= PASSWORD =================
const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body?.email) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.forgotPassword - email not provided!`)
        }
        const apiResponse = await authService.forgotPassword(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.token) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.resetPassword - token not provided!`)
        }
        const apiResponse = await authService.resetPassword(req.params.token, req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

// ================= WORKSPACE / INVITES =================
const inviteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)

        if (!req.body?.email || !req.body?.workspace) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.inviteUser - missing fields!`)
        }

        const apiResponse = await authService.inviteUser({
            ...req.body,
            invitedBy: authUser.uid
        })
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const validateInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.query?.token) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.validateInvite - token not provided!`)
        }
        const apiResponse = await authService.validateInvite(req.query.token as string)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)

        if (!req.body?.token) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.acceptInvite - missing fields!`)
        }

        const apiResponse = await authService.acceptInvite({
            ...req.body,
            uid: authUser.uid,
            email: authUser.email
        })
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getWorkspaceUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)

        if (!req.query?.workspace) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: authController.getWorkspaceUsers - workspace not provided!`
            )
        }
        const apiResponse = await authService.getWorkspaceUsers(req.query.workspace as string, authUser.uid)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const deleteWorkspaceUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)

        if (!req.body?.userId || !req.body?.workspace) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.deleteWorkspaceUser - missing fields!`)
        }
        const apiResponse = await authService.deleteWorkspaceUser({
            ...req.body,
            requestedBy: authUser.uid
        })
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const updateWorkspaceUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)

        if (!req.body?.userId || !req.body?.role || !req.body?.workspace) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.updateWorkspaceUserRole - missing fields!`)
        }
        const apiResponse = await authService.updateWorkspaceUserRole({
            ...req.body,
            requestedBy: authUser.uid
        })
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const transferWorkspaceAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)

        if (!req.body?.toUserId || !req.body?.workspace) {
            throw new InternalTHubError(StatusCodes.PRECONDITION_FAILED, `Error: authController.transferWorkspaceAdmin - missing fields!`)
        }

        const apiResponse = await authService.transferWorkspaceAdmin({
            ...req.body,
            fromUserId: authUser.uid
        })
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getSuperadminWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)
        const apiResponse = await authService.getSuperadminWorkspaces(authUser.uid)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const deleteSuperadminWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)

        if (!req.body?.workspaceId) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: authController.deleteSuperadminWorkspace - missing fields!`
            )
        }
        const apiResponse = await authService.deleteSuperadminWorkspace({
            ...req.body,
            uid: authUser.uid
        })
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)
        const apiResponse = await authService.getUserData(authUser.uid)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getProtectedExample = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = getAuthenticatedUser(req)
        const apiResponse = await authService.getUserData(authUser.uid)
        return res.json({
            message: 'Protected route accessed successfully',
            user: apiResponse
        })
    } catch (error) {
        next(error)
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
    getCurrentUser,
    getProtectedExample,
    getUserData,
    updateUser
}
