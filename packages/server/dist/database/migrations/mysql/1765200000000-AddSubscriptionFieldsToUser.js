"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSubscriptionFieldsToUser1765200000000 = void 0;
class AddSubscriptionFieldsToUser1765200000000 {
    async up(queryRunner) {
        if (!(await queryRunner.hasColumn('user', 'subscription_type'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `subscription_type` varchar(50) NULL;');
        }
        if (!(await queryRunner.hasColumn('user', 'subscription_duration'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `subscription_duration` varchar(50) NULL;');
        }
        if (!(await queryRunner.hasColumn('user', 'subscription_date'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `subscription_date` date NULL;');
        }
        if (!(await queryRunner.hasColumn('user', 'expiry_date'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `expiry_date` date NULL;');
        }
        if (!(await queryRunner.hasColumn('user', 'subscription_status'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `subscription_status` varchar(50) NULL;');
        }
        if (!(await queryRunner.hasColumn('user', 'razorpay_subscription_id'))) {
            await queryRunner.query('ALTER TABLE `user` ADD COLUMN `razorpay_subscription_id` varchar(255) NULL;');
        }
    }
    async down(queryRunner) {
        if (await queryRunner.hasColumn('user', 'razorpay_subscription_id')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `razorpay_subscription_id`;');
        }
        if (await queryRunner.hasColumn('user', 'subscription_status')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `subscription_status`;');
        }
        if (await queryRunner.hasColumn('user', 'expiry_date')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `expiry_date`;');
        }
        if (await queryRunner.hasColumn('user', 'subscription_date')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `subscription_date`;');
        }
        if (await queryRunner.hasColumn('user', 'subscription_duration')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `subscription_duration`;');
        }
        if (await queryRunner.hasColumn('user', 'subscription_type')) {
            await queryRunner.query('ALTER TABLE `user` DROP COLUMN `subscription_type`;');
        }
    }
}
exports.AddSubscriptionFieldsToUser1765200000000 = AddSubscriptionFieldsToUser1765200000000;
//# sourceMappingURL=1765200000000-AddSubscriptionFieldsToUser.js.map