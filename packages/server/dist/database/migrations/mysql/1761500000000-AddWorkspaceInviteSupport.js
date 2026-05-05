"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddWorkspaceInviteSupport1761500000000 = void 0;
class AddWorkspaceInviteSupport1761500000000 {
    async up(queryRunner) {
        if (!(await queryRunner.hasTable('workspaces'))) {
            await queryRunner.query(`
                CREATE TABLE \`workspaces\` (
                    \`id\` varchar(255) NOT NULL,
                    \`name\` varchar(255) NOT NULL,
                    \`created_by\` varchar(255) NULL,
                    \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (\`id\`),
                    UNIQUE KEY \`idx_workspaces_name_unique\` (\`name\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        }
        if (!(await queryRunner.hasColumn('workspaces', 'updated_at'))) {
            await queryRunner.query('ALTER TABLE `workspaces` ADD COLUMN `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;');
        }
        if (!(await queryRunner.hasTable('workspace_users'))) {
            await queryRunner.query(`
                CREATE TABLE \`workspace_users\` (
                    \`id\` int NOT NULL AUTO_INCREMENT,
                    \`workspace_id\` varchar(255) NOT NULL,
                    \`user_id\` varchar(255) NOT NULL,
                    \`role\` varchar(50) NOT NULL DEFAULT 'member',
                    \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (\`id\`),
                    UNIQUE KEY \`idx_workspace_users_workspace_user_unique\` (\`workspace_id\`, \`user_id\`),
                    KEY \`idx_workspace_users_user_id\` (\`user_id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        }
        if (!(await queryRunner.hasColumn('workspace_users', 'created_at'))) {
            await queryRunner.query('ALTER TABLE `workspace_users` ADD COLUMN `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP;');
        }
        if (!(await queryRunner.hasTable('workspace_invites'))) {
            await queryRunner.query(`
                CREATE TABLE \`workspace_invites\` (
                    \`id\` varchar(255) NOT NULL,
                    \`email\` varchar(255) NOT NULL,
                    \`workspace_id\` varchar(255) NOT NULL,
                    \`workspace_name\` varchar(255) NOT NULL,
                    \`role\` varchar(50) NOT NULL DEFAULT 'member',
                    \`token\` varchar(255) NOT NULL,
                    \`invited_by\` varchar(255) NOT NULL,
                    \`expires_at\` datetime NOT NULL,
                    \`used\` tinyint(1) NOT NULL DEFAULT 0,
                    \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (\`id\`),
                    UNIQUE KEY \`idx_workspace_invites_token_unique\` (\`token\`),
                    KEY \`idx_workspace_invites_email_workspace\` (\`email\`, \`workspace_id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        }
        if (!(await queryRunner.hasColumn('workspace_invites', 'created_at'))) {
            await queryRunner.query('ALTER TABLE `workspace_invites` ADD COLUMN `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP;');
        }
        if (!(await queryRunner.hasColumn('user', 'role'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `role` varchar(50) NULL;');
        }
        if (!(await queryRunner.hasColumn('user', 'workspaceUid'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `workspaceUid` varchar(255) NULL;');
        }
        if (!(await queryRunner.hasColumn('user', 'profile_completed'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `profile_completed` tinyint(1) NOT NULL DEFAULT 0;');
        }
        if (!(await queryRunner.hasColumn('user', 'profile_skipped'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `profile_skipped` tinyint(1) NOT NULL DEFAULT 0;');
        }
        if (!(await queryRunner.hasColumn('user', 'reset_token_expires_at'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `reset_token_expires_at` datetime NULL;');
        }
    }
    async down(queryRunner) {
        if (await queryRunner.hasColumn('user', 'reset_token_expires_at')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `reset_token_expires_at`;');
        }
        if (await queryRunner.hasColumn('user', 'profile_skipped')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `profile_skipped`;');
        }
        if (await queryRunner.hasColumn('user', 'profile_completed')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `profile_completed`;');
        }
        if (await queryRunner.hasColumn('user', 'workspaceUid')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `workspaceUid`;');
        }
        if (await queryRunner.hasColumn('user', 'role')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `role`;');
        }
        if (await queryRunner.hasTable('workspace_invites')) {
            await queryRunner.query('DROP TABLE `workspace_invites`;');
        }
        if (await queryRunner.hasTable('workspace_users')) {
            await queryRunner.query('DROP TABLE `workspace_users`;');
        }
        if (await queryRunner.hasTable('workspaces')) {
            await queryRunner.query('DROP TABLE `workspaces`;');
        }
    }
}
exports.AddWorkspaceInviteSupport1761500000000 = AddWorkspaceInviteSupport1761500000000;
//# sourceMappingURL=1761500000000-AddWorkspaceInviteSupport.js.map