import { RedisOptions } from 'bullmq'
import { BaseQueue } from './BaseQueue'
import logger from '../utils/logger'

type CoworkJobData = {
    jobType?: string
    type?: string
    [key: string]: unknown
}

export class CoworkQueue extends BaseQueue {
    private queueName: string

    constructor(name: string, connection: RedisOptions) {
        super(name, connection)
        this.queueName = name
    }

    public getQueueName() {
        return this.queueName
    }

    public getQueue() {
        return this.queue
    }

    async processJob(data: CoworkJobData) {
        const jobType = String(data?.jobType || data?.type || '').trim()

        if (jobType === 'cowork-task') {
            logger.info('Processing cowork-task job...')
            return { processed: true, jobType: 'cowork-task' }
        }

        if (jobType === 'legacy-scheduler') {
            logger.info('Processing legacy-scheduler job...')
            return { processed: true, jobType: 'legacy-scheduler' }
        }

        throw new Error(`Unsupported cowork job type: ${jobType || 'unknown'}`)
    }
}
