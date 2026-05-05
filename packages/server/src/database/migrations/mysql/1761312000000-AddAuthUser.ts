import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAuthUser1761312000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`user\` (
                \`uid\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password_hash\` varchar(255) NULL,
                \`name\` varchar(255) NULL,
                \`login_type\` varchar(255) NULL,
                \`workspace\` varchar(255) NULL,
                \`phone\` varchar(255) NULL,
                \`access_token\` text NULL,
                \`picture\` text NULL,
                \`reset_token\` varchar(255) NULL,
                \`company\` varchar(255) NULL,
                \`department\` varchar(255) NULL,
                \`designation\` varchar(255) NULL,
                PRIMARY KEY (\`uid\`),
                UNIQUE KEY \`idx_user_email_unique\` (\`email\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS `user`;')
    }
}
