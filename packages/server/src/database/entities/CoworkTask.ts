import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { CoworkSession } from './CoworkSession'
import { CoworkTaskStatus } from '../../Interface'

@Entity()
export class CoworkTask {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    sessionId: string

    @ManyToOne(() => CoworkSession)
    @JoinColumn({ name: 'sessionId' })
    session: CoworkSession

    @Column()
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ type: 'text', nullable: true })
    agentPersona: string // 'coder' | 'researcher' | 'analyst' | 'reviewer' | 'architect'

    @Column({ default: 'pending' })
    status: CoworkTaskStatus

    @Column({ type: 'text', nullable: true })
    dependencies: string // JSON: string[] of task IDs

    @Column({ type: 'text', nullable: true })
    inputContext: string // JSON: injected outputs from dependencies

    @Column({ type: 'text', nullable: true })
    outputArtifact: string // JSON: { type: 'text' | 'code' | 'data', content: string }

    @Column({ type: 'text', nullable: true })
    systemPrompt: string

    @Column({ nullable: true })
    skillId: string // reference to CoworkSkill

    @Column({ nullable: true })
    bullJobId: string // BullMQ job ID

    @Column({ type: 'int', nullable: true })
    tokensUsed: number

    @Column({ type: 'float', nullable: true })
    costUsd: number

    @Column({ type: 'int', nullable: true })
    latencyMs: number

    @Column({ nullable: true })
    model: string // model used

    @Column({ default: 0 })
    retryCount: number

    @Column({ type: 'text', nullable: true })
    errorMessage: string

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @Column({ nullable: true, type: 'timestamp' })
    startedDate: Date

    @Column({ nullable: true, type: 'timestamp' })
    completedDate: Date
}
