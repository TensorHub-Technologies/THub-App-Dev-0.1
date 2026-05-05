"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTenantIdToDataset1761100000000 = void 0;
class AddTenantIdToDataset1761100000000 {
    async up(queryRunner) {
        const datasetTenantColumnExists = await queryRunner.hasColumn('dataset', 'tenantId');
        if (!datasetTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE \`dataset\` ADD COLUMN \`tenantId\` varchar(36) NULL;`);
        }
    }
    async down(queryRunner) {
        const datasetTenantColumnExists = await queryRunner.hasColumn('dataset', 'tenantId');
        if (datasetTenantColumnExists) {
            await queryRunner.query(`ALTER TABLE \`dataset\` DROP COLUMN \`tenantId\`;`);
        }
    }
}
exports.AddTenantIdToDataset1761100000000 = AddTenantIdToDataset1761100000000;
//# sourceMappingURL=1761100000000-AddTenantIdToDataset.js.map