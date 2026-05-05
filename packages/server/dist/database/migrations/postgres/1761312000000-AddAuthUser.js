"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAuthUser1761312000000 = void 0;
class AddAuthUser1761312000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "uid" varchar(255) NOT NULL,
                "email" varchar(255) NOT NULL,
                "password_hash" varchar(255),
                "name" varchar(255),
                "login_type" varchar(255),
                "workspace" varchar(255),
                "phone" varchar(255),
                "access_token" text,
                "picture" text,
                "reset_token" varchar(255),
                "company" varchar(255),
                "department" varchar(255),
                "designation" varchar(255),
                CONSTRAINT "PK_user_uid" PRIMARY KEY ("uid"),
                CONSTRAINT "UQ_user_email" UNIQUE ("email")
            );
        `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS "user";');
    }
}
exports.AddAuthUser1761312000000 = AddAuthUser1761312000000;
//# sourceMappingURL=1761312000000-AddAuthUser.js.map