import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class AnalyticsEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    eventType: string // 'workflow_executed' | 'cowork_task_completed' | 'billing_usage_recorded'

    @Column({ nullable: true })
    tenantId: string

    @Column({ nullable: true })
    userId: string

    @Column({ nullable: true, type: 'int' })
    tokensUsed: number

    @Column({ nullable: true, type: 'float' })
    costUsd: number

    @Column({ nullable: true, type: 'int' })
    latencyMs: number

    @Column({ nullable: true })
    model: string

    @Column({ nullable: true, type: 'text' })
    metadata: string // JSON blob

    @CreateDateColumn()
    createdDate: Date
}
