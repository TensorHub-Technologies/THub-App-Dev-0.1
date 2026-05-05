declare const _default: {
    register: (body: any) => Promise<{
        tokenType: string;
        token: string;
        userId: string;
        workspace: string;
        user: {
            uid: string;
            email: string;
            name: string;
            login_type: string;
            workspace: string;
            picture: string;
            phone: string;
            company: string;
            department: string;
            designation: string;
            role: string;
            workspaceUid: string;
            subscription_type: string;
            subscription_duration: string;
            subscription_date: string | null;
            expiry_date: string | null;
            subscription_status: string;
            razorpay_subscription_id: string;
            profile_completed: boolean;
            profile_skipped: boolean;
        };
        message?: string | undefined;
    } | undefined>;
    login: (body: any) => Promise<{
        tokenType: string;
        token: string;
        userId: string;
        workspace: string;
        user: {
            uid: string;
            email: string;
            name: string;
            login_type: string;
            workspace: string;
            picture: string;
            phone: string;
            company: string;
            department: string;
            designation: string;
            role: string;
            workspaceUid: string;
            subscription_type: string;
            subscription_duration: string;
            subscription_date: string | null;
            expiry_date: string | null;
            subscription_status: string;
            razorpay_subscription_id: string;
            profile_completed: boolean;
            profile_skipped: boolean;
        };
        message?: string | undefined;
    } | undefined>;
    googleLogin: (body: any) => Promise<{
        tokenType: string;
        token: string;
        userId: string;
        workspace: string;
        user: {
            uid: string;
            email: string;
            name: string;
            login_type: string;
            workspace: string;
            picture: string;
            phone: string;
            company: string;
            department: string;
            designation: string;
            role: string;
            workspaceUid: string;
            subscription_type: string;
            subscription_duration: string;
            subscription_date: string | null;
            expiry_date: string | null;
            subscription_status: string;
            razorpay_subscription_id: string;
            profile_completed: boolean;
            profile_skipped: boolean;
        };
        message?: string | undefined;
    } | undefined>;
    microsoftLogin: (body: any) => Promise<{
        tokenType: string;
        token: string;
        userId: string;
        workspace: string;
        user: {
            uid: string;
            email: string;
            name: string;
            login_type: string;
            workspace: string;
            picture: string;
            phone: string;
            company: string;
            department: string;
            designation: string;
            role: string;
            workspaceUid: string;
            subscription_type: string;
            subscription_duration: string;
            subscription_date: string | null;
            expiry_date: string | null;
            subscription_status: string;
            razorpay_subscription_id: string;
            profile_completed: boolean;
            profile_skipped: boolean;
        };
        message?: string | undefined;
    } | undefined>;
    sendOtp: (body: any) => Promise<{
        otp?: string | undefined;
        message: string;
    } | undefined>;
    verifyOtp: (body: any) => Promise<{
        message: string;
    } | undefined>;
    checkEmail: (body: any) => Promise<{
        exists: boolean;
        login_type: string | null;
    } | undefined>;
    forgotPassword: (body: any, requestUiBaseUrl?: string) => Promise<{
        message: string;
    } | undefined>;
    resetPassword: (token: string, body: any) => Promise<{
        message: string;
    } | undefined>;
    inviteUser: (body: any, requestUiBaseUrl?: string) => Promise<{
        message: string;
    } | undefined>;
    validateInvite: (token: string) => Promise<{
        valid: boolean;
        email: string;
        workspace: string;
        role: string;
        invitedBy: string;
    } | undefined>;
    acceptInvite: (body: any) => Promise<{
        message: string;
    } | undefined>;
    getWorkspaceUsers: (workspace: string, requestedBy: string) => Promise<({
        uid: string;
        name: string;
        company: string;
        department: string;
        designation: string;
        role: string;
    } | null)[] | undefined>;
    deleteWorkspaceUser: (body: any) => Promise<{
        message: string;
    } | undefined>;
    updateWorkspaceUserRole: (body: any) => Promise<{
        message: string;
    } | undefined>;
    transferWorkspaceAdmin: (body: any) => Promise<{
        message: string;
    } | undefined>;
    getSuperadminWorkspaces: (uid: string) => Promise<{
        workspaceId: string;
        workspace: string;
        adminEmail: string;
        adminName: string;
        created_at: Date;
    }[] | undefined>;
    deleteSuperadminWorkspace: (body: any) => Promise<{
        message: string;
    } | undefined>;
    getUserData: (userId: string) => Promise<{
        uid: string;
        email: string;
        name: string;
        login_type: string;
        workspace: string;
        picture: string;
        phone: string;
        company: string;
        department: string;
        designation: string;
        role: string;
        workspaceUid: string;
        subscription_type: string;
        subscription_duration: string;
        subscription_date: string | null;
        expiry_date: string | null;
        subscription_status: string;
        razorpay_subscription_id: string;
        profile_completed: boolean;
        profile_skipped: boolean;
    } | undefined>;
    updateUser: (body: any) => Promise<{
        message: string;
        user: {
            uid: string;
            email: string;
            name: string;
            login_type: string;
            workspace: string;
            picture: string;
            phone: string;
            company: string;
            department: string;
            designation: string;
            role: string;
            workspaceUid: string;
            subscription_type: string;
            subscription_duration: string;
            subscription_date: string | null;
            expiry_date: string | null;
            subscription_status: string;
            razorpay_subscription_id: string;
            profile_completed: boolean;
            profile_skipped: boolean;
        };
    } | undefined>;
};
export default _default;
