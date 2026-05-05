import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSubscriptionFieldsToUser1765200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn('user', 'subscription_type'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_type" varchar(50);')
        }

        if (!(await queryRunner.hasColumn('user', 'subscription_duration'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_duration" varchar(50);')
        }

        if (!(await queryRunner.hasColumn('user', 'subscription_date'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_date" date;')
        }

        if (!(await queryRunner.hasColumn('user', 'expiry_date'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "expiry_date" date;')
        }

        if (!(await queryRunner.hasColumn('user', 'subscription_status'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_status" varchar(50);')
        }

        if (!(await queryRunner.hasColumn('user', 'razorpay_subscription_id'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "razorpay_subscription_id" varchar(255);')
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn('user', 'razorpay_subscription_id')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "razorpay_subscription_id";')
        }

        if (await queryRunner.hasColumn('user', 'subscription_status')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "subscription_status";')
        }

        if (await queryRunner.hasColumn('user', 'expiry_date')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "expiry_date";')
        }

        if (await queryRunner.hasColumn('user', 'subscription_date')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "subscription_date";')
        }

        if (await queryRunner.hasColumn('user', 'subscription_duration')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "subscription_duration";')
        }

        if (await queryRunner.hasColumn('user', 'subscription_type')) {
            await queryRunner.query('ALTER TABLE "user" DROP COLUMN "subscription_type";')
        }
    }
}
