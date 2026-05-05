import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixCoworkPromptColumns1765300000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_prompt'))) return

        if (!(await queryRunner.hasColumn('cowork_prompt', 'variableMappings'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "variableMappings" text;')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'targetModel'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "targetModel" varchar;')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'tenantId'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "tenantId" varchar;')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'version'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "version" integer NOT NULL DEFAULT 1;')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'isDefault'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "isDefault" integer NOT NULL DEFAULT 0;')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'createdDate'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "createdDate" datetime NOT NULL DEFAULT (datetime(\'now\'));')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'updatedDate'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "updatedDate" datetime NOT NULL DEFAULT (datetime(\'now\'));')
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
