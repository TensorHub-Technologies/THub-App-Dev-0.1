import { Request, Response, NextFunction } from 'express'
import authService from '../../services/auth'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

// ================= CREATE =================
const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.register - body not provided!`)
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
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.login - body not provided!`)
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
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.googleLogin - code not provided!`)
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
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.microsoftLogin - body not provided!`)
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
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.sendOtp - email not provided!`)
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
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.verifyOtp - missing fields!`)
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
        if (!req.query?.userId) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.getUserData - userId not provided!`)
        }
        const apiResponse = await authService.getUserData(req.query.userId as string)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body?.email) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.checkEmail - email not provided!`)
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
        if (!req.body?.uid) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.updateUser - uid not provided!`)
        }
        const apiResponse = await authService.updateUser(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

// ================= PASSWORD =================
const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body?.email) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.forgotPassword - email not provided!`)
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
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: authController.resetPassword - token not provided!`)
        }
        const apiResponse = await authService.resetPassword(req.params.token, req.body)
        return res.json(apiResponse)
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
    getUserData,
    updateUser
}
