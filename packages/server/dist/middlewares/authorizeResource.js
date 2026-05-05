"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const internalTHubError_1 = require("../errors/internalTHubError");
const getDefaultOwnerId = (resource) => {
    if (!resource || typeof resource !== 'object')
        return undefined;
    if (typeof resource.userId === 'string')
        return resource.userId;
    if (typeof resource.tenantId === 'string')
        return resource.tenantId;
    if (typeof resource.ownerId === 'string')
        return resource.ownerId;
    return undefined;
};
const authorizeResource = (fetchResource, options = {}) => {
    return async (req, _res, next) => {
        try {
            const requesterId = req.user?.id;
            if (!requesterId) {
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
            }
            const resource = await fetchResource(req);
            if (!resource) {
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.NOT_FOUND, options.notFoundMessage || 'Resource not found');
            }
            const ownerId = options.getOwnerId ? options.getOwnerId(resource) : getDefaultOwnerId(resource);
            if (!ownerId) {
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Authorization misconfiguration: resource owner could not be determined');
            }
            if (ownerId !== requesterId && req.authUser?.role !== 'superadmin') {
                throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.FORBIDDEN, options.forbiddenMessage || 'Forbidden');
            }
            req.authorizedResource = resource;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.default = authorizeResource;
//# sourceMappingURL=authorizeResource.js.map