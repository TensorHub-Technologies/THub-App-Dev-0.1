"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindAuthenticatedTenant = void 0;
const http_status_codes_1 = require("http-status-codes");
const internalTHubError_1 = require("../errors/internalTHubError");
const assertMatchingTenant = (incomingTenantId, authenticatedTenantId, source) => {
    if (typeof incomingTenantId !== 'string')
        return;
    const normalizedTenantId = incomingTenantId.trim();
    if (normalizedTenantId && normalizedTenantId !== authenticatedTenantId) {
        throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.FORBIDDEN, `Forbidden: invalid ${source}`);
    }
};
const bindAuthenticatedTenant = (req, _res, next) => {
    try {
        const authenticatedTenantId = req.user?.id;
        if (!authenticatedTenantId) {
            throw new internalTHubError_1.InternalTHubError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication required');
        }
        assertMatchingTenant(req.query?.tenantId, authenticatedTenantId, 'tenantId query');
        assertMatchingTenant(req.params?.tenantId, authenticatedTenantId, 'tenantId route parameter');
        if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
            assertMatchingTenant(req.body.tenantId, authenticatedTenantId, 'tenantId payload');
            req.body.tenantId = authenticatedTenantId;
        }
        ;
        req.query.tenantId = authenticatedTenantId;
        if (req.params?.tenantId !== undefined) {
            req.params.tenantId = authenticatedTenantId;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.bindAuthenticatedTenant = bindAuthenticatedTenant;
//# sourceMappingURL=tenantScope.js.map