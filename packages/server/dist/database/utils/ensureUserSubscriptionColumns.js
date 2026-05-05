"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUserSubscriptionColumns = void 0;
const logger_1 = __importDefault(require("../../utils/logger"));
const isSqliteType = (dbType) => {
    return dbType === 'sqlite' || dbType === 'better-sqlite3';
};
const getAddColumnStatement = (dbType, columnName, definition) => {
    if (dbType === 'mysql' || dbType === 'mariadb') {
        return `ALTER TABLE \`user\` ADD COLUMN \`${columnName}\` ${definition};`;
    }
    return `ALTER TABLE "user" ADD COLUMN "${columnName}" ${definition};`;
};
const getColumnDefinition = (dbType, columnName) => {
    const textType = isSqliteType(dbType) ? 'varchar' : 'varchar(50)';
    const idTextType = isSqliteType(dbType) ? 'varchar' : 'varchar(255)';
    const dateType = isSqliteType(dbType) ? 'datetime' : 'date';
    const columnDefinitions = {
        subscription_type: `${textType} NULL`,
        subscription_duration: `${textType} NULL`,
        subscription_date: `${dateType} NULL`,
        expiry_date: `${dateType} NULL`,
        subscription_status: `${textType} NULL`,
        razorpay_subscription_id: `${idTextType} NULL`
    };
    return columnDefinitions[columnName];
};
const ensureUserSubscriptionColumns = async (dataSource) => {
    const rawDbType = dataSource.options.type;
    const dbType = rawDbType;
    if (!['mysql', 'mariadb', 'postgres', 'sqlite', 'better-sqlite3'].includes(dbType)) {
        return;
    }
    const queryRunner = dataSource.createQueryRunner();
    const requiredColumns = [
        'subscription_type',
        'subscription_duration',
        'subscription_date',
        'expiry_date',
        'subscription_status',
        'razorpay_subscription_id'
    ];
    try {
        const hasUserTable = await queryRunner.hasTable('user');
        if (!hasUserTable)
            return;
        for (const columnName of requiredColumns) {
            const hasColumn = await queryRunner.hasColumn('user', columnName);
            if (hasColumn)
                continue;
            const definition = getColumnDefinition(dbType, columnName);
            if (!definition)
                continue;
            await queryRunner.query(getAddColumnStatement(dbType, columnName, definition));
            logger_1.default.warn(`[server]: Added missing column user.${columnName}`);
        }
    }
    finally {
        await queryRunner.release();
    }
};
exports.ensureUserSubscriptionColumns = ensureUserSubscriptionColumns;
//# sourceMappingURL=ensureUserSubscriptionColumns.js.map