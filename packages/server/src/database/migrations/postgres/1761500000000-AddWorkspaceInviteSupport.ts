import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddWorkspaceInviteSupport1761500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('workspaces'))) {
            await queryRunner.query(`
                CREATE TABLE "workspaces" (
                    "id" varchar(255) NOT NULL,
                    "name" varchar(255) NOT NULL,
                    "created_by" varchar(255),
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_workspaces_id" PRIMARY KEY ("id"),
                    CONSTRAINT "UQ_workspaces_name" UNIQUE ("name")
                );
            `)
        }

        if (!(await queryRunner.hasColumn('workspaces', 'updated_at'))) {
            await queryRunner.query('ALTER TABLE "workspaces" ADD COLUMN "updated_at" TIMESTAMP NOT NULL DEFAULT now();')
        }

        if (!(await queryRunner.hasTable('workspace_users'))) {
            await queryRunner.query(`
                CREATE TABLE "workspace_users" (
                    "id" SERIAL NOT NULL,
                    "workspace_id" varchar(255) NOT NULL,
                    "user_id" varchar(255) NOT NULL,
                    "role" varchar(50) NOT NULL DEFAULT 'member',
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_workspace_users_id" PRIMARY KEY ("id"),
                    CONSTRAINT "UQ_workspace_users_workspace_user" UNIQUE ("workspace_id", "user_id")
                );
            `)
            await queryRunner.query('CREATE INDEX "IDX_workspace_users_user_id" ON "workspace_users" ("user_id");')
        }

        if (!(await queryRunner.hasColumn('workspace_users', 'created_at'))) {
            await queryRunner.query('ALTER TABLE "workspace_users" ADD COLUMN "created_at" TIMESTAMP NOT NULL DEFAULT now();')
        }

        if (!(await queryRunner.hasTable('workspace_invites'))) {
            await queryRunner.query(`
                CREATE TABLE "workspace_invites" (
                    "id" varchar(255) NOT NULL,
                    "email" varchar(255) NOT NULL,
                    "workspace_id" varchar(255) NOT NULL,
                    "workspace_name" varchar(255) NOT NULL,
                    "role" varchar(50) NOT NULL DEFAULT 'member',
                    "token" varchar(255) NOT NULL,
                    "invited_by" varchar(255) NOT NULL,
                    "expires_at" TIMESTAMP NOT NULL,
                    "used" boolean NOT NULL DEFAULT false,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_workspace_invites_id" PRIMARY KEY ("id"),
                    CONSTRAINT "UQ_workspace_invites_token" UNIQUE ("token")
                );
            `)
            await queryRunner.query(
                'CREATE INDEX "IDX_workspace_invites_email_workspace" ON "workspace_invites" ("email", "workspace_id");'
            )
        }

        if (!(await queryRunner.hasColumn('workspace_invites', 'created_at'))) {
            await queryRunner.query('ALTER TABLE "workspace_invites" ADD COLUMN "created_at" TIMESTAMP NOT NULL DEFAULT now();')
        }

        if (!(await queryRunner.hasColumn('user', 'role'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "role" varchar(50);')
        }

        if (!(await queryRunner.hasColumn('user', 'workspaceUid'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "workspaceUid" varchar(255);')
        }

        if (!(await queryRunner.hasColumn('user', 'profile_completed'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "profile_completed" boolean NOT NULL DEFAULT false;')
        }

        if (!(await queryRunner.hasColumn('user', 'profile_skipped'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "profile_skipped" boolean NOT NULL DEFAULT false;')
        }

        if (!(await queryRunner.hasColumn('user', 'reset_token_expires_at'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "reset_token_expires_at" TIMESTAMP;')
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn('user', 'reset_token_expires_at')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "reset_token_expires_at";')
        }

        if (await queryRunner.hasColumn('user', 'profile_skipped')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "profile_skipped";')
        }

        if (await queryRunner.hasColumn('user', 'profile_completed')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "profile_completed";')
        }

        if (await queryRunner.hasColumn('user', 'workspaceUid')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "workspaceUid";')
        }

        if (await queryRunner.hasColumn('user', 'role')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "role";')
        }

        if (await queryRunner.hasTable('workspace_invites')) {
            await queryRunner.query('DROP TABLE "workspace_invites";')
        }

        if (await queryRunner.hasTable('workspace_users')) {
            await queryRunner.query('DROP TABLE "workspace_users";')
        }

        if (await queryRunner.hasTable('workspaces')) {
            await queryRunner.query('DROP TABLE "workspaces";')
        }
    }
}
