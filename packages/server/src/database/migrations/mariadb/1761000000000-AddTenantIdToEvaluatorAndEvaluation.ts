import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTenantIdToEvaluatorAndEvaluation1761000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const evaluatorTenantColumnExists = await queryRunner.hasColumn('evaluator', 'tenantId')
        if (!evaluatorTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE \`evaluator\` ADD COLUMN \`tenantId\` varchar(36) NULL;`)
        }

        const evaluationTenantColumnExists = await queryRunner.hasColumn('evaluation', 'tenantId')
        if (!evaluationTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE \`evaluation\` ADD COLUMN \`tenantId\` varchar(36) NULL;`)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const evaluatorTenantColumnExists = await queryRunner.hasColumn('evaluator', 'tenantId')
        if (evaluatorTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE \`evaluator\` DROP COLUMN \`tenantId\`;`)
        }

        const evaluationTenantColumnExists = await queryRunner.hasColumn('evaluation', 'tenantId')
        if (evaluationTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE \`evaluation\` DROP COLUMN \`tenantId\`;`)
        }
    }
}
