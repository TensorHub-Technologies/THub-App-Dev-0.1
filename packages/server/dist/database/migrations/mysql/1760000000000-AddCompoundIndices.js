"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCompoundIndices1760000000000 = void 0;
class AddCompoundIndices1760000000000 {
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX \`IDX_EXECUTION_SESSION_AGENTFLOW\` ON \`execution\` (\`sessionId\`, \`agentflowId\`, \`createdDate\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_CHATMESSAGE_SESSION_CHATFLOW\` ON \`chat_message\` (\`sessionId\`, \`chatflowid\`, \`createdDate\`)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX \`IDX_EXECUTION_SESSION_AGENTFLOW\` ON \`execution\``);
        await queryRunner.query(`DROP INDEX \`IDX_CHATMESSAGE_SESSION_CHATFLOW\` ON \`chat_message\``);
    }
}
exports.AddCompoundIndices1760000000000 = AddCompoundIndices1760000000000;
//# sourceMappingURL=1760000000000-AddCompoundIndices.js.map