import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity()
export class User {
    @PrimaryColumn()
    uid: string

    @Column()
    email: string

    @Column({ nullable: true })
    password_hash: string

    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    login_type: string

    @Column({ nullable: true })
    workspace: string

    @Column({ nullable: true })
    phone: string

    @Column({ nullable: true })
    access_token: string

    @Column({ nullable: true })
    picture: string

    @Column({ nullable: true })
    reset_token: string

    @Column({ nullable: true, type: 'timestamp' })
    reset_token_expires_at: Date

    @Column({ nullable: true })
    company: string

    @Column({ nullable: true })
    department: string

    @Column({ nullable: true })
    designation: string

    @Column({ nullable: true })
    role: string

    @Column({ nullable: true })
    workspaceUid: string

    @Column({ default: false })
    profile_completed: boolean

    @Column({ default: false })
    profile_skipped: boolean
}
