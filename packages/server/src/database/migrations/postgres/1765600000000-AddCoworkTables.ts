import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCoworkTables1765600000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cowork_session" (
                "id"                varchar(36) PRIMARY KEY NOT NULL,
                "tenantId"          varchar(255) NOT NULL,
                "userId"            varchar(255) NOT NULL,
                "goal"              text NOT NULL,
                "status"            varchar(50) NOT NULL DEFAULT 'pending',
                "selectedChatModel" text,
                "totalTokensUsed"   integer,
                "totalCostUsd"      double precision,
                "maxTokenBudget"    integer,
                "maxCostBudget"     double precision,
                "errorMessage"      text,
                "createdDate"       timestamp NOT NULL DEFAULT now(),
                "updatedDate"       timestamp NOT NULL DEFAULT now(),
                "completedDate"     timestamp
            );
        `)
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_cowork_session_tenant_status" ON "cowork_session" ("tenantId", "status");`)
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_cowork_session_tenant_created" ON "cowork_session" ("tenantId", "createdDate");`
        )

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cowork_task" (
                "id"                 varchar(36) PRIMARY KEY NOT NULL,
                "sessionId"          varchar(36) NOT NULL,
                "name"               varchar(255) NOT NULL,
                "description"        text,
                "agentPersona"       varchar(50),
                "status"             varchar(50) NOT NULL DEFAULT 'pending',
                "dependencies"       text,
                "inputContext"       text,
                "outputArtifact"     text,
                "systemPrompt"       text,
                "skillId"            varchar(36),
                "bullJobId"          varchar(255),
                "tokensUsed"         integer,
                "costUsd"            double precision,
                "latencyMs"          integer,
                "model"              varchar(255),
                "retryCount"         integer NOT NULL DEFAULT 0,
                "errorMessage"       text,
                "humanInputRequired" boolean NOT NULL DEFAULT false,
                "pendingAction"      text,
                "createdDate"        timestamp NOT NULL DEFAULT now(),
                "updatedDate"        timestamp NOT NULL DEFAULT now(),
                "startedDate"        timestamp,
                "completedDate"      timestamp,
                CONSTRAINT "FK_cowork_task_session"
                    FOREIGN KEY ("sessionId") REFERENCES "cowork_session"("id")
            );
        `)
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_cowork_task_session_status" ON "cowork_task" ("sessionId", "status");`)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cowork_skill" (
                "id"                  varchar(36) PRIMARY KEY NOT NULL,
                "name"                varchar(255) NOT NULL,
                "description"         text,
                "category"            varchar(50),
                "systemPrompt"        text NOT NULL,
                "requiredTools"       text,
                "preferredModel"      varchar(255),
                "historicSuccessRate" double precision NOT NULL DEFAULT 0,
                "avgCost"             double precision,
                "avgLatencyMs"        integer,
                "usageCount"          integer NOT NULL DEFAULT 0,
                "tenantId"            varchar(255),
                "isPublic"            boolean NOT NULL DEFAULT false,
                "tags"                text,
                "createdDate"         timestamp NOT NULL DEFAULT now(),
                "updatedDate"         timestamp NOT NULL DEFAULT now()
            );
        `)
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_cowork_skill_category_rate" ON "cowork_skill" ("category", "historicSuccessRate");`
        )

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cowork_prompt" (
                "id"               varchar(36) PRIMARY KEY NOT NULL,
                "persona"          varchar(50) NOT NULL,
                "templateContent"  text NOT NULL,
                "variableMappings" text,
                "targetModel"      varchar(255),
                "version"          integer NOT NULL DEFAULT 1,
                "avgSuccessRate"   double precision NOT NULL DEFAULT 0,
                "isDefault"        boolean NOT NULL DEFAULT false,
                "tenantId"         varchar(255),
                "createdDate"      timestamp NOT NULL DEFAULT now()
            );
        `)
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_cowork_prompt_persona_default" ON "cowork_prompt" ("persona", "isDefault");`
        )
        // cowork_prompt may have been created by CreateCoworkPrompt1765300000000 without avgSuccessRate
        if (!(await queryRunner.hasColumn('cowork_prompt', 'avgSuccessRate'))) {
            await queryRunner.query(`ALTER TABLE "cowork_prompt" ADD COLUMN "avgSuccessRate" double precision NOT NULL DEFAULT 0;`)
        }

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "analytics_event" (
                "id"          varchar(36) PRIMARY KEY NOT NULL,
                "eventType"   varchar(100) NOT NULL,
                "tenantId"    varchar(255),
                "userId"      varchar(255),
                "tokensUsed"  integer,
                "costUsd"     double precision,
                "latencyMs"   integer,
                "model"       varchar(255),
                "metadata"    text,
                "createdDate" timestamp NOT NULL DEFAULT now()
            );
        `)
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_analytics_event_tenant_type_date" ON "analytics_event" ("tenantId", "eventType", "createdDate");`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "analytics_event";`)
        await queryRunner.query(`DROP TABLE IF EXISTS "cowork_prompt";`)
        await queryRunner.query(`DROP TABLE IF EXISTS "cowork_skill";`)
        await queryRunner.query(`DROP TABLE IF EXISTS "cowork_task";`)
        await queryRunner.query(`DROP TABLE IF EXISTS "cowork_session";`)
    }
}
