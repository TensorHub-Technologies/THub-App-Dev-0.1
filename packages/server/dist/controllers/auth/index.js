"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = __importDefault(require("../../services/auth"));
const internalTHubError_1 = require("../../errors/internalTHubError");
const http_status_codes_1 = require("http-status-codes");
const getAuthenticatedUser = (req) => {
    if (!req.authUser) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    return req.authUser;
};
const getFirstHeaderValue = (value) => String(value || '')
    .split(',')[0]
    .trim();
const getRequestUiBaseUrl = (req) => {
    const origin = getFirstHeaderValue(req.get('origin'));
    if (origin) {
        return origin.replace(/\/+$/, '');
    }
    const protocol = getFirstHeaderValue(req.get('x-forwarded-proto') || req.get('X-Forwarded-Proto') || req.protocol);
    const host = getFirstHeaderValue(req.get('x-forwarded-host') || req.get('X-Forwarded-Host') || req.get('host'));
    if (!protocol || !host) {
        return undefined;
    }
    return `${protocol}://${host}`.replace(/\/+$/, '');
};
// ================= CREATE =================
const register = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.register - body not provided!`);
        }
        const apiResponse = await auth_1.default.register(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const login = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.login - body not provided!`);
        }
        const apiResponse = await auth_1.default.login(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// ================= SOCIAL =================
const googleLogin = async (req, res, next) => {
    try {
        if (!req.body?.code) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.googleLogin - code not provided!`);
        }
        const apiResponse = await auth_1.default.googleLogin(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const microsoftLogin = async (req, res, next) => {
    try {
        if (!req.body) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.microsoftLogin - body not provided!`);
        }
        const apiResponse = await auth_1.default.microsoftLogin(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// ================= OTP =================
const sendOtp = async (req, res, next) => {
    try {
        if (!req.body?.email) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.sendOtp - email not provided!`);
        }
        const apiResponse = await auth_1.default.sendOtp(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const verifyOtp = async (req, res, next) => {
    try {
        if (!req.body?.email || !req.body?.otp) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.verifyOtp - missing fields!`);
        }
        const apiResponse = await auth_1.default.verifyOtp(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// ================= READ =================
const getUserData = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        const requestedUserId = typeof req.query?.userId === 'string' ? req.query.userId : authUser.uid;
        if (requestedUserId !== authUser.uid && authUser.role !== 'superadmin') {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.FORBIDDEN, 'You can only access your own user data');
        }
        const apiResponse = await auth_1.default.getUserData(requestedUserId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const checkEmail = async (req, res, next) => {
    try {
        if (!req.body?.email) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.checkEmail - email not provided!`);
        }
        const apiResponse = await auth_1.default.checkEmail(req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// ================= UPDATE =================
const updateUser = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        const requestedUid = typeof req.body?.uid === 'string' ? req.body.uid : authUser.uid;
        if (requestedUid !== authUser.uid && authUser.role !== 'superadmin') {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.FORBIDDEN, 'You can only update your own profile');
        }
        const apiResponse = await auth_1.default.updateUser({
            ...req.body,
            uid: requestedUid
        });
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// ================= PASSWORD =================
const forgotPassword = async (req, res, next) => {
    try {
        if (!req.body?.email) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.forgotPassword - email not provided!`);
        }
        const apiResponse = await auth_1.default.forgotPassword(req.body, getRequestUiBaseUrl(req));
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const resetPassword = async (req, res, next) => {
    try {
        if (!req.params?.token) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.resetPassword - token not provided!`);
        }
        const apiResponse = await auth_1.default.resetPassword(req.params.token, req.body);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
// ================= WORKSPACE / INVITES =================
const inviteUser = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        if (!req.body?.email || !req.body?.workspace) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.inviteUser - missing fields!`);
        }
        const apiResponse = await auth_1.default.inviteUser({
            ...req.body,
            invitedBy: authUser.uid
        }, getRequestUiBaseUrl(req));
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const validateInvite = async (req, res, next) => {
    try {
        if (!req.query?.token) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.validateInvite - token not provided!`);
        }
        const apiResponse = await auth_1.default.validateInvite(req.query.token);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const acceptInvite = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        if (!req.body?.token) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.acceptInvite - missing fields!`);
        }
        const apiResponse = await auth_1.default.acceptInvite({
            ...req.body,
            uid: authUser.uid,
            email: authUser.email
        });
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getWorkspaceUsers = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        if (!req.query?.workspace) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.getWorkspaceUsers - workspace not provided!`);
        }
        const apiResponse = await auth_1.default.getWorkspaceUsers(req.query.workspace, authUser.uid);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const deleteWorkspaceUser = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        if (!req.body?.userId || !req.body?.workspace) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.deleteWorkspaceUser - missing fields!`);
        }
        const apiResponse = await auth_1.default.deleteWorkspaceUser({
            ...req.body,
            requestedBy: authUser.uid
        });
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const updateWorkspaceUserRole = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        if (!req.body?.userId || !req.body?.role || !req.body?.workspace) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.updateWorkspaceUserRole - missing fields!`);
        }
        const apiResponse = await auth_1.default.updateWorkspaceUserRole({
            ...req.body,
            requestedBy: authUser.uid
        });
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const transferWorkspaceAdmin = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        if (!req.body?.toUserId || !req.body?.workspace) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.transferWorkspaceAdmin - missing fields!`);
        }
        const apiResponse = await auth_1.default.transferWorkspaceAdmin({
            ...req.body,
            fromUserId: authUser.uid
        });
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getSuperadminWorkspaces = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        const apiResponse = await auth_1.default.getSuperadminWorkspaces(authUser.uid);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const deleteSuperadminWorkspace = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        if (!req.body?.workspaceId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.PRECONDITION_FAILED, `Error: authController.deleteSuperadminWorkspace - missing fields!`);
        }
        const apiResponse = await auth_1.default.deleteSuperadminWorkspace({
            ...req.body,
            uid: authUser.uid
        });
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getCurrentUser = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        const apiResponse = await auth_1.default.getUserData(authUser.uid);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const getProtectedExample = async (req, res, next) => {
    try {
        const authUser = getAuthenticatedUser(req);
        const apiResponse = await auth_1.default.getUserData(authUser.uid);
        return res.json({
            message: 'Protected route accessed successfully',
            user: apiResponse
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
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
};
//# sourceMappingURL=index.js.map