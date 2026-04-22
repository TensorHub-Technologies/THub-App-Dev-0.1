import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class CoworkPrompt {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    persona: string

    @Column({ type: 'text' })
    templateContent: string

    @Column({ nullable: true, type: 'text' })
    variableMappings: string | null

    @Column({ nullable: true, type: 'varchar' })
    targetModel: string | null

    @Column({ nullable: true, type: 'varchar' })
    tenantId: string | null

    @Column({ default: 1 })
    version: number

    @Column({ default: false })
    isDefault: boolean

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date
}
