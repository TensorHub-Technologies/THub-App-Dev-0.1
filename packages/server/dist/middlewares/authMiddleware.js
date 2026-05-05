"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const User_1 = require("../database/entities/User");
const internalTHubError_1 = require("../errors/internalTHubError");
const getRunningExpressApp_1 = require("../utils/getRunningExpressApp");
const jwt_1 = require("../utils/jwt");
const getBearerToken = (req) => {
    const authorizationHeader = String(req.headers['authorization'] || '').trim();
    if (!authorizationHeader.toLowerCase().startsWith('bearer '))
        return '';
    return authorizationHeader.slice(7).trim();
};
const authMiddleware = async (req, _res, next) => {
    try {
        const token = getBearerToken(req);
        if (!token) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication token is required');
        }
        const payload = (0, jwt_1.verifyAuthToken)(token);
        const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
        const userRepo = appServer.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOneBy({ uid: payload.uid });
        if (!user) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authenticated user not found');
        }
        req.user = {
            id: user.uid,
            email: user.email,
            role: user.role,
            login_type: user.login_type
        };
        req.authUser = {
            uid: user.uid,
            email: user.email,
            role: user.role,
            login_type: user.login_type
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map