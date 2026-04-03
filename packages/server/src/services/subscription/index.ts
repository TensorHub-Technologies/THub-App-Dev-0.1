import { StatusCodes } from 'http-status-codes'
import { User } from '../../database/entities/User'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { getRazorpayClient, verifyRazorpaySubscriptionSignature } from '../../utils/razorpay'
import transporter from '../../utils/transporter'

type SubscriptionDuration = 'monthly' | 'yearly'
type SubscriptionType = 'pro'

type PlanConfig = {
    duration: SubscriptionDuration
    subscriptionType: SubscriptionType
    totalCount: number
}

type CreateSubscriptionInput = {
    planId?: string
    customerEmail: string
    user_id?: string
}

type ValidateSubscriptionInput = {
    razorpay_subscription_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    planId: string
    user_id: string
}

type ActivateFreeSubscriptionInput = {
    customerEmail: string
    user_id: string
}

type EnterpriseMailInput = {
    firstName: string
    lastName: string
    companyName: string
    designation: string
    email: string
    contactNumber: string
    description: string
}

const DEFAULT_MONTHLY_PLAN_ID = 'plan_PhdG5GMrYCqm6Z'
const DEFAULT_YEARLY_PLAN_ID = 'plan_PhdbTzJPTel2e3'

const normalizeEmail = (email: string) =>
    String(email || '')
        .trim()
        .toLowerCase()

const getDateOnly = (date: Date) => date.toISOString().split('T')[0]

const getEnterpriseInquiryRecipient = () =>
    String(
        process.env.ENTERPRISE_MAIL_TO ||
            process.env.SALES_EMAIL ||
            process.env.SUPPORT_EMAIL ||
            process.env.NO_REPLY_EMAIL ||
            process.env.EMAIL_USER ||
            ''
    ).trim()

const getPlanConfigs = (): Record<string, PlanConfig> => {
    const monthlyPlanId = String(process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID || DEFAULT_MONTHLY_PLAN_ID).trim()
    const yearlyPlanId = String(process.env.RAZORPAY_PRO_YEARLY_PLAN_ID || DEFAULT_YEARLY_PLAN_ID).trim()

    return {
        [monthlyPlanId]: {
            duration: 'monthly',
            subscriptionType: 'pro',
            totalCount: 12
        },
        [yearlyPlanId]: {
            duration: 'yearly',
            subscriptionType: 'pro',
            totalCount: 1
        }
    }
}

const resolvePlanConfig = (planId: string): PlanConfig => {
    const planConfig = getPlanConfigs()[planId]
    if (!planConfig) {
        throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid plan ID')
    }
    return planConfig
}

const getSubscriptionDates = (duration: SubscriptionDuration) => {
    const subscriptionDate = new Date()
    const expiryDate = new Date(subscriptionDate)

    if (duration === 'monthly') {
        expiryDate.setUTCMonth(expiryDate.getUTCMonth() + 1)
    } else {
        expiryDate.setUTCFullYear(expiryDate.getUTCFullYear() + 1)
    }

    return {
        subscriptionDate,
        expiryDate,
        subscription_date: getDateOnly(subscriptionDate),
        expiry_date: getDateOnly(expiryDate)
    }
}

