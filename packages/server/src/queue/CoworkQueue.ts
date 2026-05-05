import { RedisOptions } from 'bullmq'
import { BaseQueue } from './BaseQueue'
import logger from '../utils/logger'
import { createCoworkOrchestrator } from '../services/cowork/orchestrator'

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
            const sessionId = String(data?.sessionId || '')
            const taskId = String(data?.taskId || '')
            if (!sessionId || !taskId) {
                throw new Error('Missing sessionId/taskId for cowork-task job')
            }

            logger.info(`Processing cowork-task job session=${sessionId} task=${taskId}`)
            const orchestrator = createCoworkOrchestrator()
            await orchestrator.executeCoworkTask(sessionId, taskId)
            return { processed: true, jobType: 'cowork-task', sessionId, taskId }
        }

        if (jobType === 'legacy-scheduler') {
            logger.info('Processing legacy-scheduler job...')
            return { processed: true, jobType: 'legacy-scheduler' }
        }

        throw new Error(`Unsupported cowork job type: ${jobType || 'unknown'}`)
    }
}
