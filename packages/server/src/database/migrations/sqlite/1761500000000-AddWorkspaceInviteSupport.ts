import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddWorkspaceInviteSupport1761500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('workspaces'))) {
            await queryRunner.query(`
                CREATE TABLE "workspaces" (
                    "id" varchar PRIMARY KEY NOT NULL,
                    "name" varchar NOT NULL,
                    "created_by" varchar,
                    "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                    "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
                );
            `)
            await queryRunner.query('CREATE UNIQUE INDEX "idx_workspaces_name_unique" ON "workspaces" ("name");')
        }

        if (!(await queryRunner.hasColumn('workspaces', 'updated_at'))) {
            await queryRunner.query('ALTER TABLE "workspaces" ADD COLUMN "updated_at" datetime NOT NULL DEFAULT (datetime(\'now\'));')
        }

        if (!(await queryRunner.hasTable('workspace_users'))) {
            await queryRunner.query(`
                CREATE TABLE "workspace_users" (
                    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                    "workspace_id" varchar NOT NULL,
                    "user_id" varchar NOT NULL,
                    "role" varchar NOT NULL DEFAULT 'member',
                    "created_at" datetime NOT NULL DEFAULT (datetime('now'))
                );
            `)
            await queryRunner.query(
                'CREATE UNIQUE INDEX "idx_workspace_users_workspace_user_unique" ON "workspace_users" ("workspace_id", "user_id");'
            )
            await queryRunner.query('CREATE INDEX "idx_workspace_users_user_id" ON "workspace_users" ("user_id");')
        }

        if (!(await queryRunner.hasColumn('workspace_users', 'created_at'))) {
            await queryRunner.query('ALTER TABLE "workspace_users" ADD COLUMN "created_at" datetime NOT NULL DEFAULT (datetime(\'now\'));')
        }

        if (!(await queryRunner.hasTable('workspace_invites'))) {
            await queryRunner.query(`
                CREATE TABLE "workspace_invites" (
                    "id" varchar PRIMARY KEY NOT NULL,
                    "email" varchar NOT NULL,
                    "workspace_id" varchar NOT NULL,
                    "workspace_name" varchar NOT NULL,
                    "role" varchar NOT NULL DEFAULT 'member',
                    "token" varchar NOT NULL,
                    "invited_by" varchar NOT NULL,
                    "expires_at" datetime NOT NULL,
                    "used" integer NOT NULL DEFAULT 0,
                    "created_at" datetime NOT NULL DEFAULT (datetime('now'))
                );
            `)
            await queryRunner.query('CREATE UNIQUE INDEX "idx_workspace_invites_token_unique" ON "workspace_invites" ("token");')
            await queryRunner.query(
                'CREATE INDEX "idx_workspace_invites_email_workspace" ON "workspace_invites" ("email", "workspace_id");'
            )
        }

        if (!(await queryRunner.hasColumn('workspace_invites', 'created_at'))) {
            await queryRunner.query(
                'ALTER TABLE "workspace_invites" ADD COLUMN "created_at" datetime NOT NULL DEFAULT (datetime(\'now\'));'
            )
        }

        if (!(await queryRunner.hasColumn('user', 'role'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "role" varchar;')
        }

        if (!(await queryRunner.hasColumn('user', 'workspaceUid'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "workspaceUid" varchar;')
        }

        if (!(await queryRunner.hasColumn('user', 'profile_completed'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "profile_completed" integer NOT NULL DEFAULT 0;')
        }

        if (!(await queryRunner.hasColumn('user', 'profile_skipped'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "profile_skipped" integer NOT NULL DEFAULT 0;')
        }

        if (!(await queryRunner.hasColumn('user', 'reset_token_expires_at'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "reset_token_expires_at" datetime;')
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
