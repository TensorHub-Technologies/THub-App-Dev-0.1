import { MigrationInterface, QueryRunner } from 'typeorm'

export class EnsureCoworkPromptDates1765300000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('cowork_prompt'))) return

        if (!(await queryRunner.hasColumn('cowork_prompt', 'createdDate'))) {
            await queryRunner.query(`ALTER TABLE "cowork_prompt" ADD COLUMN "createdDate" datetime NOT NULL DEFAULT (datetime('now'));`)
        }
        if (!(await queryRunner.hasColumn('cowork_prompt', 'updatedDate'))) {
            await queryRunner.query(`ALTER TABLE "cowork_prompt" ADD COLUMN "updatedDate" datetime NOT NULL DEFAULT (datetime('now'));`)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
