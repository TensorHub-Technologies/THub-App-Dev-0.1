import { Execution } from '../../database/entities/Execution';
import { ExecutionState } from '../../Interface';
export interface ExecutionFilters {
    id?: string;
    agentflowId?: string;
    agentflowName?: string;
    sessionId?: string;
    state?: ExecutionState;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    tenantId?: string;
}
declare const _default: {
    getExecutionById: (executionId: string, tenantId?: string) => Promise<Execution | null>;
    getAllExecutions: (filters?: ExecutionFilters) => Promise<{
        data: Execution[];
        total: number;
    }>;
    deleteExecutions: (executionIds: string[], tenantId?: string) => Promise<{
        success: boolean;
        deletedCount: number;
    }>;
    getPublicExecutionById: (executionId: string) => Promise<Execution | null>;
    updateExecution: (executionId: string, data: Partial<Execution>, tenantId?: string) => Promise<Execution | null>;
};
export default _default;
