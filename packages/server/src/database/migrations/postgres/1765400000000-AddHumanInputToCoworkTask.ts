import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddHumanInputToCoworkTask1765400000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_task'))) return

        if (!(await queryRunner.hasColumn('cowork_task', 'humanInputRequired'))) {
            await queryRunner.query('ALTER TABLE "cowork_task" ADD COLUMN "humanInputRequired" boolean NOT NULL DEFAULT false;')
        }

        if (!(await queryRunner.hasColumn('cowork_task', 'pendingAction'))) {
            await queryRunner.query('ALTER TABLE "cowork_task" ADD COLUMN "pendingAction" text;')
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_task'))) return

        if (await queryRunner.hasColumn('cowork_task', 'pendingAction')) {
            await queryRunner.query('ALTER TABLE "cowork_task" DROP COLUMN "pendingAction";')
        }

        if (await queryRunner.hasColumn('cowork_task', 'humanInputRequired')) {
            await queryRunner.query('ALTER TABLE "cowork_task" DROP COLUMN "humanInputRequired";')
        }
    }
}
