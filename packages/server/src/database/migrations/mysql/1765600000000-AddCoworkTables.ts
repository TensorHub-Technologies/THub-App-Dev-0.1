import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCoworkTables1765600000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`cowork_session\` (
                \`id\`                varchar(36) NOT NULL,
                \`tenantId\`          varchar(255) NOT NULL,
                \`userId\`            varchar(255) NOT NULL,
                \`goal\`              text NOT NULL,
                \`status\`            varchar(50) NOT NULL DEFAULT 'pending',
                \`selectedChatModel\` text,
                \`totalTokensUsed\`   int DEFAULT NULL,
                \`totalCostUsd\`      double DEFAULT NULL,
                \`maxTokenBudget\`    int DEFAULT NULL,
                \`maxCostBudget\`     double DEFAULT NULL,
                \`errorMessage\`      text,
                \`createdDate\`       datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedDate\`       datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`completedDate\`     datetime(6) DEFAULT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `)
        await queryRunner.query(`CREATE INDEX \`IDX_cowork_session_tenant_status\` ON \`cowork_session\` (\`tenantId\`, \`status\`);`)
        await queryRunner.query(`CREATE INDEX \`IDX_cowork_session_tenant_created\` ON \`cowork_session\` (\`tenantId\`, \`createdDate\`);`)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`cowork_task\` (
                \`id\`                 varchar(36) NOT NULL,
                \`sessionId\`          varchar(36) NOT NULL,
                \`name\`               varchar(255) NOT NULL,
                \`description\`        text,
                \`agentPersona\`       varchar(50) DEFAULT NULL,
                \`status\`             varchar(50) NOT NULL DEFAULT 'pending',
                \`dependencies\`       text,
                \`inputContext\`       text,
                \`outputArtifact\`     longtext,
                \`systemPrompt\`       text,
                \`skillId\`            varchar(36) DEFAULT NULL,
                \`bullJobId\`          varchar(255) DEFAULT NULL,
                \`tokensUsed\`         int DEFAULT NULL,
                \`costUsd\`            double DEFAULT NULL,
                \`latencyMs\`          int DEFAULT NULL,
                \`model\`              varchar(255) DEFAULT NULL,
                \`retryCount\`         int NOT NULL DEFAULT 0,
                \`errorMessage\`       text,
                \`humanInputRequired\` tinyint NOT NULL DEFAULT 0,
                \`pendingAction\`      text,
                \`createdDate\`        datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedDate\`        datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`startedDate\`        datetime(6) DEFAULT NULL,
                \`completedDate\`      datetime(6) DEFAULT NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_cowork_task_session\` FOREIGN KEY (\`sessionId\`)
                    REFERENCES \`cowork_session\`(\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `)
        await queryRunner.query(`CREATE INDEX \`IDX_cowork_task_session_status\` ON \`cowork_task\` (\`sessionId\`, \`status\`);`)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`cowork_skill\` (
                \`id\`                  varchar(36) NOT NULL,
                \`name\`                varchar(255) NOT NULL,
                \`description\`         text,
                \`category\`            varchar(50) DEFAULT NULL,
                \`systemPrompt\`        text NOT NULL,
                \`requiredTools\`       text,
                \`preferredModel\`      varchar(255) DEFAULT NULL,
                \`historicSuccessRate\` double NOT NULL DEFAULT 0,
                \`avgCost\`             double DEFAULT NULL,
                \`avgLatencyMs\`        int DEFAULT NULL,
                \`usageCount\`          int NOT NULL DEFAULT 0,
                \`tenantId\`            varchar(255) DEFAULT NULL,
                \`isPublic\`            tinyint NOT NULL DEFAULT 0,
                \`tags\`                text,
                \`createdDate\`         datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedDate\`         datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `)
        await queryRunner.query(
            `CREATE INDEX \`IDX_cowork_skill_category_rate\` ON \`cowork_skill\` (\`category\`, \`historicSuccessRate\`);`
        )

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`cowork_prompt\` (
                \`id\`               varchar(36) NOT NULL,
                \`persona\`          varchar(50) NOT NULL,
                \`templateContent\`  text NOT NULL,
                \`variableMappings\` text,
                \`targetModel\`      varchar(255) DEFAULT NULL,
                \`version\`          int NOT NULL DEFAULT 1,
                \`avgSuccessRate\`   double NOT NULL DEFAULT 0,
                \`isDefault\`        tinyint NOT NULL DEFAULT 0,
                \`tenantId\`         varchar(255) DEFAULT NULL,
                \`createdDate\`      datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `)
        await queryRunner.query(`CREATE INDEX \`IDX_cowork_prompt_persona_default\` ON \`cowork_prompt\` (\`persona\`, \`isDefault\`);`)
        // cowork_prompt may have been created by CreateCoworkPrompt1765300000000 without avgSuccessRate
        if (!(await queryRunner.hasColumn('cowork_prompt', 'avgSuccessRate'))) {
            await queryRunner.query(`ALTER TABLE \`cowork_prompt\` ADD COLUMN \`avgSuccessRate\` double NOT NULL DEFAULT 0;`)
        }

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`analytics_event\` (
                \`id\`          varchar(36) NOT NULL,
                \`eventType\`   varchar(100) NOT NULL,
                \`tenantId\`    varchar(255) DEFAULT NULL,
                \`userId\`      varchar(255) DEFAULT NULL,
                \`tokensUsed\`  int DEFAULT NULL,
                \`costUsd\`     double DEFAULT NULL,
                \`latencyMs\`   int DEFAULT NULL,
                \`model\`       varchar(255) DEFAULT NULL,
                \`metadata\`    text,
                \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `)
        await queryRunner.query(
            `CREATE INDEX \`IDX_analytics_event_tenant_type_date\` ON \`analytics_event\` (\`tenantId\`, \`eventType\`, \`createdDate\`);`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`analytics_event\`;`)
        await queryRunner.query(`DROP TABLE IF EXISTS \`cowork_prompt\`;`)
        await queryRunner.query(`DROP TABLE IF EXISTS \`cowork_skill\`;`)
        await queryRunner.query(`DROP TABLE IF EXISTS \`cowork_task\`;`)
        await queryRunner.query(`DROP TABLE IF EXISTS \`cowork_session\`;`)
    }
}
