"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../controllers/auth"));
const auth_2 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
// CREATE (REGISTER / SOCIAL)
router.post('/register', auth_1.default.register);
router.post('/login', auth_1.default.login);
router.post('/google', auth_1.default.googleLogin);
router.post('/microsoft', auth_1.default.microsoftLogin);
// OTP
router.post('/send-otp', auth_1.default.sendOtp);
router.post('/verify-otp', auth_1.default.verifyOtp);
// EMAIL CHECK
router.post('/check-email', auth_1.default.checkEmail);
// PASSWORD
router.post('/forgot-password', auth_1.default.forgotPassword);
router.post('/reset-password/:token', auth_1.default.resetPassword);
// WORKSPACE / INVITES
router.post('/invite-user', auth_2.default, auth_1.default.inviteUser);
router.get('/invite/validate', auth_1.default.validateInvite);
router.post('/invite/accept', auth_2.default, auth_1.default.acceptInvite);
router.get('/workspace-users', auth_2.default, auth_1.default.getWorkspaceUsers);
router.delete('/workspace-user', auth_2.default, auth_1.default.deleteWorkspaceUser);
router.patch('/workspace-user/role', auth_2.default, auth_1.default.updateWorkspaceUserRole);
router.post('/workspace-user/transfer-admin', auth_2.default, auth_1.default.transferWorkspaceAdmin);
router.get('/superadmin/workspaces', auth_2.default, auth_1.default.getSuperadminWorkspaces);
router.delete('/superadmin/workspace', auth_2.default, auth_1.default.deleteSuperadminWorkspace);
// USER
router.get('/me', auth_2.default, auth_1.default.getCurrentUser);
router.get('/protected', auth_2.default, auth_1.default.getProtectedExample);
router.get('/userdata', auth_2.default, auth_1.default.getUserData);
router.post('/update-user', auth_2.default, auth_1.default.updateUser);
exports.default = router;
//# sourceMappingURL=index.js.map