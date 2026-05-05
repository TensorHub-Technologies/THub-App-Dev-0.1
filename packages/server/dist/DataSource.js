"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
exports.getDataSource = getDataSource;
require("reflect-metadata");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const typeorm_1 = require("typeorm");
const utils_1 = require("./utils");
const entities_1 = require("./database/entities");
const sqlite_1 = require("./database/migrations/sqlite");
const mysql_1 = require("./database/migrations/mysql");
const mariadb_1 = require("./database/migrations/mariadb");
const postgres_1 = require("./database/migrations/postgres");
const storage_1 = require("@google-cloud/storage");
const storage_blob_1 = require("@azure/storage-blob");
let appDataSource;
/**
 * Get the storage type from environment
 */
const getStorageType = () => {
    return process.env.STORAGE_TYPE ? process.env.STORAGE_TYPE : 'local';
};
// Initialize Google Cloud Storage (only if storage type is GCS)
let storage = null;
const bucketName = 'thub-files';
if (getStorageType() === 'gcs' || (process.env.NODE_ENV === 'production' && getStorageType() !== 'azure' && getStorageType() !== 's3')) {
    // Validate required environment variables for GCS
    const requiredEnvVars = [
        'GOOGLE_CLOUD_TYPE',
        'GOOGLE_CLOUD_PROJECT_ID',
        'GOOGLE_CLOUD_PRIVATE_KEY_ID',
        'GOOGLE_CLOUD_PRIVATE_KEY',
        'GOOGLE_CLOUD_CLIENT_EMAIL',
        'GOOGLE_CLOUD_CLIENT_ID'
    ];
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables for GCS: ${missingVars.join(', ')}`);
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
    };
    // Validate private key format
    if (!storageCredentials.private_key?.startsWith('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Private key does not have the correct format');
    }
    storage = new storage_1.Storage({
        credentials: storageCredentials
    });
}
// Function to create a folder in GCS
async function createFolderInGCS(folderPath) {
    if (!storage) {
        throw new Error('Google Cloud Storage is not initialized');
    }
    const file = storage.bucket(bucketName).file(`${folderPath}/`);
    await file.save('');
    console.log(`Folder ${folderPath} created in GCS bucket ${bucketName}`);
}
// Function to get Azure Blob Storage configuration
const getAzureConfig = () => {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'thub-storage';
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!accountName || (!accountKey && !connectionString)) {
        throw new Error('Azure storage configuration is missing. Provide either AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY or AZURE_STORAGE_CONNECTION_STRING');
    }
    let blobServiceClient;
    if (connectionString) {
        blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
    }
    else {
        const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, accountKey);
        blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
    }
    const containerClient = blobServiceClient.getContainerClient(containerName);
    return { containerClient, containerName, blobServiceClient };
};
// Function to create a folder (blob prefix) in Azure Blob Storage
async function createFolderInAzure(folderPath) {
    const { containerClient, containerName } = getAzureConfig();
    // Ensure container exists (null = private access)
    await containerClient.createIfNotExists();
    // Create a marker blob to represent the folder
    const blobName = `${folderPath}/`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
        await blockBlobClient.upload('', 0, {
            blobHTTPHeaders: {
                blobContentType: 'application/x-directory'
            }
        });
        console.log(`Folder ${folderPath} created in Azure container ${containerName}`);
    }
    catch (error) {
        console.error(`Failed to create folder ${folderPath} in Azure:`, error.message);
        throw error;
    }
}
// Function to create local folder
function createLocalFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Local folder created at ${folderPath}`);
    }
    else {
        console.log(`Local folder already exists at ${folderPath}`);
    }
}
const init = async () => {
    let homePath;
    const thubPath = path_1.default.join((0, utils_1.getUserHome)(), '.thub');
    const storageType = getStorageType();
    // Create local .thub directory
    if (!fs.existsSync(thubPath)) {
        fs.mkdirSync(thubPath);
        console.log(`.thub directory created at ${thubPath}`);
    }
    else {
        console.log(`.thub directory already exists at ${thubPath}`);
    }
    // Initialize storage based on type
    try {
        if (storageType === 'azure') {
            console.log('Initializing Azure Blob Storage...');
            await createFolderInAzure('.thub');
            await createFolderInAzure('.thub/storage');
            console.log('Azure Blob Storage initialized successfully');
        }
        else if (storageType === 'gcs' || (process.env.NODE_ENV === 'production' && storageType !== 's3')) {
            console.log('Initializing Google Cloud Storage...');
            await createFolderInGCS('.thub');
            await createFolderInGCS('.thub/storage');
            console.log('Google Cloud Storage initialized successfully');
        }
        else if (storageType === 's3') {
            console.log('Using S3 storage (no folder initialization needed)');
            // S3 doesn't require folder creation - folders are virtual based on key prefixes
        }
        else {
            console.log('Using local storage');
            const localStoragePath = path_1.default.join(thubPath, 'storage');
            createLocalFolder(localStoragePath);
        }
    }
    catch (error) {
        console.error('Error initializing storage:', error.message);
        // Don't throw - allow the app to continue with database initialization
    }
    // Initialize database
    switch (process.env.DATABASE_TYPE) {
        case 'sqlite':
            homePath = process.env.DATABASE_PATH ?? thubPath;
            appDataSource = new typeorm_1.DataSource({
                type: 'sqlite',
                database: path_1.default.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities_1.entities),
                migrations: sqlite_1.sqliteMigrations
            });
            break;
        case 'mysql':
            appDataSource = new typeorm_1.DataSource({
                type: 'mysql',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities_1.entities),
                migrations: mysql_1.mysqlMigrations,
                extra: {
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0,
                    connectTimeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10000', 10),
                    acquireTimeout: parseInt(process.env.DATABASE_ACQUIRE_TIMEOUT || '10000', 10)
                },
                ssl: {
                    rejectUnauthorized: false
                }
            });
            break;
        case 'mariadb':
            appDataSource = new typeorm_1.DataSource({
                type: 'mariadb',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities_1.entities),
                migrations: mariadb_1.mariadbMigrations,
                ssl: getDatabaseSSLFromEnv()
            });
            break;
        case 'postgres':
            appDataSource = new typeorm_1.DataSource({
                type: 'postgres',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '5432'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                ssl: getDatabaseSSLFromEnv(),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities_1.entities),
                migrations: postgres_1.postgresMigrations
            });
            break;
        default:
            homePath = process.env.DATABASE_PATH ?? thubPath;
            appDataSource = new typeorm_1.DataSource({
                type: 'sqlite',
                database: path_1.default.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities_1.entities),
                migrations: sqlite_1.sqliteMigrations
            });
            break;
    }
};
exports.init = init;
function getDataSource() {
    if (appDataSource === undefined) {
        (0, exports.init)();
    }
    return appDataSource;
}
const getDatabaseSSLFromEnv = () => {
    if (process.env.DATABASE_SSL_KEY_BASE64) {
        return {
            rejectUnauthorized: false,
            ca: Buffer.from(process.env.DATABASE_SSL_KEY_BASE64, 'base64')
        };
    }
    else if (process.env.DATABASE_SSL === 'true') {
        return true;
    }
    return undefined;
};
//# sourceMappingURL=DataSource.js.map