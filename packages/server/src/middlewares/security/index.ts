import { Request, Response, NextFunction } from 'express'
import { getDataSource } from '../../DataSource'
import { User, UserRole, UserStatus } from '../../database/entities/User'
import { AuditLog, AuditAction, AuditSeverity } from '../../database/entities/AuditLog'
import { compareKeys } from '../../utils/apiKey'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import logger from '../../utils/logger'

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: User
            auditContext?: {
                action: AuditAction
                resource: string
                resourceId?: string
                severity?: AuditSeverity
            }
        }
    }
}

/**
 * Authentication middleware
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Authorization header required')
        }

        const token = authHeader.replace('Bearer ', '')
        
        // For now, use API key authentication as fallback
        // TODO: Implement JWT token validation
        const appDataSource = getDataSource()
        const user = await appDataSource.getRepository(User).findOne({
            where: { id: token, status: UserStatus.ACTIVE }
        })

        if (!user) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token')
        }

        req.user = user
        next()
    } catch (error) {
        await logAuditEvent(req, AuditAction.ACCESS_DENIED, 'authentication', undefined, AuditSeverity.HIGH, false, error.message)
        next(error)
    }
}

/**
 * Authorization middleware
 */
export const authorizeUser = (requiredRole: UserRole, requiredPermission?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
            }

            // Check role-based access
            if (req.user.role !== UserRole.ADMIN && req.user.role !== requiredRole) {
                await logAuditEvent(req, AuditAction.ACCESS_DENIED, req.path, undefined, AuditSeverity.HIGH, false, 'Insufficient role')
                throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Insufficient permissions')
            }

            // Check specific permission if required
            if (requiredPermission) {
                // TODO: Implement permission checking logic
                // const hasPermission = await checkUserPermission(req.user.id, requiredPermission)
                // if (!hasPermission) {
                //     throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Insufficient permissions')
                // }
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}

/**
 * Audit logging middleware
 */
export const auditMiddleware = (action: AuditAction, resource: string, severity: AuditSeverity = AuditSeverity.LOW) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Set audit context
        req.auditContext = {
            action,
            resource,
            resourceId: req.params.id,
            severity
        }

        const originalSend = res.send
        res.send = function(data) {
            // Log audit event asynchronously
            logAuditEvent(req, action, resource, req.params.id, severity, res.statusCode < 400, null)
                .catch(err => logger.error('Failed to log audit event:', err))
            
            originalSend.call(this, data)
        }
        
        next()
    }
}

/**
 * Log audit event
 */
export const logAuditEvent = async (
    req: Request,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    severity: AuditSeverity = AuditSeverity.LOW,
    isSuccessful: boolean = true,
    errorMessage?: string
) => {
    try {
        const appDataSource = getDataSource()
        const auditLog = new AuditLog()
        
        auditLog.userId = req.user?.id
        auditLog.userEmail = req.user?.email
        auditLog.action = action
        auditLog.resource = resource
        auditLog.resourceId = resourceId
        auditLog.details = JSON.stringify({
            method: req.method,
            path: req.path,
            query: req.query,
            body: sanitizeRequestBody(req.body),
            headers: sanitizeHeaders(req.headers)
        })
        auditLog.ipAddress = req.ip || req.connection.remoteAddress || 'unknown'
        auditLog.userAgent = req.get('User-Agent') || 'unknown'
        auditLog.severity = severity
        auditLog.sessionId = req.session?.id
        auditLog.tenantId = req.user?.tenantId
        auditLog.isSuccessful = isSuccessful
        auditLog.errorMessage = errorMessage
        auditLog.requestId = req.headers['x-request-id'] as string

        await appDataSource.getRepository(AuditLog).save(auditLog)
    } catch (error) {
        logger.error('Failed to create audit log:', error)
    }
}

/**
 * Sanitize request body for audit logging
 */
const sanitizeRequestBody = (body: any): any => {
    if (!body) return body
    
    const sanitized = { ...body }
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey']
    
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]'
        }
    })
    
    return sanitized
}

/**
 * Sanitize headers for audit logging
 */
const sanitizeHeaders = (headers: any): any => {
    if (!headers) return headers
    
    const sanitized = { ...headers }
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
    
    sensitiveHeaders.forEach(header => {
        if (sanitized[header]) {
            sanitized[header] = '[REDACTED]'
        }
    })
    
    return sanitized
}

/**
 * Rate limiting middleware with audit logging
 */
export const rateLimitWithAudit = (maxRequests: number, windowMs: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // TODO: Implement rate limiting logic
            // For now, just pass through
            next()
        } catch (error) {
            await logAuditEvent(req, AuditAction.ACCESS_DENIED, 'rate_limit', undefined, AuditSeverity.MEDIUM, false, 'Rate limit exceeded')
            next(error)
        }
    }
}

/**
 * Input validation middleware
 */
export const validateInput = (schema: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // TODO: Implement input validation using Joi or similar
            next()
        } catch (error) {
            await logAuditEvent(req, AuditAction.ACCESS_DENIED, 'input_validation', undefined, AuditSeverity.MEDIUM, false, 'Invalid input')
            next(error)
        }
    }
}

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    next()
} 