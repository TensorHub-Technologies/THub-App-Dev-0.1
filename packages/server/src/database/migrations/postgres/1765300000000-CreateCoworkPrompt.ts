import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCoworkPrompt1765300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_prompt'))) {
            await queryRunner.query(`
                CREATE TABLE "cowork_prompt" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "persona" varchar(255) NOT NULL,
                    "templateContent" text NOT NULL,
                    "variableMappings" text,
                    "targetModel" varchar(255),
                    "tenantId" varchar(255),
                    "version" integer NOT NULL DEFAULT 1,
                    "isDefault" boolean NOT NULL DEFAULT false,
                    "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedDate" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_cowork_prompt_id" PRIMARY KEY ("id")
                );
            `)
            await queryRunner.query('CREATE INDEX "IDX_cowork_prompt_persona" ON "cowork_prompt" ("persona");')
            await queryRunner.query('CREATE INDEX "IDX_cowork_prompt_persona_isDefault" ON "cowork_prompt" ("persona", "isDefault");')
        } else {
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('cowork_prompt')) {
            await queryRunner.query('DROP TABLE "cowork_prompt";')
        }
    }
}
