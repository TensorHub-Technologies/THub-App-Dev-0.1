"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSubscriptionFieldsToUser1765200000000 = void 0;
class AddSubscriptionFieldsToUser1765200000000 {
    async up(queryRunner) {
        if (!(await queryRunner.hasColumn('user', 'subscription_type'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_type" varchar;');
        }
        if (!(await queryRunner.hasColumn('user', 'subscription_duration'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_duration" varchar;');
        }
        if (!(await queryRunner.hasColumn('user', 'subscription_date'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_date" datetime;');
        }
        if (!(await queryRunner.hasColumn('user', 'expiry_date'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "expiry_date" datetime;');
        }
        if (!(await queryRunner.hasColumn('user', 'subscription_status'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "subscription_status" varchar;');
        }
        if (!(await queryRunner.hasColumn('user', 'razorpay_subscription_id'))) {
            await queryRunner.query('ALTER TABLE "user" ADD COLUMN "razorpay_subscription_id" varchar;');
        }
    }
    async down(_queryRunner) {
        // SQLite down migration intentionally left empty.
    }
}
exports.AddSubscriptionFieldsToUser1765200000000 = AddSubscriptionFieldsToUser1765200000000;
//# sourceMappingURL=1765200000000-AddSubscriptionFieldsToUser.js.map