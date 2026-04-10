import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'workspace_invites' })
export class WorkspaceInvite {
    @PrimaryColumn()
    id: string

    @Column()
    email: string

    @Column()
    workspace_id: string

    @Column()
    workspace_name: string

    @Column()
    role: string

    @Column({ unique: true })
    token: string

    @Column()
    invited_by: string

    @Column({ type: 'timestamp' })
    expires_at: Date

    @Column({ default: false })
    used: boolean
}
