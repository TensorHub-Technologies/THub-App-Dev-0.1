import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCompoundIndices1760000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX \`IDX_EXECUTION_SESSION_AGENTFLOW\` ON \`execution\` (\`sessionId\`, \`agentflowId\`, \`createdDate\`)`
        )
        await queryRunner.query(
            `CREATE INDEX \`IDX_CHATMESSAGE_SESSION_CHATFLOW\` ON \`chat_message\` (\`sessionId\`, \`chatflowid\`, \`createdDate\`)`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_EXECUTION_SESSION_AGENTFLOW\` ON \`execution\``)
        await queryRunner.query(`DROP INDEX \`IDX_CHATMESSAGE_SESSION_CHATFLOW\` ON \`chat_message\``)
    }
}
