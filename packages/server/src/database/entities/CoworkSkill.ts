import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class CoworkSkill {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ type: 'text', nullable: true })
    description: string | null

    @Column({ type: 'varchar', nullable: true })
    category: string | null // 'coding' | 'research' | 'analysis' | 'writing' | 'data'

    @Column({ type: 'text' })
    systemPrompt: string // prompt template that worked

    @Column({ type: 'text', nullable: true })
    requiredTools: string | null // JSON: string[]

    @Column({ type: 'varchar', nullable: true })
    preferredModel: string | null

    @Column({ type: 'float', default: 0 })
    historicSuccessRate: number // 0.0 - 1.0

    @Column({ type: 'float', nullable: true })
    avgCost: number | null

    @Column({ type: 'int', nullable: true })
    avgLatencyMs: number | null

    @Column({ default: 0 })
    usageCount: number

    @Column({ type: 'varchar', nullable: true })
    tenantId: string | null

    @Column({ default: false })
    isPublic: boolean // available in marketplace

    @Column({ type: 'text', nullable: true })
    tags: string | null // JSON: string[]

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
}
