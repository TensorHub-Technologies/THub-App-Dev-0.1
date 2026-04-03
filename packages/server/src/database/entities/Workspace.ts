import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'workspaces' })
export class Workspace {
    @PrimaryColumn()
    id: string

    @Column({ unique: true })
    name: string

    @Column({ nullable: true })
    created_by: string

    @Column({ type: 'timestamp' })
    created_at: Date
}
