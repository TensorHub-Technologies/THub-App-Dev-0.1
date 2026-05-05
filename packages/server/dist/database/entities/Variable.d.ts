import { IVariable } from '../../Interface';
export declare class Variable implements IVariable {
    id: string;
    name: string;
    tenantId: string;
    value: string;
    type: string;
    createdDate: Date;
    updatedDate: Date;
}
