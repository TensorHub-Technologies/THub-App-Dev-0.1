import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class CoworkSkill {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ nullable: true })
    category: string // 'coding' | 'research' | 'analysis' | 'writing' | 'data'

    @Column({ type: 'text' })
    systemPrompt: string // prompt template that worked

    @Column({ type: 'text', nullable: true })
    requiredTools: string // JSON: string[]

    @Column({ nullable: true })
    preferredModel: string

    @Column({ type: 'float', default: 0 })
    historicSuccessRate: number // 0.0 - 1.0

    @Column({ type: 'float', nullable: true })
    avgCost: number

    @Column({ type: 'int', nullable: true })
    avgLatencyMs: number

    @Column({ default: 0 })
    usageCount: number

    @Column({ nullable: true })
    tenantId: string

    @Column({ default: false })
    isPublic: boolean // available in marketplace

    @Column({ type: 'text', nullable: true })
    tags: string // JSON: string[]

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
}
