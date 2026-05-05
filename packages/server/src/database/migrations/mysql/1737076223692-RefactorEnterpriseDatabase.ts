import { MigrationInterface, QueryRunner } from 'typeorm'

export class RefactorEnterpriseDatabase1737076223692 implements MigrationInterface {
    name = 'RefactorEnterpriseDatabase1737076223692'
    private async modifyTable(queryRunner: QueryRunner): Promise<void> {
        /*-------------------------------------
        --------------- user -----------------
        --------------------------------------*/
        // rename user table to temp_user
        await queryRunner.query(`alter table \`user\` rename to \`temp_user\`;`)

        // create user table
        await queryRunner.query(`
                create table \`user\` (
                    \`id\` varchar(36) default (uuid()) primary key,
                    \`name\` varchar(100) not null,
                    \`email\` varchar(255) not null unique,
                    \`credential\` text null,
                    \`tempToken\` text null,
                    \`tokenExpiry\` timestamp null,
                    \`status\` varchar(20) default '' not null,
                    \`createdDate\` timestamp default now() not null,
                    \`updatedDate\` timestamp default now() not null,
                    \`createdBy\` varchar(36) not null,
                    \`updatedBy\` varchar(36) not null,
                    constraint \`fk_user_createdBy\` foreign key (\`createdBy\`) references \`user\` (\`id\`),
                    constraint \`fk_user_updatedBy\` foreign key (\`updatedBy\`) references \`user\` (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            `)

        /*-------------------------------------
        ----------- organization --------------
        --------------------------------------*/
        // rename organization table to temp_organization
        await queryRunner.query(`alter table \`organization\` rename to \`temp_organization\`;`)

        // create organization table
        await queryRunner.query(`
                create table \`organization\` (
                    \`id\` varchar(36) default (uuid()) primary key,
                    \`name\` varchar(100) default '' not null,
                    \`customerId\` varchar(100) null,
                    \`subscriptionId\` varchar(100) null,
                    \`createdDate\` timestamp default now() not null,
                    \`updatedDate\` timestamp default now() not null,
                    \`createdBy\` varchar(36) not null,
                    \`updatedBy\` varchar(36) not null,
                    constraint \`fk_organization_createdBy\` foreign key (\`createdBy\`) references \`user\` (\`id\`),
                    constraint \`fk_organization_updatedBy\` foreign key (\`updatedBy\`) references \`user\` (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            `)

        /*-------------------------------------
        ----------- login method --------------
        --------------------------------------*/
        // create login_method table
        await queryRunner.query(`
                create table \`login_method\` (
                    \`id\` varchar(36) default (uuid()) primary key,
                    \`organizationId\` varchar(36) null,
                    \`name\` varchar(100) not null,
                    \`config\` text not null,
                    \`status\` varchar(20) default ''  not null,
                    \`createdDate\` timestamp default now() not null,
                    \`updatedDate\` timestamp default now() not null,
                    \`createdBy\` varchar(36) null,
                    \`updatedBy\` varchar(36) null,
                    constraint \`fk_login_method_organizationId\` foreign key (\`organizationId\`) references \`organization\` (\`id\`),
                    constraint \`fk_login_method_createdBy\` foreign key (\`createdBy\`) references \`user\` (\`id\`),
                    constraint \`fk_login_method_updatedBy\` foreign key (\`updatedBy\`) references \`user\` (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            `)

        /*-------------------------------------
        --------------- role ------------------
        --------------------------------------*/
        // rename roles table to temp_role
        await queryRunner.query(`alter table \`roles\` rename to \`temp_role\`;`)

        // create organization_login_method table
        await queryRunner.query(`
                create table \`role\` (
                    \`id\` varchar(36) default (uuid()) primary key,
                    \`organizationId\` varchar(36) null,
                    \`name\` varchar(100) not null,
                    \`description\` text null,
                    \`permissions\` text not null,
                    \`createdDate\` timestamp default now() not null,
                    \`updatedDate\` timestamp default now() not null,
                    \`createdBy\` varchar(36) null,
                    \`updatedBy\` varchar(36) null,
                    constraint \`fk_role_organizationId\` foreign key (\`organizationId\`) references \`organization\` (\`id\`),
                    constraint \`fk_role_createdBy\` foreign key (\`createdBy\`) references \`user\` (\`id\`),
                    constraint \`fk_role_updatedBy\` foreign key (\`updatedBy\`) references \`user\` (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            `)

        /*-------------------------------------
        ---------- organization_user ----------
        --------------------------------------*/
        // create organization_user table
        await queryRunner.query(`
                create table \`organization_user\` (
                    \`organizationId\` varchar(36) not null,
                    \`userId\` varchar(36) not null,
                    \`roleId\` varchar(36) not null,
                    \`status\` varchar(20) default '' not null,
                    \`createdDate\` timestamp default now() not null,
                    \`updatedDate\` timestamp default now() not null,
                    \`createdBy\` varchar(36) not null,
                    \`updatedBy\` varchar(36) not null,
                    constraint \`pk_organization_user\` primary key (\`organizationId\`, \`userId\`),
                    constraint \`fk_organization_user_organizationId\` foreign key (\`organizationId\`) references \`organization\` (\`id\`),
                    constraint \`fk_organization_user_userId\` foreign key (\`userId\`) references \`user\` (\`id\`),
                    constraint \`fk_organization_user_roleId\` foreign key (\`roleId\`) references \`role\` (\`id\`),
                    constraint \`fk_organization_user_createdBy\` foreign key (\`createdBy\`) references \`user\` (\`id\`),
                    constraint \`fk_organization_user_updatedBy\` foreign key (\`updatedBy\`) references \`user\` (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            `)

        /*-------------------------------------
        ------------- workspace ---------------
        --------------------------------------*/
        // modify workspace table
        await queryRunner.query(`
                alter table \`workspace\`
                drop constraint \`fk_workspace_organizationId\`;
            `)

        await queryRunner.query(`
            alter table \`workspace\`
            modify column \`organizationId\` varchar(36) not null,
            modify column \`name\` varchar(100),
            modify column \`description\` text;
        `)

        await queryRunner.query(`
            alter table \`workspace\`
            add column \`createdBy\` varchar(36) null,
            add column \`updatedBy\` varchar(36) null;
        `)

        // remove first if needed will be add back, will cause insert to slow
        await queryRunner.query(`
                drop index \`idx_workspace_organizationId\` on \`workspace\`;
            `)

        /*-------------------------------------
        ----------- workspace_user ------------
        --------------------------------------*/
        // rename workspace_users table to temp_workspace_user
        await queryRunner.query(`alter table \`workspace_users\` rename to \`temp_workspace_user\`;`)

        // create workspace_user table
        await queryRunner.query(`
                create table \`workspace_user\` (
                    \`workspaceId\` varchar(36) not null,
                    \`userId\` varchar(36) not null,
                    \`roleId\` varchar(36) not null,
                    \`status\` varchar(20) default '' not null,
                    \`lastLogin\` timestamp null,
                    \`createdDate\` timestamp default now() not null,
                    \`updatedDate\` timestamp default now() not null,
                    \`createdBy\` varchar(36) not null,
                    \`updatedBy\` varchar(36) not null,
                    constraint \`pk_workspace_user\` primary key (\`workspaceId\`, \`userId\`),
                    constraint \`fk_workspace_user_workspaceId\` foreign key (\`workspaceId\`) references \`workspace\` (\`id\`),
                    constraint \`fk_workspace_user_userId\` foreign key (\`userId\`) references \`user\` (\`id\`),
                    constraint \`fk_workspace_user_roleId\` foreign key (\`roleId\`) references \`role\` (\`id\`),
                    constraint \`fk_workspace_user_createdBy\` foreign key (\`createdBy\`) references \`user\` (\`id\`),
                    constraint \`fk_workspace_user_updatedBy\` foreign key (\`updatedBy\`) references \`user\` (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            `)
    }

