export interface TaskOutput {
    type: 'text' | 'code' | 'data'
    content: string
    model?: string
    costUsd?: number
    latencyMs?: number
}
