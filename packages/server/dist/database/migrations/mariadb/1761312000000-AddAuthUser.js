"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAuthUser1761312000000 = void 0;
class AddAuthUser1761312000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`user\` (
                \`uid\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password_hash\` varchar(255) NULL,
                \`name\` varchar(255) NULL,
                \`login_type\` varchar(255) NULL,
                \`workspace\` varchar(255) NULL,
                \`phone\` varchar(255) NULL,
                \`access_token\` text NULL,
                \`picture\` text NULL,
                \`reset_token\` varchar(255) NULL,
                \`company\` varchar(255) NULL,
                \`department\` varchar(255) NULL,
                \`designation\` varchar(255) NULL,
                PRIMARY KEY (\`uid\`),
                UNIQUE KEY \`idx_user_email_unique\` (\`email\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS `user`;');
    }
}
exports.AddAuthUser1761312000000 = AddAuthUser1761312000000;
//# sourceMappingURL=1761312000000-AddAuthUser.js.map