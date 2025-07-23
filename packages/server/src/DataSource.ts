import 'reflect-metadata'
import path from 'path'
import * as fs from 'fs'
import { DataSource } from 'typeorm'
import { getUserHome } from './utils'
import { entities } from './database/entities'
import { sqliteMigrations } from './database/migrations/sqlite'
import { mysqlMigrations } from './database/migrations/mysql'
import { mariadbMigrations } from './database/migrations/mariadb'
import { postgresMigrations } from './database/migrations/postgres'

let appDataSource: DataSource

import { Storage } from '@google-cloud/storage'

// Validate required environment variables
const requiredEnvVars = [
    'GOOGLE_CLOUD_TYPE',
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_PRIVATE_KEY_ID',
    'GOOGLE_CLOUD_PRIVATE_KEY',
    'GOOGLE_CLOUD_CLIENT_EMAIL',
    'GOOGLE_CLOUD_CLIENT_ID'
]

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

const storageCredentials = {
    type: process.env.GOOGLE_CLOUD_TYPE,
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
    private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
    auth_uri: process.env.GOOGLE_CLOUD_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.GOOGLE_CLOUD_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env.GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CLOUD_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_CLOUD_UNIVERSE_DOMAIN || 'googleapis.com'
}

// Debug logging (consider removing in production)
console.log('Private Key received (first 50 chars):', storageCredentials.private_key?.substring(0, 50) + '...')
console.log('Private Key length:', storageCredentials.private_key ? storageCredentials.private_key.length : 'undefined')
console.log(
    'Private Key contains actual newlines:',
    storageCredentials.private_key ? storageCredentials.private_key.includes('\n') : 'undefined'
)
console.log(
    'Private Key starts with BEGIN:',
    storageCredentials.private_key ? storageCredentials.private_key.startsWith('-----BEGIN') : 'undefined'
)

// Validate private key format
if (!storageCredentials.private_key?.startsWith('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Private key does not have the correct format')
}

const storage = new Storage({
    credentials: storageCredentials
})

const bucketName = 'thub-files'

// Function to create a folder in GCS
async function createFolderInGCS(folderPath: string): Promise<void> {
    const file = storage.bucket(bucketName).file(`${folderPath}/`)
    await file.save('')
    console.log(`Folder ${folderPath} created in bucket ${bucketName}`)
}

export const init = async (): Promise<void> => {
    let homePath
    let flowisePath = path.join(getUserHome(), '.flowise')

    if (!fs.existsSync(flowisePath)) {
        fs.mkdirSync(flowisePath)
        console.log(`.thub directory created at ${flowisePath}`)
    } else {
        console.log(`.thub directory already exists at ${flowisePath}`)
    }
    try {
        await createFolderInGCS('.flowise')
        await createFolderInGCS('.flowise/storage')
    } catch (error) {
        console.error('Error creating folder in GCS:', error)
    }
    switch (process.env.DATABASE_TYPE) {
        case 'sqlite':
            homePath = process.env.DATABASE_PATH ?? flowisePath
            appDataSource = new DataSource({
                type: 'sqlite',
                database: path.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: sqliteMigrations
            })
            break
        case 'mysql':
            appDataSource = new DataSource({
                type: 'mysql',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: mysqlMigrations,
                ssl: getDatabaseSSLFromEnv()
            })
            break
        case 'mariadb':
            appDataSource = new DataSource({
                type: 'mariadb',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: mariadbMigrations,
                ssl: getDatabaseSSLFromEnv()
            })
            break
        case 'postgres':
            appDataSource = new DataSource({
                type: 'postgres',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '5432'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                ssl: getDatabaseSSLFromEnv(),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: postgresMigrations
            })
            break
        default:
            homePath = process.env.DATABASE_PATH ?? flowisePath
            appDataSource = new DataSource({
                type: 'sqlite',
                database: path.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: sqliteMigrations
            })
            break
    }
}

export function getDataSource(): DataSource {
    if (appDataSource === undefined) {
        init()
    }
    return appDataSource
}

const getDatabaseSSLFromEnv = () => {
    if (process.env.DATABASE_SSL_KEY_BASE64) {
        return {
            rejectUnauthorized: false,
            ca: Buffer.from(process.env.DATABASE_SSL_KEY_BASE64, 'base64')
        }
    } else if (process.env.DATABASE_SSL === 'true') {
        return true
    }
    return undefined
}
