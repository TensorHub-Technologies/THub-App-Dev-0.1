import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../errors/internalFlowiseError.js'

const assertMatchingTenant = (incomingTenantId: unknown, authenticatedTenantId: string, source: string) => {
    if (typeof incomingTenantId !== 'string') return

    const normalizedTenantId = incomingTenantId.trim()
    if (normalizedTenantId && normalizedTenantId !== authenticatedTenantId) {
        throw new InternalFlowiseError(StatusCodes.FORBIDDEN, `Forbidden: invalid ${source}`)
    }
}

export const bindAuthenticatedTenant = (req: Request, _res: Response, next: NextFunction) => {
    try {
        const authenticatedTenantId = req.user?.id
        if (!authenticatedTenantId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Authentication required')
        }

        assertMatchingTenant(req.query?.tenantId, authenticatedTenantId, 'tenantId query')
        assertMatchingTenant(req.params?.tenantId, authenticatedTenantId, 'tenantId route parameter')

        if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
            assertMatchingTenant((req.body as Record<string, unknown>).tenantId, authenticatedTenantId, 'tenantId payload')
            ;(req.body as Record<string, unknown>).tenantId = authenticatedTenantId
        }

        ;(req.query as Record<string, unknown>).tenantId = authenticatedTenantId

        if (req.params?.tenantId !== undefined) {
            req.params.tenantId = authenticatedTenantId
        }

        next()
    } catch (error) {
        next(error)
    }
}