    private async deleteWorkspaceWithoutUser(queryRunner: QueryRunner) {
        const workspaceWithoutUser = await queryRunner.query(`
            select w.\`id\` as \`id\` from \`workspace_user\` as \`wu\`
            right join \`workspace\` as \`w\` on \`wu\`.\`workspaceId\` = \`w\`.\`id\`
            where \`wu\`.\`userId\` is null;
        `)
        const workspaceIds = workspaceWithoutUser.map((workspace: { id: string }) => `'${workspace.id}'`).join(',')

        // Delete related records from other tables that reference the deleted workspaces
        if (workspaceIds && workspaceIds.length > 0) {
            await queryRunner.query(`
                delete from \`workspace_user\` where \`workspaceId\` in (${workspaceIds});
            `)
            await queryRunner.query(`
                delete from \`apikey\` where \`workspaceId\` in (${workspaceIds});
            `)
            await queryRunner.query(`
                delete from \`assistant\` where \`workspaceId\` in (${workspaceIds});
            `)
            const chatflows = await queryRunner.query(`
                select id from \`chat_flow\` where \`workspaceId\` in (${workspaceIds});
            `)
            const chatflowIds = chatflows.map((chatflow: { id: string }) => `'${chatflow.id}'`).join(',')
            if (chatflowIds && chatflowIds.length > 0) {
                await queryRunner.query(`
                    delete from \`chat_flow\` where \`workspaceId\` in (${workspaceIds});
                `)
                await queryRunner.query(`
                    delete from \`upsert_history\` where \`chatflowid\` in (${chatflowIds});
                `)
                await queryRunner.query(`
                    delete from \`chat_message\` where \`chatflowid\` in (${chatflowIds});
                `)
                await queryRunner.query(`
                    delete from \`chat_message_feedback\` where \`chatflowid\` in (${chatflowIds});
                `)
            }
            await queryRunner.query(`
                delete from \`credential\` where \`workspaceId\` in (${workspaceIds});
            `)
            await queryRunner.query(`
                delete from \`custom_template\` where \`workspaceId\` in (${workspaceIds});
            `)
            const datasets = await queryRunner.query(`
                select id from \`dataset\` where \`workspaceId\` in (${workspaceIds});
            `)
            const datasetIds = datasets.map((dataset: { id: string }) => `'${dataset.id}'`).join(',')
            if (datasetIds && datasetIds.length > 0) {
                await queryRunner.query(`
                    delete from \`dataset\` where \`workspaceId\` in (${workspaceIds});
                `)
                await queryRunner.query(`
                    delete from \`dataset_row\` where \`datasetId\` in (${datasetIds});
                `)
            }
            const documentStores = await queryRunner.query(`    
                select id from \`document_store\` where \`workspaceId\` in (${workspaceIds});
            `)
            const documentStoreIds = documentStores.map((documentStore: { id: string }) => `'${documentStore.id}'`).join(',')
            if (documentStoreIds && documentStoreIds.length > 0) {
                await queryRunner.query(`
                    delete from \`document_store\` where \`workspaceId\` in (${workspaceIds});
                `)
                await queryRunner.query(`
                    delete from \`document_store_file_chunk\` where \`storeId\` in (${documentStoreIds});
                `)
            }
            const evaluations = await queryRunner.query(`
                select id from \`evaluation\` where \`workspaceId\` in (${workspaceIds});
            `)
            const evaluationIds = evaluations.map((evaluation: { id: string }) => `'${evaluation.id}'`).join(',')
            if (evaluationIds && evaluationIds.length > 0) {
                await queryRunner.query(`
                    delete from \`evaluation\` where \`workspaceId\` in (${workspaceIds});
                `)
                await queryRunner.query(`
                    delete from \`evaluation_run\` where \`evaluationId\` in (${evaluationIds});
                `)
            }
            await queryRunner.query(`
                delete from \`evaluator\` where \`workspaceId\` in (${workspaceIds});
            `)
            await queryRunner.query(`
                delete from \`tool\` where \`workspaceId\` in (${workspaceIds});
            `)
            await queryRunner.query(`
                delete from \`variable\` where \`workspaceId\` in (${workspaceIds});
            `)
            await queryRunner.query(`
                delete from \`workspace_shared\` where \`workspaceId\` in (${workspaceIds});
            `)
            await queryRunner.query(`
                delete from \`workspace\` where \`id\` in (${workspaceIds});
            `)
        }
    }

