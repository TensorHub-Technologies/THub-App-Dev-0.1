import { IExecution, ExecutionState } from '../../Interface';
import { ChatFlow } from './ChatFlow';
export declare class Execution implements IExecution {
    id: string;
    executionData: string;
    state: ExecutionState;
    agentflowId: string;
    agentflow: ChatFlow;
    sessionId: string;
    action?: string;
    isPublic?: boolean;
    tenantId?: string;
    total_tokens?: number;
    agentTokens?: any;
    total_time?: number;
    createdDate: Date;
    updatedDate: Date;
    stoppedDate: Date;
}
