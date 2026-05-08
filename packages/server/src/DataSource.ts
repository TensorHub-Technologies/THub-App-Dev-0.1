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
import { Storage } from '@google-cloud/storage'
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'

let appDataSource: DataSource

const normalizeEnvValue = (value?: string): string | undefined => {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    if (!trimmed) return undefined
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.substring(1, trimmed.length - 1).trim()
    }
    return trimmed
}

const normalizeAzureAccountName = (value: string): string => {
    return value
        .replace(/^https?:\/\//i, '')
        .replace(/\/.*$/, '')
        .replace(/\.blob\.core\.windows\.net$/i, '')
        .trim()
}

/**
 * Get the storage type from environment
 */
const getStorageType = (): string => {
    return process.env.STORAGE_TYPE ? process.env.STORAGE_TYPE : 'local'
}

// Initialize Google Cloud Storage (only if storage type is GCS)
let storage: Storage | null = null
const bucketName = 'thub-files'

if (getStorageType() === 'gcs' || (process.env.NODE_ENV === 'production' && getStorageType() !== 'azure' && getStorageType() !== 's3')) {
    // Validate required environment variables for GCS
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
        throw new Error(`Missing required environment variables for GCS: ${missingVars.join(', ')}`)
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

    // Validate private key format
    if (!storageCredentials.private_key?.startsWith('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Private key does not have the correct format')
    }

    storage = new Storage({
        credentials: storageCredentials
    })
}

// Function to create a folder in GCS
async function createFolderInGCS(folderPath: string): Promise<void> {
    if (!storage) {
        throw new Error('Google Cloud Storage is not initialized')
    }
    const file = storage.bucket(bucketName).file(`${folderPath}/`)
    await file.save('')
    console.log(`Folder ${folderPath} created in GCS bucket ${bucketName}`)
}

// Function to get Azure Blob Storage configuration
const getAzureConfig = () => {
    const rawAccountName = normalizeEnvValue(process.env.AZURE_STORAGE_ACCOUNT_NAME)
    const accountName = rawAccountName ? normalizeAzureAccountName(rawAccountName) : undefined
    const accountKey = normalizeEnvValue(process.env.AZURE_STORAGE_ACCOUNT_KEY)
    const containerName = normalizeEnvValue(process.env.AZURE_STORAGE_CONTAINER_NAME) || 'thub-storage'
    const connectionString = normalizeEnvValue(process.env.AZURE_STORAGE_CONNECTION_STRING)

    if (!connectionString && (!accountName || !accountKey)) {
        throw new Error(
            'Azure storage configuration is missing. Provide either AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY or AZURE_STORAGE_CONNECTION_STRING'
        )
    }

    let blobServiceClient: BlobServiceClient

    if (connectionString) {
        try {
            blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
        } catch (error: any) {
            if (!accountName || !accountKey) {
                throw error
            }
            console.warn(
                `[DataSource] Failed to parse AZURE_STORAGE_CONNECTION_STRING. Falling back to account name/key auth. Reason: ${
                    error?.message || 'unknown'
                }`
            )
            const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)
            blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential)
        }
    } else {
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName!, accountKey!)
        blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential)
    }

    const containerClient = blobServiceClient.getContainerClient(containerName)

    return { containerClient, containerName, blobServiceClient }
}

// Function to create a folder (blob prefix) in Azure Blob Storage
async function createFolderInAzure(folderPath: string): Promise<void> {
    const { containerClient, containerName } = getAzureConfig()

    // Ensure container exists (null = private access)
    await containerClient.createIfNotExists()

    // Create a marker blob to represent the folder
    const blobName = `${folderPath}/`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    try {
        await blockBlobClient.upload('', 0, {
            blobHTTPHeaders: {
                blobContentType: 'application/x-directory'
            }
        })
        console.log(`Folder ${folderPath} created in Azure container ${containerName}`)
    } catch (error: any) {
        console.error(`Failed to create folder ${folderPath} in Azure:`, error.message)
        throw error
    }
}

// Function to create local folder
function createLocalFolder(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
        console.log(`Local folder created at ${folderPath}`)
    } else {
        console.log(`Local folder already exists at ${folderPath}`)
    }
}

export const init = async (): Promise<void> => {
    let homePath
    const thubPath = path.join(getUserHome(), '.thub')
    const storageType = getStorageType()

    // Create local .thub directory
    if (!fs.existsSync(thubPath)) {
        fs.mkdirSync(thubPath)
        console.log(`.thub directory created at ${thubPath}`)
    } else {
        console.log(`.thub directory already exists at ${thubPath}`)
    }

    // Initialize storage based on type
    try {
        if (storageType === 'azure') {
            console.log('Initializing Azure Blob Storage...')
            await createFolderInAzure('.thub')
            await createFolderInAzure('.thub/storage')
            console.log('Azure Blob Storage initialized successfully')
        } else if (storageType === 'gcs' || (process.env.NODE_ENV === 'production' && storageType !== 's3')) {
            console.log('Initializing Google Cloud Storage...')
            await createFolderInGCS('.thub')
            await createFolderInGCS('.thub/storage')
            console.log('Google Cloud Storage initialized successfully')
        } else if (storageType === 's3') {
            console.log('Using S3 storage (no folder initialization needed)')
            // S3 doesn't require folder creation - folders are virtual based on key prefixes
        } else {
            console.log('Using local storage')
            const localStoragePath = path.join(thubPath, 'storage')
            createLocalFolder(localStoragePath)
        }
    } catch (error: any) {
        console.error('Error initializing storage:', error.message)
        // Don't throw - allow the app to continue with database initialization
    }

    // Initialize database
    switch (process.env.DATABASE_TYPE) {
        case 'sqlite':
            homePath = process.env.DATABASE_PATH ?? thubPath
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
                extra: {
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0,
                    connectTimeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10000', 10),
                    acquireTimeout: parseInt(process.env.DATABASE_ACQUIRE_TIMEOUT || '10000', 10)
                },
                ssl: {
                    rejectUnauthorized: false
                }
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
            homePath = process.env.DATABASE_PATH ?? thubPath
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
