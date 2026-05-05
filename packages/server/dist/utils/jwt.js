"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthToken = exports.signAuthToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const internalTHubError_1 = require("../errors/internalTHubError");
const getJwtSecret = () => process.env.JWT_SECRET || process.env.AUTH_JWT_SECRET || process.env.THUB_SECRETKEY_OVERWRITE || 'thub-dev-jwt-secret';
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';
const signAuthToken = (payload) => jsonwebtoken_1.default.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn()
});
exports.signAuthToken = signAuthToken;
const verifyAuthToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, getJwtSecret());
        if (!decoded || typeof decoded === 'string') {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
        }
        const uid = typeof decoded.uid === 'string' ? decoded.uid : '';
        const email = typeof decoded.email === 'string' ? decoded.email : '';
        const loginType = typeof decoded.login_type === 'string' ? decoded.login_type : '';
        if (!uid || !email) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
        }
        return {
            uid,
            email,
            login_type: loginType
        };
    }
    catch (error) {
        if (error instanceof internalTHubError_1.InternalTHubError) {
            throw error;
        }
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
    }
};
exports.verifyAuthToken = verifyAuthToken;
//# sourceMappingURL=jwt.js.map