import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class CoworkModelProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    provider: string // 'openai' | 'anthropic' | 'google' | 'ollama' | 'groq'

    @Column()
    modelName: string // 'gpt-4o' | 'claude-3-5-sonnet' | 'llama3' etc.

    @Column({ type: 'float', default: 0 })
    inputCostPer1kTokens: number // USD

    @Column({ type: 'float', default: 0 })
    outputCostPer1kTokens: number // USD

    @Column({ type: 'int' })
    contextWindowTokens: number // max tokens this model accepts

    @Column({ default: false })
    supportsVision: boolean

    @Column({ default: false })
    supportsFunctionCalling: boolean

    @Column({ default: true })
    isAvailable: boolean

    @Column({ default: false })
    isLocal: boolean // true = Ollama / local model, no API cost

    @Column({ type: 'int', nullable: true })
    avgLatencyMs: number // updated from analytics

    @Column({ type: 'float', default: 1.0 })
    reliabilityScore: number // 0.0-1.0, updated on fallback events

    @Column({ nullable: true })
    ollamaEndpoint: string // only set when isLocal=true

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
}
