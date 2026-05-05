import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddHumanInputToCoworkTask1765400000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_task'))) return

        if (!(await queryRunner.hasColumn('cowork_task', 'humanInputRequired'))) {
            await queryRunner.query('ALTER TABLE `cowork_task` ADD COLUMN `humanInputRequired` tinyint NOT NULL DEFAULT 0;')
        }

        if (!(await queryRunner.hasColumn('cowork_task', 'pendingAction'))) {
            await queryRunner.query('ALTER TABLE `cowork_task` ADD COLUMN `pendingAction` longtext;')
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_task'))) return

        if (await queryRunner.hasColumn('cowork_task', 'pendingAction')) {
            await queryRunner.query('ALTER TABLE `cowork_task` DROP COLUMN `pendingAction`;')
        }

        if (await queryRunner.hasColumn('cowork_task', 'humanInputRequired')) {
            await queryRunner.query('ALTER TABLE `cowork_task` DROP COLUMN `humanInputRequired`;')
        }
    }
}
