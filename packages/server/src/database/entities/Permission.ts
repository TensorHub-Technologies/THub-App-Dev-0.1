import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity()
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    @Index()
    name: string

    @Column()
    resource: string

    @Column()
    action: string

    @Column({ nullable: true })
    description: string

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