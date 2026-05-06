import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCoworkModelProfile1765500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_model_profile'))) {
            await queryRunner.query(`
                CREATE TABLE "cowork_model_profile" (
                    "id" varchar PRIMARY KEY NOT NULL,
                    "provider" varchar NOT NULL,
                    "modelName" varchar NOT NULL,
                    "inputCostPer1kTokens" float NOT NULL DEFAULT 0,
                    "outputCostPer1kTokens" float NOT NULL DEFAULT 0,
                    "contextWindowTokens" integer NOT NULL,
                    "supportsVision" integer NOT NULL DEFAULT 0,
                    "supportsFunctionCalling" integer NOT NULL DEFAULT 0,
                    "isAvailable" integer NOT NULL DEFAULT 1,
                    "isLocal" integer NOT NULL DEFAULT 0,
                    "avgLatencyMs" integer,
                    "reliabilityScore" float NOT NULL DEFAULT 1,
                    "ollamaEndpoint" varchar,
                    "createdDate" datetime NOT NULL DEFAULT (datetime('now')),
                    "updatedDate" datetime NOT NULL DEFAULT (datetime('now'))
                );
            `)
            await queryRunner.query(
                'CREATE INDEX "IDX_cowork_model_profile_provider_modelName" ON "cowork_model_profile" ("provider", "modelName");'
            )
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('cowork_model_profile')) {
            await queryRunner.query('DROP TABLE "cowork_model_profile";')
        }
    }
}
