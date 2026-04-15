import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { IEvaluation } from '../../Interface.js'

@Entity()
export class Evaluation implements IEvaluation {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: true })
    tenantId?: string

    @Column({ type: 'text' })
    average_metrics: string

    @Column({ type: 'text' })
    additionalConfig: string

    @Column()
    name: string

    @Column()
    evaluationType: string

    @Column()
    chatflowId: string

    @Column()
    chatflowName: string

    @Column()
    datasetId: string

    @Column()
    datasetName: string

    @Column()
    status: string

    @UpdateDateColumn()
    runDate: Date
}
