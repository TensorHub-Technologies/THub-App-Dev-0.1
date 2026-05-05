import { EvaluatorDTO } from '../../Interface.Evaluation';
declare const _default: {
    getAllEvaluators: (page?: number, limit?: number, tenantId?: string) => Promise<EvaluatorDTO[] | {
        total: number;
        data: EvaluatorDTO[];
    }>;
    getEvaluator: (id: string, tenantId?: string) => Promise<EvaluatorDTO>;
    createEvaluator: (body: any) => Promise<EvaluatorDTO>;
    updateEvaluator: (id: string, body: any) => Promise<EvaluatorDTO>;
    deleteEvaluator: (id: string, tenantId?: string) => Promise<import("typeorm").DeleteResult>;
};
export default _default;
