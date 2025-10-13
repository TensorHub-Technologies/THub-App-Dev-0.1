/* eslint-disable */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { IAgentCards } from '../../Interface'

@Entity()
export class AgentCards implements IAgentCards {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 36, default: '' })
    workflow_id: string

    @Column({ type: 'boolean', default: false })
    is_agent_enabled: boolean

    @Column({ type: 'varchar', length: 10, default: '1.0' })
    protocol_version: string

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ type: 'varchar', length: 20, nullable: true })
    version: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    provider_organization?: string

    @Column({ type: 'varchar', length: 500, nullable: true })
    provider_url?: string

    @Column({ type: 'boolean', default: false })
    capabilities_streaming: boolean

    @Column({ type: 'boolean', default: false })
    capabilities_push_notifications: boolean

    @Column({ type: 'boolean', default: false })
    capabilities_state_transition_history: boolean

    @Column({ type: 'varchar', length: 255, nullable: true })
    authentication?: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    security_schemes?: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    security?: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    default_input_modes?: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    default_output_modes?: string

    @Column({ type: 'boolean', default: false })
    supports_authenticated_extended_card: boolean

    @Column({ type: 'text', default: false })
    prompt: string
}
