"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAuthUser1761312000000 = void 0;
class AddAuthUser1761312000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "uid" varchar PRIMARY KEY NOT NULL,
                "email" varchar NOT NULL,
                "password_hash" varchar,
                "name" varchar,
                "login_type" varchar,
                "workspace" varchar,
                "phone" varchar,
                "access_token" varchar,
                "picture" varchar,
                "reset_token" varchar,
                "company" varchar,
                "department" varchar,
                "designation" varchar
            );
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_email_unique" ON "user" ("email");`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_email_unique";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user";`);
    }
}
exports.AddAuthUser1761312000000 = AddAuthUser1761312000000;
//# sourceMappingURL=1761312000000-AddAuthUser.js.map