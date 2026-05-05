import { Dataset } from '../../database/entities/Dataset';
import { DatasetRow } from '../../database/entities/DatasetRow';
declare const _default: {
    getAllDatasets: (page?: number, limit?: number, tenantId?: string) => Promise<Dataset[] | {
        total: number;
        data: Dataset[];
    }>;
    getDataset: (id: string, page?: number, limit?: number, tenantId?: string) => Promise<{
        rows: DatasetRow[];
        total: number;
        id: string;
        tenantId?: string;
        name: string;
        description: string;
        createdDate: Date;
        updatedDate: Date;
    }>;
    createDataset: (body: any) => Promise<Dataset>;
    updateDataset: (id: string, body: any) => Promise<Dataset>;
    deleteDataset: (id: string, tenantId?: string) => Promise<import("typeorm").DeleteResult>;
    addDatasetRow: (body: any) => Promise<DatasetRow | {
        message: string;
    }>;
    updateDatasetRow: (id: string, body: any) => Promise<DatasetRow>;
    deleteDatasetRow: (id: string) => Promise<import("typeorm").DeleteResult>;
    patchDeleteRows: (ids?: string[], tenantId?: string) => Promise<import("typeorm").DeleteResult>;
    reorderDatasetRow: (datasetId: string, rows: any[]) => Promise<{
        message: string;
    }>;
};
export default _default;
