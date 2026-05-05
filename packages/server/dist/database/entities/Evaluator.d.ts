import { IEvaluator } from '../../Interface';
export declare class Evaluator implements IEvaluator {
    id: string;
    tenantId?: string;
    name: string;
    type: string;
    config: string;
    createdDate: Date;
    updatedDate: Date;
}
