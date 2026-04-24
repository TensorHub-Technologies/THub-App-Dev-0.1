import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class CoworkPrompt {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    persona: string
    // 'coder' | 'researcher' | 'analyst' | 'reviewer' | 'architect'

    @Column({ type: 'text' })
    templateContent: string

    @Column({ type: 'text', nullable: true })
    variableMappings: string
    // JSON: { [varName]: description }

    @Column({ nullable: true })
    targetModel: string
    // 'claude' | 'openai' | 'gemini' | null (universal)

    @Column({ default: 1 })
    version: number

    @Column({ type: 'float', default: 0 })
    avgSuccessRate: number

    @Column({ default: false })
    isDefault: boolean

    @Column({ nullable: true })
    tenantId: string // null = built-in, set = custom

    @CreateDateColumn()
    createdDate: Date
}
