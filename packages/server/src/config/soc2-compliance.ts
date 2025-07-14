export interface SOC2ComplianceConfig {
    // Authentication and Authorization
    auth: {
        sessionTimeout: number // minutes
        maxLoginAttempts: number
        passwordPolicy: {
            minLength: number
            requireUppercase: boolean
            requireLowercase: boolean
            requireNumbers: boolean
            requireSpecialChars: boolean
            maxAge: number // days
        }
        mfa: {
            enabled: boolean
            requiredForAdmin: boolean
        }
    }
    
    // Audit Logging
    audit: {
        enabled: boolean
        retentionDays: number
        logLevel: 'low' | 'medium' | 'high'
        sensitiveFields: string[]
        excludedPaths: string[]
    }
    
    // Data Protection
    dataProtection: {
        encryption: {
            algorithm: string
            keyRotationDays: number
        }
        classification: {
            enabled: boolean
            defaultLevel: 'public' | 'internal' | 'confidential' | 'restricted'
        }
        retention: {
            enabled: boolean
            defaultRetentionDays: number
        }
    }
    
    // Security Monitoring
    monitoring: {
        enabled: boolean
        alertThresholds: {
            failedLogins: number
            suspiciousActivities: number
            dataExports: number
        }
        realTimeAlerts: boolean
    }
    
    // Incident Response
    incidentResponse: {
        enabled: boolean
        autoEscalation: boolean
        responseTimeMinutes: number
        notificationChannels: string[]
    }
    
    // Backup and Recovery
    backup: {
        enabled: boolean
        frequency: 'daily' | 'weekly' | 'monthly'
        retentionDays: number
        encryption: boolean
        testRestore: boolean
    }
    
    // Vulnerability Management
    vulnerabilityManagement: {
        enabled: boolean
        scanFrequency: 'daily' | 'weekly' | 'monthly'
        autoRemediation: boolean
        severityThreshold: 'low' | 'medium' | 'high' | 'critical'
    }
}

export const defaultSOC2Config: SOC2ComplianceConfig = {
    auth: {
        sessionTimeout: 480, // 8 hours
        maxLoginAttempts: 5,
        passwordPolicy: {
            minLength: 12,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            maxAge: 90 // days
        },
        mfa: {
            enabled: true,
            requiredForAdmin: true
        }
    },
    
    audit: {
        enabled: true,
        retentionDays: 2555, // 7 years
        logLevel: 'high',
        sensitiveFields: [
            'password',
            'token',
            'secret',
            'apiKey',
            'privateKey',
            'creditCard',
            'ssn'
        ],
        excludedPaths: [
            '/health',
            '/metrics',
            '/ping'
        ]
    },
    
    dataProtection: {
        encryption: {
            algorithm: 'AES-256-GCM',
            keyRotationDays: 90
        },
        classification: {
            enabled: true,
            defaultLevel: 'internal'
        },
        retention: {
            enabled: true,
            defaultRetentionDays: 2555 // 7 years
        }
    },
    
    monitoring: {
        enabled: true,
        alertThresholds: {
            failedLogins: 10,
            suspiciousActivities: 5,
            dataExports: 100
        },
        realTimeAlerts: true
    },
    
    incidentResponse: {
        enabled: true,
        autoEscalation: true,
        responseTimeMinutes: 30,
        notificationChannels: ['email', 'slack', 'sms']
    },
    
    backup: {
        enabled: true,
        frequency: 'daily',
        retentionDays: 2555, // 7 years
        encryption: true,
        testRestore: true
    },
    
    vulnerabilityManagement: {
        enabled: true,
        scanFrequency: 'weekly',
        autoRemediation: false,
        severityThreshold: 'medium'
    }
}

