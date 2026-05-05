import { Variable } from '../../database/entities/Variable';
import { QueryRunner } from 'typeorm';
declare const _default: {
    createVariable: (newVariable: Variable) => Promise<Variable>;
    deleteVariable: (variableId: string) => Promise<any>;
    getAllVariables: (tenantId: any) => Promise<Variable[]>;
    getVariableById: (variableId: string) => Promise<Variable | null>;
    updateVariable: (variable: Variable, updatedVariable: Variable) => Promise<Variable>;
    importVariables: (newVariables: Partial<Variable>[], queryRunner?: QueryRunner) => Promise<any>;
};
export default _default;
