import { RedisOptions } from 'bullmq'
import { BaseQueue } from './BaseQueue'
import logger from '../utils/logger'
import type { CoworkJobData } from '../services/cowork/CoworkTypes'

type QueueCoworkJobData = Partial<CoworkJobData> & {
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

    async processJob(data: QueueCoworkJobData) {
        const jobType = String(data?.jobType || data?.type || '').trim()

        if (jobType === 'cowork-task') {
            return this.processCoworkTask(data)
        }

        if (jobType === 'legacy-scheduler') {
            return this.processLegacySchedulerJob(data)
        }

        throw new Error(`Unsupported cowork job type: ${jobType || 'unknown'}`)
    }

    private async processCoworkTask(data: QueueCoworkJobData) {
        const sessionId = String(data.sessionId || '').trim()
        const taskId = String(data.taskId || '').trim()

        if (!sessionId || !taskId) {
            throw new Error('Invalid cowork-task payload: sessionId and taskId are required')
        }

        logger.info(`Processing cowork-task job for taskId: ${taskId}`)
        try {
            const { executeCoworkTask } = await import('../services/cowork/CoworkExecutor')
            await executeCoworkTask(sessionId, taskId)
            return { processed: true, jobType: 'cowork-task', sessionId, taskId }
        } catch (error) {
            logger.error(`Failed to process cowork-task: ${error}`)
            throw error
        }
    }

    private async processLegacySchedulerJob(data: QueueCoworkJobData) {
        logger.info('Processing legacy-scheduler job...')
        return {
            processed: true,
            jobType: 'legacy-scheduler',
            sessionId: data.sessionId || null,
            taskId: data.taskId || null
        }
    }
}
