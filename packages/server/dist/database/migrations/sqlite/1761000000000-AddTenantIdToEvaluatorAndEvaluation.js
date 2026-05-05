"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTenantIdToEvaluatorAndEvaluation1761000000000 = void 0;
class AddTenantIdToEvaluatorAndEvaluation1761000000000 {
    async up(queryRunner) {
        const evaluatorTenantColumnExists = await queryRunner.hasColumn('evaluator', 'tenantId');
        if (!evaluatorTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE "evaluator" ADD COLUMN "tenantId" varchar;`);
        }
        const evaluationTenantColumnExists = await queryRunner.hasColumn('evaluation', 'tenantId');
        if (!evaluationTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE "evaluation" ADD COLUMN "tenantId" varchar;`);
        }
    }
    async down(queryRunner) {
        const evaluatorTenantColumnExists = await queryRunner.hasColumn('evaluator', 'tenantId');
        if (evaluatorTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE "evaluator" DROP COLUMN "tenantId";`);
        }
        const evaluationTenantColumnExists = await queryRunner.hasColumn('evaluation', 'tenantId');
        if (evaluationTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE "evaluation" DROP COLUMN "tenantId";`);
        }
    }
}
exports.AddTenantIdToEvaluatorAndEvaluation1761000000000 = AddTenantIdToEvaluatorAndEvaluation1761000000000;
//# sourceMappingURL=1761000000000-AddTenantIdToEvaluatorAndEvaluation.js.map