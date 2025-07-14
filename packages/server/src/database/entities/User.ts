import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    READONLY = 'readonly'
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    @Index()
    email: string

    @Column()
    passwordHash: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    status: UserStatus

    @Column({ nullable: true })
    lastLoginAt: Date

    @Column({ nullable: true })
    passwordChangedAt: Date

    @Column({ default: false })
    requirePasswordChange: boolean

    @Column({ nullable: true })
    mfaEnabled: boolean

    @Column({ nullable: true })
    mfaSecret: string

    @Column({ nullable: true })
    tenantId: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @Column({ nullable: true })
    createdBy: string

    @Column({ nullable: true })
    updatedBy: string
} 