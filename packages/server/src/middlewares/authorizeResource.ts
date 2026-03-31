import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../errors/internalFlowiseError'

type MaybePromise<T> = T | Promise<T>

export type ResourceFetcher<T> = (req: Request) => MaybePromise<T | null | undefined>

interface AuthorizeResourceOptions<T> {
    getOwnerId?: (resource: T) => string | undefined | null
    notFoundMessage?: string
    forbiddenMessage?: string
}

const getDefaultOwnerId = (resource: any) => {
    if (!resource || typeof resource !== 'object') return undefined

    if (typeof resource.userId === 'string') return resource.userId
    if (typeof resource.tenantId === 'string') return resource.tenantId
    if (typeof resource.ownerId === 'string') return resource.ownerId

    return undefined
}

const authorizeResource = <T>(fetchResource: ResourceFetcher<T>, options: AuthorizeResourceOptions<T> = {}) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const requesterId = req.user?.id
            if (!requesterId) {
                throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Authentication required')
            }

            const resource = await fetchResource(req)
            if (!resource) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, options.notFoundMessage || 'Resource not found')
            }

            const ownerId = options.getOwnerId ? options.getOwnerId(resource) : getDefaultOwnerId(resource)
            if (!ownerId) {
                throw new InternalFlowiseError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'Authorization misconfiguration: resource owner could not be determined'
                )
            }

            if (ownerId !== requesterId && req.authUser?.role !== 'superadmin') {
                throw new InternalFlowiseError(StatusCodes.FORBIDDEN, options.forbiddenMessage || 'Forbidden')
            }

            req.authorizedResource = resource
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default authorizeResource
