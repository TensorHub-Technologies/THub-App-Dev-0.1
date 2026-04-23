import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCoworkPrompt1765300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_prompt'))) {
            await queryRunner.query(`
                CREATE TABLE "cowork_prompt" (
                    "id" varchar PRIMARY KEY NOT NULL,
                    "persona" varchar NOT NULL,
                    "templateContent" text NOT NULL,
                    "variableMappings" text,
                    "targetModel" varchar,
                    "tenantId" varchar,
                    "version" integer NOT NULL DEFAULT 1,
                    "isDefault" integer NOT NULL DEFAULT 0,
                    "createdDate" datetime NOT NULL DEFAULT (datetime('now')),
                    "updatedDate" datetime NOT NULL DEFAULT (datetime('now'))
                );
            `)
            await queryRunner.query('CREATE INDEX "IDX_cowork_prompt_persona" ON "cowork_prompt" ("persona");')
            await queryRunner.query('CREATE INDEX "IDX_cowork_prompt_persona_isDefault" ON "cowork_prompt" ("persona", "isDefault");')
        } else {
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
                await queryRunner.query(
                    'ALTER TABLE "cowork_prompt" ADD COLUMN "createdDate" datetime NOT NULL DEFAULT (datetime(\'now\'));'
                )
            }
            if (!(await queryRunner.hasColumn('cowork_prompt', 'updatedDate'))) {
                await queryRunner.query(
                    'ALTER TABLE "cowork_prompt" ADD COLUMN "updatedDate" datetime NOT NULL DEFAULT (datetime(\'now\'));'
                )
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('cowork_prompt')) {
            await queryRunner.query('DROP TABLE "cowork_prompt";')
        }
    }
}
