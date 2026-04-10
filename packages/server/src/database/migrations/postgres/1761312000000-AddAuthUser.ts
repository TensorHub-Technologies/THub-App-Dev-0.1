import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAuthUser1761312000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "uid" varchar(255) NOT NULL,
                "email" varchar(255) NOT NULL,
                "password_hash" varchar(255),
                "name" varchar(255),
                "login_type" varchar(255),
                "workspace" varchar(255),
                "phone" varchar(255),
                "access_token" text,
                "picture" text,
                "reset_token" varchar(255),
                "company" varchar(255),
                "department" varchar(255),
                "designation" varchar(255),
                CONSTRAINT "PK_user_uid" PRIMARY KEY ("uid"),
                CONSTRAINT "UQ_user_email" UNIQUE ("email")
            );
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "user";')
    }
}
