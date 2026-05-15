import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalTHubError } from '../../errors/internalTHubError'
import subscriptionService from '../../services/subscription'

const createSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                'Error: subscriptionController.createSubscription - body not provided!'
            )
        }

        if (!req.body.customerEmail) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                'Error: subscriptionController.createSubscription - customerEmail is required!'
            )
        }

        const apiResponse = await subscriptionService.createSubscription(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const validateSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                'Error: subscriptionController.validateSubscription - body not provided!'
            )
        }

        const requiredFields = ['razorpay_subscription_id', 'razorpay_payment_id', 'razorpay_signature', 'planId', 'user_id']
        const missingField = requiredFields.find((field) => !String(req.body[field] || '').trim())
        if (missingField) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: subscriptionController.validateSubscription - ${missingField} is required!`
            )
        }

        const apiResponse = await subscriptionService.validateSubscription(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const activateFreeSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                'Error: subscriptionController.activateFreeSubscription - body not provided!'
            )
        }

        if (!req.body.customerEmail || !req.body.user_id) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                'Error: subscriptionController.activateFreeSubscription - customerEmail and user_id are required!'
            )
        }

        const apiResponse = await subscriptionService.activateFreeSubscription(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const submitEnterpriseMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                'Error: subscriptionController.submitEnterpriseMail - body not provided!'
            )
        }

        const requiredFields = ['firstName', 'lastName', 'companyName', 'designation', 'email', 'contactNumber', 'description']
        const missingField = requiredFields.find((field) => !String(req.body[field] || '').trim())
        if (missingField) {
            throw new InternalTHubError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: subscriptionController.submitEnterpriseMail - ${missingField} is required!`
            )
        }

        const apiResponse = await subscriptionService.submitEnterpriseMail(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signature = String(req.headers['x-razorpay-signature'] || '').trim()
        const rawBody = JSON.stringify(req.body || {})
        const apiResponse = await subscriptionService.handleRazorpayWebhook(rawBody, signature)
        return res.json(apiResponse)
    } catch (error) {
        if (
            error instanceof InternalTHubError &&
            error.statusCode === StatusCodes.BAD_REQUEST &&
            /signature/i.test(String(error.message || ''))
        ) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid webhook signature' })
        }
        next(error)
    }
}

const enterpriseMailStatus = async (_req: Request, res: Response) => {
    return res.json({
        message: 'Enterprise mail endpoint is available. Use POST to submit inquiries.'
    })
}

export default {
    createSubscription,
    validateSubscription,
    activateFreeSubscription,
    submitEnterpriseMail,
    handleRazorpayWebhook,
    enterpriseMailStatus
}
