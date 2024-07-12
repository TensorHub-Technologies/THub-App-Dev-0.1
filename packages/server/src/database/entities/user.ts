/* eslint-disable */
import { Entity, Column } from 'typeorm'
import { IUser } from '../../Interface'

@Entity()
export class User implements IUser {
    @Column()
    uid: string

    @Column()
    email: string

    @Column()
    access_token: string

    @Column()
    login_type: string

    @Column()
    name: string

    @Column()
    picture: string

    @Column()
    encryption_key: string
}
