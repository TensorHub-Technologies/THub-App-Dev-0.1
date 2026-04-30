import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { CoworkSessionStatus } from '../../services/cowork/status'

@Entity()
export class CoworkSession {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    tenantId: string

    @Column()
    userId: string

    @Column({ type: 'text' })
    goal: string

    @Column({ default: 'pending' })
    status: CoworkSessionStatus

    @Column({ type: 'text', nullable: true })
    selectedChatModel: string // JSON: { provider, modelName, temperature }

    @Column({ type: 'int', nullable: true })
    totalTokensUsed: number

    @Column({ type: 'float', nullable: true })
    totalCostUsd: number
    @Column({ nullable: true })
    maxTokenBudget: number

    @Column({ nullable: true, type: 'float' })
    maxCostBudget: number

    @Column({ type: 'text', nullable: true })
    errorMessage: string

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @Column({ nullable: true, type: 'timestamp' })
    completedDate: Date
}
