import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm'

export enum AuditAction {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
    EXPORT = 'export',
    IMPORT = 'import',
    ACCESS_DENIED = 'access_denied'
}

export enum AuditSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

@Entity()
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: true })
    @Index()
    userId: string

    @Column({ nullable: true })
    userEmail: string

    @Column({
        type: 'enum',
        enum: AuditAction
    })
    action: AuditAction

    @Column()
    resource: string

    @Column({ nullable: true })
    resourceId: string

    @Column('text')
    details: string

    @Column()
    ipAddress: string

    @Column({ nullable: true })
    userAgent: string

    @Column({
        type: 'enum',
        enum: AuditSeverity,
        default: AuditSeverity.LOW
    })
    severity: AuditSeverity

    @Column({ nullable: true })
    sessionId: string

    @Column({ nullable: true })
    tenantId: string

    @Column({ default: false })
    isSuccessful: boolean

    @Column({ nullable: true })
    errorMessage: string

    @Column({ nullable: true })
    requestId: string

    @CreateDateColumn()
    @Index()
    timestamp: Date
} 