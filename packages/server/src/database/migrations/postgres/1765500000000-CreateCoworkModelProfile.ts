import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCoworkModelProfile1765500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_model_profile'))) {
            await queryRunner.query(`
                CREATE TABLE "cowork_model_profile" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "provider" varchar(255) NOT NULL,
                    "modelName" varchar(255) NOT NULL,
                    "inputCostPer1kTokens" double precision NOT NULL DEFAULT 0,
                    "outputCostPer1kTokens" double precision NOT NULL DEFAULT 0,
                    "contextWindowTokens" integer NOT NULL,
                    "supportsVision" boolean NOT NULL DEFAULT false,
                    "supportsFunctionCalling" boolean NOT NULL DEFAULT false,
                    "isAvailable" boolean NOT NULL DEFAULT true,
                    "isLocal" boolean NOT NULL DEFAULT false,
                    "avgLatencyMs" integer,
                    "reliabilityScore" double precision NOT NULL DEFAULT 1,
                    "ollamaEndpoint" varchar(255),
                    "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedDate" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_cowork_model_profile_id" PRIMARY KEY ("id")
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