    private async populateTable(queryRunner: QueryRunner): Promise<void> {
        // insert generalRole
        const generalRole = [
            {
                name: 'owner',
                description: 'Has full control over the organization.',
                permissions: '["organization","workspace"]'
            },
            {
                name: 'member',
                description: 'Has limited control over the organization.',
                permissions: '[]'
            },
            {
                name: 'personal workspace',
                description: 'Has full control over the personal workspace',
                permissions:
                    '[ "chatflows:view", "chatflows:create", "chatflows:update", "chatflows:duplicate", "chatflows:delete", "chatflows:export", "chatflows:import", "chatflows:config", "chatflows:domains", "agentflows:view", "agentflows:create", "agentflows:update", "agentflows:duplicate", "agentflows:delete", "agentflows:export", "agentflows:import", "agentflows:config", "agentflows:domains", "tools:view", "tools:create", "tools:update", "tools:delete", "tools:export", "assistants:view", "assistants:create", "assistants:update", "assistants:delete", "credentials:view", "credentials:create", "credentials:update", "credentials:delete", "credentials:share", "variables:view", "variables:create", "variables:update", "variables:delete", "apikeys:view", "apikeys:create", "apikeys:update", "apikeys:delete", "apikeys:import", "documentStores:view", "documentStores:create", "documentStores:update", "documentStores:delete", "documentStores:add-loader", "documentStores:delete-loader", "documentStores:preview-process", "documentStores:upsert-config", "datasets:view", "datasets:create", "datasets:update", "datasets:delete", "evaluators:view", "evaluators:create", "evaluators:update", "evaluators:delete", "evaluations:view", "evaluations:create", "evaluations:update", "evaluations:delete", "evaluations:run", "templates:marketplace", "templates:custom", "templates:custom-delete", "templates:toolexport", "templates:flowexport", "templates:custom-share", "workspace:export", "workspace:import", "executions:view", "executions:delete" ]'
            }
        ]
        for (let role of generalRole) {
            await queryRunner.query(`
                    insert into \`role\`(\`name\`, \`description\`, \`permissions\`)
                    values('${role.name}', '${role.description}', '${role.permissions}');
                `)
        }

        const users = await queryRunner.query('select * from `temp_user`;')
        const noExistingData = users.length > 0 === false
        if (noExistingData) return
    }

