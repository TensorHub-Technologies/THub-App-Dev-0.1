import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTenantIdToDataset1761100000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const datasetTenantColumnExists = await queryRunner.hasColumn('dataset', 'tenantId')
        if (!datasetTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE "dataset" ADD COLUMN "tenantId" varchar;`)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const datasetTenantColumnExists = await queryRunner.hasColumn('dataset', 'tenantId')
        if (datasetTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE "dataset" DROP COLUMN "tenantId";`)
        }
    }
}
