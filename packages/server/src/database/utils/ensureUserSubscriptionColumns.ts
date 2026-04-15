import { DataSource } from 'typeorm'
import logger from '../../utils/logger.js'

type DBType = 'mysql' | 'mariadb' | 'postgres' | 'sqlite' | 'better-sqlite3'

const isSqliteType = (dbType: string): dbType is 'sqlite' | 'better-sqlite3' => {
    return dbType === 'sqlite' || dbType === 'better-sqlite3'
}

const getAddColumnStatement = (dbType: DBType, columnName: string, definition: string) => {
    if (dbType === 'mysql' || dbType === 'mariadb') {
        return `ALTER TABLE \`user\` ADD COLUMN \`${columnName}\` ${definition};`
    }
    return `ALTER TABLE "user" ADD COLUMN "${columnName}" ${definition};`
}

const getColumnDefinition = (dbType: DBType, columnName: string) => {
    const textType = isSqliteType(dbType) ? 'varchar' : 'varchar(50)'
    const idTextType = isSqliteType(dbType) ? 'varchar' : 'varchar(255)'
    const dateType = isSqliteType(dbType) ? 'datetime' : 'date'

    const columnDefinitions: Record<string, string> = {
        subscription_type: `${textType} NULL`,
        subscription_duration: `${textType} NULL`,
        subscription_date: `${dateType} NULL`,
        expiry_date: `${dateType} NULL`,
        subscription_status: `${textType} NULL`,
        razorpay_subscription_id: `${idTextType} NULL`
    }

    return columnDefinitions[columnName]
}

export const ensureUserSubscriptionColumns = async (dataSource: DataSource) => {
    const rawDbType = dataSource.options.type
    const dbType = rawDbType as DBType

    if (!['mysql', 'mariadb', 'postgres', 'sqlite', 'better-sqlite3'].includes(dbType)) {
        return
    }

    const queryRunner = dataSource.createQueryRunner()
    const requiredColumns = [
        'subscription_type',
        'subscription_duration',
        'subscription_date',
        'expiry_date',
        'subscription_status',
        'razorpay_subscription_id'
    ]

    try {
        const hasUserTable = await queryRunner.hasTable('user')
        if (!hasUserTable) return

        for (const columnName of requiredColumns) {
            const hasColumn = await queryRunner.hasColumn('user', columnName)
            if (hasColumn) continue

            const definition = getColumnDefinition(dbType, columnName)
            if (!definition) continue

            await queryRunner.query(getAddColumnStatement(dbType, columnName, definition))
            logger.warn(`[server]: Added missing column user.${columnName}`)
        }
    } finally {
        await queryRunner.release()
    }
}