const activateFreeSubscription = async (body: ActivateFreeSubscriptionInput) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const customerEmail = normalizeEmail(body.customerEmail)
        const userId = String(body.user_id || '').trim()

        if (!customerEmail || !userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'customerEmail and user_id are required')
        }

        const user = await userRepo.findOneBy({ uid: userId })
        if (!user) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not found')
        }

        if (normalizeEmail(user.email) !== customerEmail) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'customerEmail does not match user account email')
        }

        const today = new Date()
        user.subscription_type = 'free'
        user.subscription_duration = 'monthly'
        user.subscription_date = today
        user.expiry_date = null as any
        user.subscription_status = 'active'
        user.razorpay_subscription_id = null as any
        await userRepo.save(user)

        return {
            msg: 'success',
            subscriptionType: user.subscription_type,
            subscriptionDuration: user.subscription_duration,
            startDate: getDateOnly(today),
            expiryDate: null
        }
    } catch (error) {
        if (error instanceof InternalFlowiseError) throw error
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: subscriptionService.activateFreeSubscription - ${getErrorMessage(error)}`
        )
    }
}

const submitEnterpriseMail = async (body: EnterpriseMailInput) => {
    try {
        const firstName = String(body.firstName || '').trim()
        const lastName = String(body.lastName || '').trim()
        const companyName = String(body.companyName || '').trim()
        const designation = String(body.designation || '').trim()
        const email = normalizeEmail(body.email)
        const contactNumber = String(body.contactNumber || '').trim()
        const description = String(body.description || '').trim()

        if (!firstName || !lastName || !companyName || !designation || !email || !contactNumber || !description) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'All enterprise inquiry fields are required')
        }

        const recipient = getEnterpriseInquiryRecipient()
        if (!recipient) {
            throw new InternalFlowiseError(StatusCodes.SERVICE_UNAVAILABLE, 'Enterprise inquiry recipient email is not configured')
        }

        await transporter.sendMail({
            to: recipient,
            subject: `Enterprise Inquiry: ${companyName}`,
            text: [
                `Name: ${firstName} ${lastName}`,
                `Company: ${companyName}`,
                `Designation: ${designation}`,
                `Email: ${email}`,
                `Contact: ${contactNumber}`,
                '',
                'Description:',
                description
            ].join('\n'),
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Enterprise Inquiry</h2>
                    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Company:</strong> ${companyName}</p>
                    <p><strong>Designation:</strong> ${designation}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Contact:</strong> ${contactNumber}</p>
                    <p><strong>Description:</strong></p>
                    <p>${description.replace(/\n/g, '<br/>')}</p>
                </div>
            `
        })

        return {
            message: "We'll reach out shortly!"
        }
    } catch (error) {
        if (error instanceof InternalFlowiseError) throw error
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: subscriptionService.submitEnterpriseMail - ${getErrorMessage(error)}`
        )
    }
}

const createSubscription = async (body: CreateSubscriptionInput) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const planId = String(body.planId || '').trim()
        const customerEmail = normalizeEmail(body.customerEmail)
        const userId = String(body.user_id || '').trim()

        if (!customerEmail) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'customerEmail is required')
        }

        if (!planId) {
            return await activateFreeSubscription({
                customerEmail,
                user_id: userId
            })
        }

        const planConfig = resolvePlanConfig(planId)
        const razorpay = getRazorpayClient()

        if (userId) {
            const user = await userRepo.findOneBy({ uid: userId })
            if (!user) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not found')
            }
            if (normalizeEmail(user.email) !== customerEmail) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'customerEmail does not match user account email')
            }
        }

        await razorpay.plans.fetch(planId)
        const dates = getSubscriptionDates(planConfig.duration)

        const subscription = (await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: planConfig.totalCount,
            customer_notify: 1,
            notes: {
                user_id: userId || '',
                customer_email: customerEmail
            }
        })) as { id?: string; status?: string }

        if (!subscription?.id) {
            throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Razorpay did not return a subscription ID')
        }

        return {
            id: subscription.id,
            status: subscription.status || 'created',
            message: 'Subscription created successfully',
            subscriptionType: planConfig.subscriptionType,
            duration: planConfig.duration,
            subscription_date: dates.subscription_date,
            expiry_date: dates.expiry_date
        }
    } catch (error) {
        if (error instanceof InternalFlowiseError) throw error
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: subscriptionService.createSubscription - ${getErrorMessage(error)}`
        )
    }
}

const validateSubscription = async (body: ValidateSubscriptionInput) => {
    try {
        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const razorpay = getRazorpayClient()

        const subscriptionId = String(body.razorpay_subscription_id || '').trim()
        const paymentId = String(body.razorpay_payment_id || '').trim()
        const signature = String(body.razorpay_signature || '').trim()
        const planId = String(body.planId || '').trim()
        const userId = String(body.user_id || '').trim()

        if (!subscriptionId || !paymentId || !signature || !planId || !userId) {
            throw new InternalFlowiseError(
                StatusCodes.BAD_REQUEST,
                'razorpay_subscription_id, razorpay_payment_id, razorpay_signature, planId and user_id are required'
            )
        }

        const planConfig = resolvePlanConfig(planId)
        const signatureIsValid = verifyRazorpaySubscriptionSignature(subscriptionId, paymentId, signature)
        if (!signatureIsValid) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Payment validation failed')
        }

        const razorpaySubscription = (await razorpay.subscriptions.fetch(subscriptionId)) as {
            plan_id?: string
            notes?: { user_id?: string }
        }

        if (razorpaySubscription?.plan_id && razorpaySubscription.plan_id !== planId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Plan mismatch for subscription')
        }

        const noteUserId = String(razorpaySubscription?.notes?.user_id || '').trim()
        if (noteUserId && noteUserId !== userId) {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Subscription does not belong to the provided user')
        }

        const user = await userRepo.findOneBy({ uid: userId })
        if (!user) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not found')
        }

        const dates = getSubscriptionDates(planConfig.duration)

        user.subscription_type = planConfig.subscriptionType
        user.subscription_duration = planConfig.duration
        user.subscription_date = dates.subscriptionDate
        user.expiry_date = dates.expiryDate
        user.subscription_status = 'active'
        user.razorpay_subscription_id = subscriptionId

        await userRepo.save(user)

        return {
            msg: 'success',
            subscriptionType: user.subscription_type,
            subscriptionDuration: user.subscription_duration,
            startDate: dates.subscription_date,
            expiryDate: dates.expiry_date,
            subscription_date: dates.subscription_date,
            expiry_date: dates.expiry_date
        }
    } catch (error) {
        if (error instanceof InternalFlowiseError) throw error
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: subscriptionService.validateSubscription - ${getErrorMessage(error)}`
        )
    }
}

export default {
    createSubscription,
    validateSubscription,
    activateFreeSubscription,
    submitEnterpriseMail
}
