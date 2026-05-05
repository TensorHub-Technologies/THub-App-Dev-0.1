"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getS3Config = exports.streamStorageFile = exports.removeFolderFromStorage = exports.removeSpecificFileFromStorage = exports.removeSpecificFileFromUpload = exports.removeFilesFromStorage = exports.getStoragePath = exports.getFileFromStorage = exports.getFileFromUpload = exports.addSingleFileToStorage = exports.addArrayFilesToStorage = exports.addBase64FilesToStorage = exports.getAzureConfig = exports.getStorageType = void 0;
exports.getFileFromGCS = getFileFromGCS;
exports.getFileFromAzure = getFileFromAzure;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_s3_1 = require("@aws-sdk/client-s3");
const node_stream_1 = require("node:stream");
const utils_1 = require("./utils");
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const storage_1 = require("@google-cloud/storage");
const storage_blob_1 = require("@azure/storage-blob");
// Validate required environment variables for GCS
const requiredEnvVars = [
    'GOOGLE_CLOUD_TYPE',
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_PRIVATE_KEY_ID',
    'GOOGLE_CLOUD_PRIVATE_KEY',
    'GOOGLE_CLOUD_CLIENT_EMAIL',
    'GOOGLE_CLOUD_CLIENT_ID'
];
const getStorageType = () => {
    return process.env.STORAGE_TYPE ? process.env.STORAGE_TYPE : 'azure';
};
exports.getStorageType = getStorageType;
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0 && process.env.NODE_ENV === 'production' && (0, exports.getStorageType)() !== 'azure') {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
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
// Initialize GCS storage (only if not using Azure)
let storage = null;
if ((0, exports.getStorageType)() !== 'azure' && process.env.NODE_ENV === 'production') {
    // Debug logging (consider removing in production)
    console.log('Private Key received (first 50 chars):', storageCredentials.private_key?.substring(0, 50) + '...');
    console.log('Private Key length:', storageCredentials.private_key ? storageCredentials.private_key.length : 'undefined');
    console.log('Private Key contains actual newlines:', storageCredentials.private_key ? storageCredentials.private_key.includes('\n') : 'undefined');
    console.log('Private Key starts with BEGIN:', storageCredentials.private_key ? storageCredentials.private_key.startsWith('-----BEGIN') : 'undefined');
    // Validate private key format
    if (!storageCredentials.private_key?.startsWith('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Private key does not have the correct format');
    }
    storage = new storage_1.Storage({
        credentials: storageCredentials
    });
}
const bucketName = 'thub-files';
/**
 * Get Azure Blob Storage configuration
 */
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
    return { containerClient, containerName };
};
exports.getAzureConfig = getAzureConfig;
const addBase64FilesToStorage = async (fileBase64, chatflowid, fileNames) => {
    console.log('document uploaded to addBase64FilesToStorage');
    const storageType = (0, exports.getStorageType)();
    if (storageType === 's3') {
        const { s3Client, Bucket } = (0, exports.getS3Config)();
        const splitDataURI = fileBase64.split(',');
        const filename = splitDataURI.pop()?.split(':')[1] ?? '';
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64');
        const mime = splitDataURI[0].split(':')[1].split(';')[0];
        const sanitizedFilename = _sanitizeFilename(filename);
        const Key = chatflowid + '/' + sanitizedFilename;
        const putObjCmd = new client_s3_1.PutObjectCommand({
            Bucket,
            Key,
            ContentEncoding: 'base64',
            ContentType: mime,
            Body: bf
        });
        await s3Client.send(putObjCmd);
        fileNames.push(sanitizedFilename);
        return 'FILE-STORAGE::' + JSON.stringify(fileNames);
    }
    else if (storageType === 'azure') {
        const { containerClient } = (0, exports.getAzureConfig)();
        const splitDataURI = fileBase64.split(',');
        const filename = splitDataURI.pop()?.split(':')[1] ?? '';
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64');
        const mime = splitDataURI[0].split(':')[1].split(';')[0];
        const sanitizedFilename = _sanitizeFilename(filename);
        const blobName = `.thub/storage/${chatflowid}/${sanitizedFilename}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        try {
            await blockBlobClient.upload(bf, bf.length, {
                blobHTTPHeaders: {
                    blobContentType: mime,
                    blobContentEncoding: 'base64'
                }
            });
            fileNames.push(sanitizedFilename);
            return 'FILE-STORAGE::' + JSON.stringify(fileNames);
        }
        catch (error) {
            console.error(`Failed to save file in Azure. Filename: ${sanitizedFilename}, Error: ${error.message}`);
            throw error;
        }
    }
    else if (process.env.NODE_ENV === 'production') {
        const splitDataURI = fileBase64.split(',');
        const filename = splitDataURI.pop()?.split(':')[1] ?? '';
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64');
        const mime = splitDataURI[0].split(':')[1].split(';')[0];
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(`.thub/storage/${chatflowid}/${filename}`);
        try {
            await file.save(bf, {
                metadata: {
                    contentType: mime,
                    contentEncoding: 'base64'
                },
                resumable: false
            });
            fileNames.push(filename);
            return 'FILE-STORAGE::' + JSON.stringify(fileNames);
        }
        catch (error) {
            console.error(`Failed to save file in GCS. Filename: ${filename}, Error: ${error.message}`);
            throw error;
        }
    }
    else {
        const dir = path_1.default.join((0, exports.getStoragePath)(), chatflowid);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const splitDataURI = fileBase64.split(',');
        const filename = splitDataURI.pop()?.split(':')[1] ?? '';
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64');
        const sanitizedFilename = _sanitizeFilename(filename);
        const filePath = path_1.default.join(dir, sanitizedFilename);
        fs_1.default.writeFileSync(filePath, bf);
        fileNames.push(sanitizedFilename);
        return 'FILE-STORAGE::' + JSON.stringify(fileNames);
    }
};
exports.addBase64FilesToStorage = addBase64FilesToStorage;
const addArrayFilesToStorage = async (mime, bf, fileName, fileNames, ...paths) => {
    const storageType = (0, exports.getStorageType)();
    const sanitizedFilename = _sanitizeFilename(fileName);
    if (storageType === 's3') {
        const { s3Client, Bucket } = (0, exports.getS3Config)();
        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + sanitizedFilename;
        if (Key.startsWith('/')) {
            Key = Key.substring(1);
        }
        const putObjCmd = new client_s3_1.PutObjectCommand({
            Bucket,
            Key,
            ContentEncoding: 'base64',
            ContentType: mime,
            Body: bf
        });
        await s3Client.send(putObjCmd);
        fileNames.push(sanitizedFilename);
        return 'FILE-STORAGE::' + JSON.stringify(fileNames);
    }
    else if (storageType === 'azure') {
        const { containerClient } = (0, exports.getAzureConfig)();
        let filePath = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + fileName;
        if (filePath.startsWith('/')) {
            filePath = filePath.substring(1);
        }
        const blobName = `.thub/storage/${filePath}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        try {
            await blockBlobClient.upload(bf, bf.length, {
                blobHTTPHeaders: {
                    blobContentType: mime,
                    blobContentEncoding: 'base64'
                }
            });
            fileNames.push(fileName);
            return 'FILE-STORAGE::' + JSON.stringify(fileNames);
        }
        catch (error) {
            console.error(`Failed to save file in Azure. FileName: ${fileName}, Error: ${error.message}`);
            throw error;
        }
    }
    else if (process.env.NODE_ENV === 'production') {
        let filePath = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + fileName;
        if (filePath.startsWith('/')) {
            filePath = filePath.substring(1);
        }
        const gcsFilePath = `.thub/storage/${filePath}`;
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(gcsFilePath);
        try {
            await file.save(bf, {
                metadata: {
                    contentType: mime,
                    contentEncoding: 'base64'
                },
                resumable: false
            });
            fileNames.push(fileName);
            return 'FILE-STORAGE::' + JSON.stringify(fileNames);
        }
        catch (error) {
            console.error(`Failed to save file in GCS. FileName: ${fileName}, Error: ${error.message}`);
            throw error;
        }
    }
    else {
        const dir = path_1.default.join((0, exports.getStoragePath)(), ...paths.map(_sanitizeFilename));
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const filePath = path_1.default.join(dir, sanitizedFilename);
        fs_1.default.writeFileSync(filePath, bf);
        fileNames.push(sanitizedFilename);
        return 'FILE-STORAGE::' + JSON.stringify(fileNames);
    }
};
exports.addArrayFilesToStorage = addArrayFilesToStorage;
const addSingleFileToStorage = async (mime, bf, fileName, ...paths) => {
    const storageType = (0, exports.getStorageType)();
    const sanitizedFilename = _sanitizeFilename(fileName);
    if (storageType === 's3') {
        const { s3Client, Bucket } = (0, exports.getS3Config)();
        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + sanitizedFilename;
        if (Key.startsWith('/')) {
            Key = Key.substring(1);
        }
        const putObjCmd = new client_s3_1.PutObjectCommand({
            Bucket,
            Key,
            ContentEncoding: 'base64',
            ContentType: mime,
            Body: bf
        });
        await s3Client.send(putObjCmd);
        return 'FILE-STORAGE::' + sanitizedFilename;
    }
    else if (storageType === 'azure') {
        const { containerClient } = (0, exports.getAzureConfig)();
        let filePath = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + sanitizedFilename;
        if (filePath.startsWith('/')) {
            filePath = filePath.substring(1);
        }
        const blobName = `.thub/storage/${filePath}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        try {
            await blockBlobClient.upload(bf, bf.length, {
                blobHTTPHeaders: {
                    blobContentType: mime,
                    blobContentEncoding: 'base64'
                }
            });
            return 'FILE-STORAGE::' + fileName;
        }
        catch (error) {
            console.error(`Failed to save file in Azure. FileName: ${fileName}, Error: ${error.message}`);
            throw error;
        }
    }
    else if (process.env.NODE_ENV === 'production') {
        let filePath = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + sanitizedFilename;
        if (filePath.startsWith('/')) {
            filePath = filePath.substring(1);
        }
        const gcsFilePath = `.thub/storage/${filePath}`;
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(gcsFilePath);
        try {
            await file.save(bf, {
                metadata: {
                    contentType: mime,
                    contentEncoding: 'base64'
                },
                resumable: false
            });
            return 'FILE-STORAGE::' + fileName;
        }
        catch (error) {
            console.error(`Failed to save file in GCS. FileName: ${fileName}, Error: ${error.message}`);
            throw error;
        }
    }
    else {
        const dir = path_1.default.join((0, exports.getStoragePath)(), ...paths.map(_sanitizeFilename));
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const filePath = path_1.default.join(dir, sanitizedFilename);
        fs_1.default.writeFileSync(filePath, bf);
        return 'FILE-STORAGE::' + sanitizedFilename;
    }
};
exports.addSingleFileToStorage = addSingleFileToStorage;
/**
 * Read file from Google Cloud Storage and return as Buffer
 * @param filePath - Path to the file in GCS
 */
async function getFileFromGCS(filePaths) {
    console.log('getFileFromGCS: ', filePaths);
    const file = storage.bucket(bucketName).file(filePaths);
    const [fileBuffer] = await file.download();
    return fileBuffer;
}
/**
 * Read file from Azure Blob Storage and return as Buffer
 * @param blobName - Name/path of the blob in Azure
 */
async function getFileFromAzure(blobName) {
    console.log('getFileFromAzure: ', blobName);
    const { containerClient } = (0, exports.getAzureConfig)();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadResponse = await blockBlobClient.download();
    const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
    return downloaded;
}
/**
 * Helper function to convert stream to buffer
 */
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}
const getFileFromUpload = async (filePath) => {
    const storageType = (0, exports.getStorageType)();
    if (storageType === 's3') {
        const { s3Client, Bucket } = (0, exports.getS3Config)();
        let Key = filePath;
        if (Key.startsWith('/')) {
            Key = Key.substring(1);
        }
        const getParams = {
            Bucket,
            Key
        };
        const response = await s3Client.send(new client_s3_1.GetObjectCommand(getParams));
        const body = response.Body;
        if (body instanceof node_stream_1.Readable) {
            const streamToString = await body.transformToString('base64');
            if (streamToString) {
                return Buffer.from(streamToString, 'base64');
            }
        }
        // @ts-ignore
        const buffer = Buffer.concat(response.Body.toArray());
        return buffer;
    }
    else if (storageType === 'azure') {
        let blobName = filePath;
        if (blobName.startsWith('/')) {
            blobName = blobName.substring(1);
        }
        return await getFileFromAzure(blobName);
    }
    else {
        return fs_1.default.readFileSync(filePath);
    }
};
exports.getFileFromUpload = getFileFromUpload;
const getFileFromStorage = async (file, ...paths) => {
    console.log('getFileFromStorage: ', paths);
    const storageType = (0, exports.getStorageType)();
    const sanitizedFilename = _sanitizeFilename(file);
    if (storageType === 's3') {
        const { s3Client, Bucket } = (0, exports.getS3Config)();
        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + sanitizedFilename;
        if (Key.startsWith('/')) {
            Key = Key.substring(1);
        }
        const getParams = {
            Bucket,
            Key
        };
        const response = await s3Client.send(new client_s3_1.GetObjectCommand(getParams));
        const body = response.Body;
        if (body instanceof node_stream_1.Readable) {
            const streamToString = await body.transformToString('base64');
            if (streamToString) {
                return Buffer.from(streamToString, 'base64');
            }
        }
        // @ts-ignore
        const buffer = Buffer.concat(response.Body.toArray());
        return buffer;
    }
    else if (storageType === 'azure') {
        const filePath = path_1.default.join('.thub/storage', ...paths, file);
        const blobName = filePath.replace(/\\/g, '/');
        const fileBuffer = await getFileFromAzure(blobName);
        return fileBuffer;
    }
    else if (process.env.NODE_ENV === 'production') {
        console.log(process.env.NODE_ENV, 'process.env.NODE_ENV');
        const filePath = path_1.default.join('.thub/storage', ...paths, file);
        const filePaths = filePath.replace(/\\/g, '/');
        const fileBuffer = await getFileFromGCS(filePaths);
        return fileBuffer;
    }
    else {
        const fileInStorage = path_1.default.join((0, exports.getStoragePath)(), ...paths.map(_sanitizeFilename), sanitizedFilename);
        return fs_1.default.readFileSync(fileInStorage);
    }
};
exports.getFileFromStorage = getFileFromStorage;
/**
 * Prepare storage path
 */
const getStoragePath = () => {
    console.log('getStoragePath: ', process.env.BLOB_STORAGE_PATH ? path_1.default.join(process.env.BLOB_STORAGE_PATH) : path_1.default.join((0, utils_1.getUserHome)(), '.thub', 'storage'));
    return process.env.BLOB_STORAGE_PATH ? path_1.default.join(process.env.BLOB_STORAGE_PATH) : path_1.default.join((0, utils_1.getUserHome)(), '.thub', 'storage');
};
exports.getStoragePath = getStoragePath;
const removeFilesFromStorage = async (...paths) => {
    const storageType = (0, exports.getStorageType)();
    if (storageType === 's3') {
        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '');
        if (Key.startsWith('/')) {
            Key = Key.substring(1);
        }
        await _deleteS3Folder(Key);
    }
    else if (storageType === 'azure') {
        let blobPath = paths.reduce((acc, cur) => acc + '/' + cur, '');
        if (blobPath.startsWith('/')) {
            blobPath = blobPath.substring(1);
        }
        const { containerClient } = (0, exports.getAzureConfig)();
        const blobName = `.thub/storage/${blobPath}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        try {
            await blockBlobClient.delete();
        }
        catch (error) {
            console.error(`Failed to delete file from Azure. Path: ${blobPath}, Error: ${error.message}`);
            throw error;
        }
    }
    else if (process.env.NODE_ENV === 'production') {
        let gcsFilePath = paths.reduce((acc, cur) => acc + '/' + cur, '');
        if (gcsFilePath.startsWith('/')) {
            gcsFilePath = gcsFilePath.substring(1);
        }
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(`.thub/storage/${gcsFilePath}`);
        try {
            await file.delete();
        }
        catch (error) {
            console.error(`Failed to delete file from GCS. Path: ${gcsFilePath}, Error: ${error.message}`);
            throw error;
        }
    }
    else {
        const directory = path_1.default.join((0, exports.getStoragePath)(), ...paths.map(_sanitizeFilename));
        _deleteLocalFolderRecursive(directory);
    }
};
exports.removeFilesFromStorage = removeFilesFromStorage;
const removeSpecificFileFromUpload = async (filePath) => {
    const storageType = (0, exports.getStorageType)();
    if (storageType === 's3') {
        let Key = filePath;
        if (Key.startsWith('/')) {
            Key = Key.substring(1);
        }
        await _deleteS3Folder(Key);
    }
    else if (storageType === 'azure') {
        let blobName = filePath;
        if (blobName.startsWith('/')) {
            blobName = blobName.substring(1);
        }
        const { containerClient } = (0, exports.getAzureConfig)();
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        try {
            await blockBlobClient.delete();
        }
        catch (error) {
            console.error(`Failed to delete file from Azure. Path: ${blobName}, Error: ${error.message}`);
            throw error;
        }
    }
    else {
        fs_1.default.unlinkSync(filePath);
    }
};
exports.removeSpecificFileFromUpload = removeSpecificFileFromUpload;
const removeSpecificFileFromStorage = async (...paths) => {
    const storageType = (0, exports.getStorageType)();
    if (storageType === 's3') {
        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '');
        if (Key.startsWith('/')) {
            Key = Key.substring(1);
        }
        await _deleteS3Folder(Key);
    }
    else if (storageType === 'azure') {
        let blobPath = paths.reduce((acc, cur) => acc + '/' + cur, '');
        if (blobPath.startsWith('/')) {
            blobPath = blobPath.substring(1);
        }
        const { containerClient } = (0, exports.getAzureConfig)();
        const blobName = `.thub/storage/${blobPath}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        try {
            await blockBlobClient.delete();
        }
        catch (error) {
            console.error(`Failed to delete specific file from Azure. Path: ${blobPath}, Error: ${error.message}`);
            throw error;
        }
    }
    else if (process.env.NODE_ENV === 'production') {
        let gcsFilePath = paths.reduce((acc, cur) => acc + '/' + cur, '');
        if (gcsFilePath.startsWith('/')) {
            gcsFilePath = gcsFilePath.substring(1);
        }
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(`.thub/storage/${gcsFilePath}`);
        try {
            await file.delete();
        }
        catch (error) {
            console.error(`Failed to delete specific file from GCS. Path: ${gcsFilePath}, Error: ${error.message}`);
            throw error;
        }
    }
    else {
        const fileName = paths.pop();
        if (fileName) {
            const sanitizedFilename = _sanitizeFilename(fileName);
            paths.push(sanitizedFilename);
        }
        const file = path_1.default.join((0, exports.getStoragePath)(), ...paths.map(_sanitizeFilename));
        fs_1.default.unlinkSync(file);
    }
};
exports.removeSpecificFileFromStorage = removeSpecificFileFromStorage;
const removeFolderFromStorage = async (...paths) => {
    const storageType = (0, exports.getStorageType)();
    if (storageType === 's3') {
        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '');
        if (Key.startsWith('/')) {
            Key = Key.substring(1);
        }
        await _deleteS3Folder(Key);
    }
    else if (storageType === 'azure') {
        let azureFolderPath = paths.reduce((acc, cur) => acc + '/' + cur, '');
        if (azureFolderPath.startsWith('/')) {
            azureFolderPath = azureFolderPath.substring(1);
        }
        const { containerClient } = (0, exports.getAzureConfig)();
        const prefix = `.thub/storage/${azureFolderPath}`;
        // List all blobs with the prefix
        const blobs = containerClient.listBlobsFlat({ prefix });
        // Delete all blobs
        const deletePromises = [];
        for await (const blob of blobs) {
            const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
            deletePromises.push(blockBlobClient.delete());
        }
        if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
        }
    }
    else if (process.env.NODE_ENV === 'production') {
        let gcsFolderPath = paths.reduce((acc, cur) => acc + '/' + cur, '');
        if (gcsFolderPath.startsWith('/')) {
            gcsFolderPath = gcsFolderPath.substring(1);
        }
        const bucket = storage.bucket(bucketName);
        const [files] = await bucket.getFiles({ prefix: `.thub/storage/${gcsFolderPath}` });
        if (files.length > 0) {
            await Promise.all(files.map(async (file) => {
                await file.delete();
            }));
        }
    }
    else {
        const directory = path_1.default.join((0, exports.getStoragePath)(), ...paths.map(_sanitizeFilename));
        _deleteLocalFolderRecursive(directory, true);
    }
};
exports.removeFolderFromStorage = removeFolderFromStorage;
const _deleteLocalFolderRecursive = (directory, deleteParentChatflowFolder) => {
    if (fs_1.default.existsSync(directory)) {
        if (deleteParentChatflowFolder) {
            fs_1.default.rmSync(directory, { recursive: true, force: true });
        }
        else {
            fs_1.default.readdir(directory, (error, files) => {
                if (error)
                    console.error('Could not read directory');
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const file_path = path_1.default.join(directory, file);
                    fs_1.default.stat(file_path, (error, stat) => {
                        if (error)
                            console.error('File do not exist');
                        if (!stat.isDirectory()) {
                            fs_1.default.unlink(file_path, (error) => {
                                if (error)
                                    console.error('Could not delete file');
                            });
                            if (i === files.length - 1) {
                                fs_1.default.rmSync(directory, { recursive: true, force: true });
                            }
                        }
                        else {
                            _deleteLocalFolderRecursive(file_path);
                        }
                    });
                }
            });
        }
    }
};
const _deleteS3Folder = async (location) => {
    let count = 0;
    const { s3Client, Bucket } = (0, exports.getS3Config)();
    async function recursiveS3Delete(token) {
        const listCommand = new client_s3_1.ListObjectsV2Command({
            Bucket: Bucket,
            Prefix: location,
            ContinuationToken: token
        });
        let list = await s3Client.send(listCommand);
        if (list.KeyCount) {
            const deleteCommand = new client_s3_1.DeleteObjectsCommand({
                Bucket: Bucket,
                Delete: {
                    Objects: list.Contents?.map((item) => ({ Key: item.Key })),
                    Quiet: false
                }
            });
            let deleted = await s3Client.send(deleteCommand);
            // @ts-ignore
            count += deleted.Deleted.length;
            if (deleted.Errors) {
                deleted.Errors.map((error) => console.error(`${error.Key} could not be deleted - ${error.Code}`));
            }
        }
        if (list.NextContinuationToken) {
            await recursiveS3Delete(list.NextContinuationToken);
        }
        return `${count} files deleted from S3`;
    }
    return recursiveS3Delete();
};
const streamStorageFile = async (chatflowId, chatId, fileName) => {
    const storageType = (0, exports.getStorageType)();
    const sanitizedFilename = (0, sanitize_filename_1.default)(fileName);
    if (storageType === 's3') {
        const { s3Client, Bucket } = (0, exports.getS3Config)();
        const Key = chatflowId + '/' + chatId + '/' + sanitizedFilename;
        const getParams = {
            Bucket,
            Key
        };
        const response = await s3Client.send(new client_s3_1.GetObjectCommand(getParams));
        const body = response.Body;
        if (body instanceof node_stream_1.Readable) {
            const blob = await body.transformToByteArray();
            return Buffer.from(blob);
        }
    }
    else if (storageType === 'azure') {
        const blobName = `.thub/storage/${chatflowId}/${chatId}/${sanitizedFilename}`;
        const fileBuffer = await getFileFromAzure(blobName);
        return fileBuffer;
    }
    else if (process.env.NODE_ENV === 'production') {
        const filePath = `.thub/storage/${chatflowId}/${chatId}/${sanitizedFilename}`;
        const fileBuffer = await getFileFromGCS(filePath);
        return fileBuffer;
    }
    else {
        const filePath = path_1.default.join((0, exports.getStoragePath)(), chatflowId, chatId, sanitizedFilename);
        //raise error if file path is not absolute
        if (!path_1.default.isAbsolute(filePath))
            throw new Error(`Invalid file path`);
        //raise error if file path contains '..'
        if (filePath.includes('..'))
            throw new Error(`Invalid file path`);
        //only return from the storage folder
        if (!filePath.startsWith((0, exports.getStoragePath)()))
            throw new Error(`Invalid file path`);
        if (fs_1.default.existsSync(filePath)) {
            return fs_1.default.createReadStream(filePath);
        }
        else {
            throw new Error(`File ${fileName} not found`);
        }
    }
};
exports.streamStorageFile = streamStorageFile;
const getS3Config = () => {
    const accessKeyId = process.env.S3_STORAGE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_STORAGE_SECRET_ACCESS_KEY;
    const region = process.env.S3_STORAGE_REGION;
    const Bucket = process.env.S3_STORAGE_BUCKET_NAME;
    const customURL = process.env.S3_ENDPOINT_URL;
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true' ? true : false;
    if (!region || !Bucket) {
        throw new Error('S3 storage configuration is missing');
    }
    const s3Config = {
        region: region,
        endpoint: customURL,
        forcePathStyle: forcePathStyle
    };
    if (accessKeyId && secretAccessKey) {
        s3Config.credentials = {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
        };
    }
    const s3Client = new client_s3_1.S3Client(s3Config);
    return { s3Client, Bucket };
};
exports.getS3Config = getS3Config;
const _sanitizeFilename = (filename) => {
    if (filename) {
        let sanitizedFilename = (0, sanitize_filename_1.default)(filename);
        // remove all leading .
        return sanitizedFilename.replace(/^\.+/, '');
    }
    return '';
};
//# sourceMappingURL=storageUtils.js.map