import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { IExecution, ExecutionState } from '../../Interface'
import { ChatFlow } from './ChatFlow'

@Entity()
@Index('IDX_EXECUTION_SESSION_AGENTFLOW', ['sessionId', 'agentflowId', 'createdDate'])
export class Execution implements IExecution {
    @PrimaryGeneratedColumn('uuid')
    id: string

    /* ================= EXECUTION DATA (EMOJI SAFE) ================= */
    @Column({
        type: 'longtext',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        //doing falsi because it was downloading the files before making chat history loding time long
        select: false
    })
    executionData: string

    /* ================= STATUS ================= */
    @Column({
        type: 'varchar',
        length: 50
    })
    state: ExecutionState

    /* ================= RELATIONS ================= */
    @Index()
    @Column({ type: 'uuid' })
    agentflowId: string

    @ManyToOne(() => ChatFlow)
    @JoinColumn({ name: 'agentflowId' })
    agentflow: ChatFlow

    /* ================= SESSION ================= */
    @Index()
    @Column({
        type: 'varchar',
        length: 255,
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci'
    })
    sessionId: string

    /* ================= OPTIONAL METADATA ================= */
    @Column({
        type: 'text',
        nullable: true,
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci'
    })
    action?: string

    @Column({ type: 'boolean', nullable: true })
    isPublic?: boolean

    @Column({ type: 'varchar', length: 255, nullable: true })
    tenantId?: string

    /* ================= TOKENS ================= */
    @Column({ type: 'int', nullable: true })
    total_tokens?: number

    @Column({ type: 'json', nullable: true })
    agentTokens?: any

    /* ================= TIMING ================= */
    @Column({ type: 'int', nullable: true })
    total_time?: number

    @CreateDateColumn({ type: 'timestamp' })
    createdDate: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedDate: Date

    @Column({ type: 'timestamp', nullable: true })
    stoppedDate: Date
}
