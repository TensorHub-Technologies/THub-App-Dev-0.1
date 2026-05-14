import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCoworkTables1765600000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cowork_session" (
                "id"                varchar PRIMARY KEY NOT NULL,
                "tenantId"           varchar NOT NULL,
                "userId"             varchar NOT NULL,
                "goal"               text NOT NULL,
                "status"             varchar NOT NULL DEFAULT 'pending',
                "selectedChatModel"  text,
                "totalTokensUsed"    integer,
                "totalCostUsd"       real,
                "maxTokenBudget"     integer,
                "maxCostBudget"      real,
                "errorMessage"       text,
                "createdDate"        datetime NOT NULL DEFAULT (datetime('now')),
                "updatedDate"        datetime NOT NULL DEFAULT (datetime('now')),
                "completedDate"      datetime
            );
        `)
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_cowork_session_tenant_status" ON "cowork_session" ("tenantId", "status");`)
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_cowork_session_tenant_created" ON "cowork_session" ("tenantId", "createdDate");`
        )

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cowork_task" (
                "id"                  varchar PRIMARY KEY NOT NULL,
                "sessionId"           varchar NOT NULL,
                "name"                varchar NOT NULL,
                "description"         text,
                "agentPersona"        varchar,
                "status"              varchar NOT NULL DEFAULT 'pending',
                "dependencies"        text,
                "inputContext"        text,
                "outputArtifact"      text,
                "systemPrompt"        text,
                "skillId"             varchar,
                "bullJobId"           varchar,
                "tokensUsed"          integer,
                "costUsd"             real,
                "latencyMs"           integer,
                "model"               varchar,
                "retryCount"          integer NOT NULL DEFAULT 0,
                "errorMessage"        text,
                "humanInputRequired"  integer NOT NULL DEFAULT 0,
                "pendingAction"       text,
                "createdDate"         datetime NOT NULL DEFAULT (datetime('now')),
                "updatedDate"         datetime NOT NULL DEFAULT (datetime('now')),
                "startedDate"         datetime,
                "completedDate"       datetime,
                FOREIGN KEY ("sessionId") REFERENCES "cowork_session"("id")
            );
        `)
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_cowork_task_session_status" ON "cowork_task" ("sessionId", "status");`)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cowork_skill" (
                "id"                   varchar PRIMARY KEY NOT NULL,
                "name"                 varchar NOT NULL,
                "description"          text,
                "category"             varchar,
                "systemPrompt"         text NOT NULL,
                "requiredTools"        text,
                "preferredModel"       varchar,
                "historicSuccessRate"  real NOT NULL DEFAULT 0,
                "avgCost"              real,
                "avgLatencyMs"         integer,
                "usageCount"           integer NOT NULL DEFAULT 0,
                "tenantId"             varchar,
                "isPublic"             integer NOT NULL DEFAULT 0,
                "tags"                 text,
                "createdDate"          datetime NOT NULL DEFAULT (datetime('now')),
                "updatedDate"          datetime NOT NULL DEFAULT (datetime('now'))
            );
        `)
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_cowork_skill_category_rate" ON "cowork_skill" ("category", "historicSuccessRate");`
        )

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cowork_prompt" (
                "id"               varchar PRIMARY KEY NOT NULL,
                "persona"          varchar NOT NULL,
                "templateContent"  text NOT NULL,
                "variableMappings" text,
                "targetModel"      varchar,
                "version"          integer NOT NULL DEFAULT 1,
                "avgSuccessRate"   real NOT NULL DEFAULT 0,
                "isDefault"        integer NOT NULL DEFAULT 0,
                "tenantId"         varchar,
                "createdDate"      datetime NOT NULL DEFAULT (datetime('now'))
            );
        `)
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_cowork_prompt_persona_default" ON "cowork_prompt" ("persona", "isDefault");`
        )
        // cowork_prompt may have been created by CreateCoworkPrompt1765300000000 without avgSuccessRate
        if (!(await queryRunner.hasColumn('cowork_prompt', 'avgSuccessRate'))) {
            await queryRunner.query(`ALTER TABLE "cowork_prompt" ADD COLUMN "avgSuccessRate" real NOT NULL DEFAULT 0;`)
        }

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "analytics_event" (
                "id"          varchar PRIMARY KEY NOT NULL,
                "eventType"   varchar NOT NULL,
                "tenantId"    varchar,
                "userId"      varchar,
                "tokensUsed"  integer,
                "costUsd"     real,
                "latencyMs"   integer,
                "model"       varchar,
                "metadata"    text,
                "createdDate" datetime NOT NULL DEFAULT (datetime('now'))
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