    private async deleteTempTable(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            drop table \`temp_workspace_user\`;
        `)
        await queryRunner.query(`
            drop table \`temp_role\`;
        `)
        await queryRunner.query(`
            drop table \`temp_organization\`;
        `)
        await queryRunner.query(`
            drop table \`temp_user\`;
        `)
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.modifyTable(queryRunner)
        await this.populateTable(queryRunner)
        await this.deleteTempTable(queryRunner)

        // This query cannot be part of the modifyTable function because:
        // 1. The \`organizationId\` in the \`workspace\` table might be referencing data in the \`temp_organization\` table, so it must be altered last.
        // 2. Setting \`createdBy\` and \`updatedBy\` to NOT NULL needs to happen after ensuring there’s no existing data that would violate the constraint,
        //    because altering these columns while there is data could prevent new records from being inserted into the \`workspace\` table.
        await queryRunner.query(`
                alter table \`workspace\`
                modify column \`createdBy\` varchar(36) not null,
                modify column \`updatedBy\` varchar(36) not null,
                add constraint \`fk_organizationId\` foreign key (\`organizationId\`) references \`organization\` (\`id\`),
                add constraint \`fk_workspace_createdBy\` foreign key (\`createdBy\`) references \`user\` (\`id\`),
                add constraint \`fk_workspace_updatedBy\` foreign key (\`updatedBy\`) references \`user\` (\`id\`);
            `)

        // modify evaluation table for average_metrics column to be nullable
        await queryRunner.query(`
            alter table \`evaluation\`
            modify column \`average_metrics\` longtext null;
        `)
    }

    public async down(): Promise<void> {}
}