export const getSOC2Config = (): SOC2ComplianceConfig => {
    // Load from environment variables or use defaults
    return {
        ...defaultSOC2Config,
        auth: {
            ...defaultSOC2Config.auth,
            sessionTimeout: parseInt(process.env.SOC2_SESSION_TIMEOUT || '480'),
            maxLoginAttempts: parseInt(process.env.SOC2_MAX_LOGIN_ATTEMPTS || '5'),
            passwordPolicy: {
                ...defaultSOC2Config.auth.passwordPolicy,
                minLength: parseInt(process.env.SOC2_PASSWORD_MIN_LENGTH || '12'),
                maxAge: parseInt(process.env.SOC2_PASSWORD_MAX_AGE || '90')
            },
            mfa: {
                ...defaultSOC2Config.auth.mfa,
                enabled: process.env.SOC2_MFA_ENABLED === 'true',
                requiredForAdmin: process.env.SOC2_MFA_REQUIRED_ADMIN === 'true'
            }
        },
        
        audit: {
            ...defaultSOC2Config.audit,
            enabled: process.env.SOC2_AUDIT_ENABLED !== 'false',
            retentionDays: parseInt(process.env.SOC2_AUDIT_RETENTION_DAYS || '2555'),
            logLevel: (process.env.SOC2_AUDIT_LOG_LEVEL as any) || 'high'
        },
        
        dataProtection: {
            ...defaultSOC2Config.dataProtection,
            classification: {
                ...defaultSOC2Config.dataProtection.classification,
                enabled: process.env.SOC2_DATA_CLASSIFICATION_ENABLED !== 'false'
            },
            retention: {
                ...defaultSOC2Config.dataProtection.retention,
                enabled: process.env.SOC2_DATA_RETENTION_ENABLED !== 'false'
            }
        },
        
        monitoring: {
            ...defaultSOC2Config.monitoring,
            enabled: process.env.SOC2_MONITORING_ENABLED !== 'false',
            realTimeAlerts: process.env.SOC2_REALTIME_ALERTS !== 'false'
        },
        
        incidentResponse: {
            ...defaultSOC2Config.incidentResponse,
            enabled: process.env.SOC2_INCIDENT_RESPONSE_ENABLED !== 'false',
            autoEscalation: process.env.SOC2_AUTO_ESCALATION !== 'false'
        },
        
        backup: {
            ...defaultSOC2Config.backup,
            enabled: process.env.SOC2_BACKUP_ENABLED !== 'false',
            encryption: process.env.SOC2_BACKUP_ENCRYPTION !== 'false'
        },
        
        vulnerabilityManagement: {
            ...defaultSOC2Config.vulnerabilityManagement,
            enabled: process.env.SOC2_VULNERABILITY_MANAGEMENT_ENABLED !== 'false',
            autoRemediation: process.env.SOC2_AUTO_REMEDIATION === 'true'
        }
    }
}

export const validateSOC2Config = (config: SOC2ComplianceConfig): string[] => {
    const errors: string[] = []
    
    // Validate auth configuration
    if (config.auth.sessionTimeout < 15) {
        errors.push('Session timeout must be at least 15 minutes')
    }
    
    if (config.auth.maxLoginAttempts < 3) {
        errors.push('Max login attempts must be at least 3')
    }
    
    if (config.auth.passwordPolicy.minLength < 8) {
        errors.push('Password minimum length must be at least 8 characters')
    }
    
    // Validate audit configuration
    if (config.audit.retentionDays < 365) {
        errors.push('Audit retention must be at least 365 days for SOC 2 compliance')
    }
    
    // Validate data protection configuration
    if (config.dataProtection.retention.defaultRetentionDays < 365) {
        errors.push('Data retention must be at least 365 days for SOC 2 compliance')
    }
    
    // Validate monitoring configuration
    if (config.monitoring.alertThresholds.failedLogins < 5) {
        errors.push('Failed login alert threshold must be at least 5')
    }
    
    // Validate incident response configuration
    if (config.incidentResponse.responseTimeMinutes > 60) {
        errors.push('Incident response time should not exceed 60 minutes')
    }
    
    // Validate backup configuration
    if (config.backup.retentionDays < 365) {
        errors.push('Backup retention must be at least 365 days for SOC 2 compliance')
    }
    
    return errors
} 