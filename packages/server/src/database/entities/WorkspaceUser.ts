import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'workspace_users' })
export class WorkspaceUser {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    workspace_id: string

    @Column()
    user_id: string

    @Column()
    role: string
}
