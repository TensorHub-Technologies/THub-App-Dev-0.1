import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCoworkModelProfile1765500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_model_profile'))) {
            await queryRunner.query(`
                CREATE TABLE \`cowork_model_profile\` (
                    \`id\` varchar(36) NOT NULL,
                    \`provider\` varchar(255) NOT NULL,
                    \`modelName\` varchar(255) NOT NULL,
                    \`inputCostPer1kTokens\` float NOT NULL DEFAULT 0,
                    \`outputCostPer1kTokens\` float NOT NULL DEFAULT 0,
                    \`contextWindowTokens\` int NOT NULL,
                    \`supportsVision\` tinyint NOT NULL DEFAULT 0,
                    \`supportsFunctionCalling\` tinyint NOT NULL DEFAULT 0,
                    \`isAvailable\` tinyint NOT NULL DEFAULT 1,
                    \`isLocal\` tinyint NOT NULL DEFAULT 0,
                    \`avgLatencyMs\` int,
                    \`reliabilityScore\` float NOT NULL DEFAULT 1,
                    \`ollamaEndpoint\` varchar(255),
                    \`createdDate\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    \`updatedDate\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `)
            await queryRunner.query(
                'CREATE INDEX `IDX_cowork_model_profile_provider_modelName` ON `cowork_model_profile` (`provider`, `modelName`);'
            )
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('cowork_model_profile')) {
            await queryRunner.query('DROP TABLE `cowork_model_profile`;')
        }
    }
}
