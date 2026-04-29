export interface TaskNode {
    id: string

    name: string

    description: string
    agentPersona: 'coder' | 'researcher' | 'analyst' | 'reviewer' | 'architect' | 'writer'

    dependencies: string[] // task IDs that must complete before this one

    outputSchema?: string // expected output format description

    status: 'pending' | 'ready' | 'running' | 'completed' | 'failed'
}

export interface TaskDAG {
    goal: string

    tasks: TaskNode[]

    sessionId?: string
}

export interface CoworkJobData {
    jobType: 'cowork-task' | 'legacy-scheduler'

    sessionId: string

    taskId: string

    tenantId: string

    payload: Record<string, any>

    retryCount?: number
}

export interface TaskOutput {
    taskId: string

    type: 'text' | 'code' | 'markdown' | 'json'

    content: string

    language?: string

    tokensUsed?: number

    costUsd?: number

    latencyMs?: number

    model?: string
}

export interface CoworkSessionState {
    sessionId: string

    goal: string

    completedTaskOutputs: Record<string, TaskOutput>

    sharedMemory: Record<string, any>
}

export const SUBSCRIPTION_LIMITS: Record<string, { sessionsPerMonth: number; maxTasksPerSession: number }> = {
    free: { sessionsPerMonth: 3, maxTasksPerSession: 5 },

    pro: { sessionsPerMonth: Infinity, maxTasksPerSession: 20 },

    enterprise: { sessionsPerMonth: Infinity, maxTasksPerSession: 50 }
}
