import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddTenantIdToDataset1761100000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
