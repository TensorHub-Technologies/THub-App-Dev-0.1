/* eslint-disable */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'
import { ILead } from '../../Interface'

@Entity()
export class Lead implements ILead {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: true })
    name?: string

    @Column({ nullable: true })
    email?: string

    @Column({ nullable: true })
    phone?: string

    @Column({ nullable: true })
    loanType?: string

    @Column('decimal', { nullable: true })
    loanAmount?: number

    @Column({ nullable: true })
    employmentStatus?: string

    @Column({ nullable: true })
    creditScore?: string

    @Column()
    chatflowid: string

    @Column()
    chatId: string

    @CreateDateColumn()
    createdDate: Date
}
