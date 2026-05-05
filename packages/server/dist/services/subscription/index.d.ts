type SubscriptionDuration = 'monthly' | 'yearly';
type CreateSubscriptionInput = {
    planId?: string;
    customerEmail: string;
    user_id?: string;
};
type ValidateSubscriptionInput = {
    razorpay_subscription_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planId: string;
    user_id: string;
};
type ActivateFreeSubscriptionInput = {
    customerEmail: string;
    user_id: string;
};
type EnterpriseMailInput = {
    firstName: string;
    lastName: string;
    companyName: string;
    designation: string;
    email: string;
    contactNumber: string;
    description: string;
};
declare const _default: {
    createSubscription: (body: CreateSubscriptionInput) => Promise<{
        msg: string;
        subscriptionType: string;
        subscriptionDuration: string;
        startDate: string;
        expiryDate: null;
    } | {
        id: string;
        status: string;
        message: string;
        subscriptionType: "pro";
        duration: SubscriptionDuration;
        subscription_date: string;
        expiry_date: string;
    }>;
    validateSubscription: (body: ValidateSubscriptionInput) => Promise<{
        msg: string;
        subscriptionType: string;
        subscriptionDuration: string;
        startDate: string;
        expiryDate: string;
        subscription_date: string;
        expiry_date: string;
    }>;
    activateFreeSubscription: (body: ActivateFreeSubscriptionInput) => Promise<{
        msg: string;
        subscriptionType: string;
        subscriptionDuration: string;
        startDate: string;
        expiryDate: null;
    }>;
    submitEnterpriseMail: (body: EnterpriseMailInput) => Promise<{
        message: string;
    }>;
};
export default _default;
