import { ICommonObject } from 'thub-components';
import { IEvaluationResult } from '../../Interface';
import { EvaluationRun } from '../../database/entities/EvaluationRun';
declare const _default: {
    createEvaluation: (body: ICommonObject, baseURL: string) => Promise<IEvaluationResult[] | {
        total: number;
        data: IEvaluationResult[];
    }>;
    getAllEvaluations: (page?: number, limit?: number, tenantId?: string) => Promise<IEvaluationResult[] | {
        total: number;
        data: IEvaluationResult[];
    }>;
    deleteEvaluation: (id: string, tenantId?: string) => Promise<{
        id: string;
        deleted: boolean;
    }>;
    getEvaluation: (id: string, tenantId?: string) => Promise<{
        versionCount: number;
        versionNo: number;
        rows: EvaluationRun[];
        id: string;
        tenantId?: string;
        average_metrics: string;
        additionalConfig: string;
        name: string;
        evaluationType: string;
        chatflowId: string;
        chatflowName: string;
        datasetId: string;
        datasetName: string;
        status: string;
        runDate: Date;
    }>;
    isOutdated: (id: string, tenantId?: string) => Promise<ICommonObject>;
    runAgain: (id: string, baseURL: string, tenantId?: string) => Promise<IEvaluationResult[] | {
        total: number;
        data: IEvaluationResult[];
    }>;
    getVersions: (id: string, tenantId?: string) => Promise<{
        versions: {
            id: string;
            runDate: Date;
            version: number;
        }[];
    }>;
    patchDeleteEvaluations: (ids?: string[], isDeleteAllVersion?: boolean, tenantId?: string) => Promise<{
        deleted: boolean;
        count: number;
    }>;
};
export default _default;
