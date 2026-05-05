import Razorpay from 'razorpay';
export declare const getRazorpayClient: () => Razorpay;
export declare const verifyRazorpaySubscriptionSignature: (subscriptionId: string, paymentId: string, signature: string) => boolean;
