import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixCoworkPromptColumns1765300000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_prompt'))) return

        if (!(await queryRunner.hasColumn('cowork_prompt', 'variableMappings'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "variableMappings" text;')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'targetModel'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "targetModel" varchar(255);')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'tenantId'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "tenantId" varchar(255);')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'version'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "version" integer NOT NULL DEFAULT 1;')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'isDefault'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "isDefault" boolean NOT NULL DEFAULT false;')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'createdDate'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "createdDate" TIMESTAMP NOT NULL DEFAULT now();')
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'updatedDate'))) {
            await queryRunner.query('ALTER TABLE "cowork_prompt" ADD COLUMN "updatedDate" TIMESTAMP NOT NULL DEFAULT now();')
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
