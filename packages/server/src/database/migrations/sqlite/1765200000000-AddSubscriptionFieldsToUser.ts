import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSubscriptionFieldsToUser1765200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn('user', 'subscription_type'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_type" varchar;')
        }

        if (!(await queryRunner.hasColumn('user', 'subscription_duration'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_duration" varchar;')
        }

        if (!(await queryRunner.hasColumn('user', 'subscription_date'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_date" datetime;')
        }

        if (!(await queryRunner.hasColumn('user', 'expiry_date'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "expiry_date" datetime;')
        }

        if (!(await queryRunner.hasColumn('user', 'subscription_status'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_status" varchar;')
        }

        if (!(await queryRunner.hasColumn('user', 'razorpay_subscription_id'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "razorpay_subscription_id" varchar;')
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // SQLite down migration intentionally left empty.
    }
}
