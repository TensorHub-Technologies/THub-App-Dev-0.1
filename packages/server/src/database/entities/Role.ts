import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity()
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    @Index()
    name: string

    @Column({ nullable: true })
    description: string

    @Column('text')
    permissions: string // JSON array of permissions

    @Column({ default: true })
    isActive: boolean

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