import { IAgentCardSkills } from '../../Interface'
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class AgentCardSkills implements IAgentCardSkills {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'int' })
    agent_card_id: number

    @Column({ type: 'varchar', length: 100 })
    skill_id: string

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({ type: 'text', nullable: true })
    description?: string

    @Column({ type: 'varchar', length: 500, nullable: true })
    tags?: string

    @Column({ type: 'text', nullable: true })
    examples?: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    input_modes?: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    output_modes?: string
}
