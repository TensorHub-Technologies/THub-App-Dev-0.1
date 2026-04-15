import path from 'path'
import fs from 'fs'
import {
    DeleteObjectsCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
    S3ClientConfig
} from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'
import { getUserHome } from './utils.js'
import sanitize from 'sanitize-filename'
import { Storage } from '@google-cloud/storage'
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'

// Validate required environment variables for GCS
const requiredEnvVars = [
    'GOOGLE_CLOUD_TYPE',
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_PRIVATE_KEY_ID',
    'GOOGLE_CLOUD_PRIVATE_KEY',
    'GOOGLE_CLOUD_CLIENT_EMAIL',
    'GOOGLE_CLOUD_CLIENT_ID'
]

export const getStorageType = (): string => {
    return process.env.STORAGE_TYPE ? process.env.STORAGE_TYPE : 'azure'
}

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingVars.length > 0 && process.env.NODE_ENV === 'production' && getStorageType() !== 'azure') {
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

// Initialize GCS storage (only if not using Azure)
let storage: Storage | null = null
if (getStorageType() !== 'azure' && process.env.NODE_ENV === 'production') {
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

    storage = new Storage({
        credentials: storageCredentials
    })
}

const bucketName = 'thub-files'

/**
 * Get Azure Blob Storage configuration
 */
export const getAzureConfig = () => {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'thub-storage'
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

    if (!accountName || (!accountKey && !connectionString)) {
        throw new Error(
            'Azure storage configuration is missing. Provide either AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY or AZURE_STORAGE_CONNECTION_STRING'
        )
    }

    let blobServiceClient: BlobServiceClient

    if (connectionString) {
        blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    } else {
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName!, accountKey!)
        blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential)
    }

    const containerClient = blobServiceClient.getContainerClient(containerName)

    return { containerClient, containerName }
}

export const addBase64FilesToStorage = async (fileBase64: string, chatflowid: string, fileNames: string[]) => {
    console.log('document uploaded to addBase64FilesToStorage')
    const storageType = getStorageType()

    if (storageType === 's3') {
        const { s3Client, Bucket } = getS3Config()

        const splitDataURI = fileBase64.split(',')
        const filename = splitDataURI.pop()?.split(':')[1] ?? ''
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64')
        const mime = splitDataURI[0].split(':')[1].split(';')[0]

        const sanitizedFilename = _sanitizeFilename(filename)

        const Key = chatflowid + '/' + sanitizedFilename
        const putObjCmd = new PutObjectCommand({
            Bucket,
            Key,
            ContentEncoding: 'base64',
            ContentType: mime,
            Body: bf
        })
        await s3Client.send(putObjCmd)

        fileNames.push(sanitizedFilename)
        return 'FILE-STORAGE::' + JSON.stringify(fileNames)
    } else if (storageType === 'azure') {
        const { containerClient } = getAzureConfig()

        const splitDataURI = fileBase64.split(',')
        const filename = splitDataURI.pop()?.split(':')[1] ?? ''
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64')
        const mime = splitDataURI[0].split(':')[1].split(';')[0]

        const sanitizedFilename = _sanitizeFilename(filename)
        const blobName = `.flowise/storage/${chatflowid}/${sanitizedFilename}`

        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        try {
            await blockBlobClient.upload(bf, bf.length, {
                blobHTTPHeaders: {
                    blobContentType: mime,
                    blobContentEncoding: 'base64'
                }
            })

            fileNames.push(sanitizedFilename)
            return 'FILE-STORAGE::' + JSON.stringify(fileNames)
        } catch (error: any) {
            console.error(`Failed to save file in Azure. Filename: ${sanitizedFilename}, Error: ${error.message}`)
            throw error
        }
    } else if (process.env.NODE_ENV === 'production') {
        const splitDataURI = fileBase64.split(',')
        const filename = splitDataURI.pop()?.split(':')[1] ?? ''
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64')
        const mime = splitDataURI[0].split(':')[1].split(';')[0]

        const bucket = storage!.bucket(bucketName)
        const file = bucket.file(`.flowise/storage/${chatflowid}/${filename}`)

        try {
            await file.save(bf, {
                metadata: {
                    contentType: mime,
                    contentEncoding: 'base64'
                },
                resumable: false
            })

            fileNames.push(filename)
            return 'FILE-STORAGE::' + JSON.stringify(fileNames)
        } catch (error: any) {
            console.error(`Failed to save file in GCS. Filename: ${filename}, Error: ${error.message}`)
            throw error
        }
    } else {
        const dir = path.join(getStoragePath(), chatflowid)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        const splitDataURI = fileBase64.split(',')
        const filename = splitDataURI.pop()?.split(':')[1] ?? ''
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64')
        const sanitizedFilename = _sanitizeFilename(filename)

        const filePath = path.join(dir, sanitizedFilename)
        fs.writeFileSync(filePath, bf)
        fileNames.push(sanitizedFilename)
        return 'FILE-STORAGE::' + JSON.stringify(fileNames)
    }
}

export const addArrayFilesToStorage = async (mime: string, bf: Buffer, fileName: string, fileNames: string[], ...paths: string[]) => {
    const storageType = getStorageType()

    const sanitizedFilename = _sanitizeFilename(fileName)

    if (storageType === 's3') {
        const { s3Client, Bucket } = getS3Config()

        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + sanitizedFilename
        if (Key.startsWith('/')) {
            Key = Key.substring(1)
        }

        const putObjCmd = new PutObjectCommand({
            Bucket,
            Key,
            ContentEncoding: 'base64',
            ContentType: mime,
            Body: bf
        })
        await s3Client.send(putObjCmd)
        fileNames.push(sanitizedFilename)
        return 'FILE-STORAGE::' + JSON.stringify(fileNames)
    } else if (storageType === 'azure') {
        const { containerClient } = getAzureConfig()

        let filePath = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + fileName
        if (filePath.startsWith('/')) {
            filePath = filePath.substring(1)
        }
        const blobName = `.flowise/storage/${filePath}`

        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        try {
            await blockBlobClient.upload(bf, bf.length, {
                blobHTTPHeaders: {
                    blobContentType: mime,
                    blobContentEncoding: 'base64'
                }
            })

            fileNames.push(fileName)
            return 'FILE-STORAGE::' + JSON.stringify(fileNames)
        } catch (error: any) {
            console.error(`Failed to save file in Azure. FileName: ${fileName}, Error: ${error.message}`)
            throw error
        }
    } else if (process.env.NODE_ENV === 'production') {
        let filePath = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + fileName
        if (filePath.startsWith('/')) {
            filePath = filePath.substring(1)
        }
        const gcsFilePath = `.flowise/storage/${filePath}`
        const bucket = storage!.bucket(bucketName)
        const file = bucket.file(gcsFilePath)

        try {
            await file.save(bf, {
                metadata: {
                    contentType: mime,
                    contentEncoding: 'base64'
                },
                resumable: false
            })

            fileNames.push(fileName)
            return 'FILE-STORAGE::' + JSON.stringify(fileNames)
        } catch (error: any) {
            console.error(`Failed to save file in GCS. FileName: ${fileName}, Error: ${error.message}`)
            throw error
        }
    } else {
        const dir = path.join(getStoragePath(), ...paths.map(_sanitizeFilename))
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        const filePath = path.join(dir, sanitizedFilename)
        fs.writeFileSync(filePath, bf)
        fileNames.push(sanitizedFilename)
        return 'FILE-STORAGE::' + JSON.stringify(fileNames)
    }
}

export const addSingleFileToStorage = async (mime: string, bf: Buffer, fileName: string, ...paths: string[]) => {
    const storageType = getStorageType()
    const sanitizedFilename = _sanitizeFilename(fileName)

    if (storageType === 's3') {
        const { s3Client, Bucket } = getS3Config()

        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + sanitizedFilename
        if (Key.startsWith('/')) {
            Key = Key.substring(1)
        }

        const putObjCmd = new PutObjectCommand({
            Bucket,
            Key,
            ContentEncoding: 'base64',
            ContentType: mime,
            Body: bf
        })
        await s3Client.send(putObjCmd)
        return 'FILE-STORAGE::' + sanitizedFilename
    } else if (storageType === 'azure') {
        const { containerClient } = getAzureConfig()

        let filePath = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + sanitizedFilename
        if (filePath.startsWith('/')) {
            filePath = filePath.substring(1)
        }

        const blobName = `.flowise/storage/${filePath}`
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        try {
            await blockBlobClient.upload(bf, bf.length, {
                blobHTTPHeaders: {
                    blobContentType: mime,
                    blobContentEncoding: 'base64'
                }
            })

            return 'FILE-STORAGE::' + fileName
        } catch (error: any) {
            console.error(`Failed to save file in Azure. FileName: ${fileName}, Error: ${error.message}`)
            throw error
        }
    } else if (process.env.NODE_ENV === 'production') {
        let filePath = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + sanitizedFilename
        if (filePath.startsWith('/')) {
            filePath = filePath.substring(1)
        }

        const gcsFilePath = `.flowise/storage/${filePath}`
        const bucket = storage!.bucket(bucketName)
        const file = bucket.file(gcsFilePath)

        try {
            await file.save(bf, {
                metadata: {
                    contentType: mime,
                    contentEncoding: 'base64'
                },
                resumable: false
            })

            return 'FILE-STORAGE::' + fileName
        } catch (error: any) {
            console.error(`Failed to save file in GCS. FileName: ${fileName}, Error: ${error.message}`)
            throw error
        }
    } else {
        const dir = path.join(getStoragePath(), ...paths.map(_sanitizeFilename))
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        const filePath = path.join(dir, sanitizedFilename)
        fs.writeFileSync(filePath, bf)
        return 'FILE-STORAGE::' + sanitizedFilename
    }
}

/**
 * Read file from Google Cloud Storage and return as Buffer
 * @param filePath - Path to the file in GCS
 */
export async function getFileFromGCS(filePaths: string): Promise<Buffer> {
    console.log('getFileFromGCS: ', filePaths)
    const file = storage!.bucket(bucketName).file(filePaths)
    const [fileBuffer] = await file.download()
    return fileBuffer
}

/**
 * Read file from Azure Blob Storage and return as Buffer
 * @param blobName - Name/path of the blob in Azure
 */
export async function getFileFromAzure(blobName: string): Promise<Buffer> {
    console.log('getFileFromAzure: ', blobName)
    const { containerClient } = getAzureConfig()
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    const downloadResponse = await blockBlobClient.download()
    const downloaded = await streamToBuffer(downloadResponse.readableStreamBody!)
    return downloaded
}

/**
 * Helper function to convert stream to buffer
 */
async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data))
        })
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks))
        })
        readableStream.on('error', reject)
    })
}

export const getFileFromUpload = async (filePath: string): Promise<Buffer> => {
    const storageType = getStorageType()

    if (storageType === 's3') {
        const { s3Client, Bucket } = getS3Config()

        let Key = filePath
        if (Key.startsWith('/')) {
            Key = Key.substring(1)
        }
        const getParams = {
            Bucket,
            Key
        }

        const response = await s3Client.send(new GetObjectCommand(getParams))
        const body = response.Body
        if (body instanceof Readable) {
            const streamToString = await body.transformToString('base64')
            if (streamToString) {
                return Buffer.from(streamToString, 'base64')
            }
        }
        // @ts-ignore
        const buffer = Buffer.concat(response.Body.toArray())
        return buffer
    } else if (storageType === 'azure') {
        let blobName = filePath
        if (blobName.startsWith('/')) {
            blobName = blobName.substring(1)
        }
        return await getFileFromAzure(blobName)
    } else {
        return fs.readFileSync(filePath)
    }
}

export const getFileFromStorage = async (file: string, ...paths: string[]): Promise<Buffer> => {
    console.log('getFileFromStorage: ', paths)
    const storageType = getStorageType()
    const sanitizedFilename = _sanitizeFilename(file)

    if (storageType === 's3') {
        const { s3Client, Bucket } = getS3Config()

        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '') + '/' + sanitizedFilename
        if (Key.startsWith('/')) {
            Key = Key.substring(1)
        }

        const getParams = {
            Bucket,
            Key
        }

        const response = await s3Client.send(new GetObjectCommand(getParams))
        const body = response.Body
        if (body instanceof Readable) {
            const streamToString = await body.transformToString('base64')
            if (streamToString) {
                return Buffer.from(streamToString, 'base64')
            }
        }
        // @ts-ignore
        const buffer = Buffer.concat(response.Body.toArray())
        return buffer
    } else if (storageType === 'azure') {
        const filePath = path.join('.flowise/storage', ...paths, file)
        const blobName = filePath.replace(/\\/g, '/')
        const fileBuffer = await getFileFromAzure(blobName)
        return fileBuffer
    } else if (process.env.NODE_ENV === 'production') {
        console.log(process.env.NODE_ENV, 'process.env.NODE_ENV')
        const filePath = path.join('.flowise/storage', ...paths, file)
        const filePaths = filePath.replace(/\\/g, '/')
        const fileBuffer = await getFileFromGCS(filePaths)
        return fileBuffer
    } else {
        const fileInStorage = path.join(getStoragePath(), ...paths.map(_sanitizeFilename), sanitizedFilename)
        return fs.readFileSync(fileInStorage)
    }
}

/**
 * Prepare storage path
 */
export const getStoragePath = (): string => {
    console.log(
        'getStoragePath: ',
        process.env.BLOB_STORAGE_PATH ? path.join(process.env.BLOB_STORAGE_PATH) : path.join(getUserHome(), '.flowise', 'storage')
    )
    return process.env.BLOB_STORAGE_PATH ? path.join(process.env.BLOB_STORAGE_PATH) : path.join(getUserHome(), '.flowise', 'storage')
}

export const removeFilesFromStorage = async (...paths: string[]) => {
    const storageType = getStorageType()

    if (storageType === 's3') {
        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '')
        if (Key.startsWith('/')) {
            Key = Key.substring(1)
        }
        await _deleteS3Folder(Key)
    } else if (storageType === 'azure') {
        let blobPath = paths.reduce((acc, cur) => acc + '/' + cur, '')
        if (blobPath.startsWith('/')) {
            blobPath = blobPath.substring(1)
        }

        const { containerClient } = getAzureConfig()
        const blobName = `.flowise/storage/${blobPath}`
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        try {
            await blockBlobClient.delete()
        } catch (error: any) {
            console.error(`Failed to delete file from Azure. Path: ${blobPath}, Error: ${error.message}`)
            throw error
        }
    } else if (process.env.NODE_ENV === 'production') {
        let gcsFilePath = paths.reduce((acc, cur) => acc + '/' + cur, '')
        if (gcsFilePath.startsWith('/')) {
            gcsFilePath = gcsFilePath.substring(1)
        }

        const bucket = storage!.bucket(bucketName)
        const file = bucket.file(`.flowise/storage/${gcsFilePath}`)

        try {
            await file.delete()
        } catch (error: any) {
            console.error(`Failed to delete file from GCS. Path: ${gcsFilePath}, Error: ${error.message}`)
            throw error
        }
    } else {
        const directory = path.join(getStoragePath(), ...paths.map(_sanitizeFilename))
        _deleteLocalFolderRecursive(directory)
    }
}

export const removeSpecificFileFromUpload = async (filePath: string) => {
    const storageType = getStorageType()

    if (storageType === 's3') {
        let Key = filePath
        if (Key.startsWith('/')) {
            Key = Key.substring(1)
        }
        await _deleteS3Folder(Key)
    } else if (storageType === 'azure') {
        let blobName = filePath
        if (blobName.startsWith('/')) {
            blobName = blobName.substring(1)
        }

        const { containerClient } = getAzureConfig()
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        try {
            await blockBlobClient.delete()
        } catch (error: any) {
            console.error(`Failed to delete file from Azure. Path: ${blobName}, Error: ${error.message}`)
            throw error
        }
    } else {
        fs.unlinkSync(filePath)
    }
}

export const removeSpecificFileFromStorage = async (...paths: string[]) => {
    const storageType = getStorageType()

    if (storageType === 's3') {
        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '')
        if (Key.startsWith('/')) {
            Key = Key.substring(1)
        }
        await _deleteS3Folder(Key)
    } else if (storageType === 'azure') {
        let blobPath = paths.reduce((acc, cur) => acc + '/' + cur, '')
        if (blobPath.startsWith('/')) {
            blobPath = blobPath.substring(1)
        }

        const { containerClient } = getAzureConfig()
        const blobName = `.flowise/storage/${blobPath}`
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        try {
            await blockBlobClient.delete()
        } catch (error: any) {
            console.error(`Failed to delete specific file from Azure. Path: ${blobPath}, Error: ${error.message}`)
            throw error
        }
    } else if (process.env.NODE_ENV === 'production') {
        let gcsFilePath = paths.reduce((acc, cur) => acc + '/' + cur, '')
        if (gcsFilePath.startsWith('/')) {
            gcsFilePath = gcsFilePath.substring(1)
        }

        const bucket = storage!.bucket(bucketName)
        const file = bucket.file(`.flowise/storage/${gcsFilePath}`)

        try {
            await file.delete()
        } catch (error: any) {
            console.error(`Failed to delete specific file from GCS. Path: ${gcsFilePath}, Error: ${error.message}`)
            throw error
        }
    } else {
        const fileName = paths.pop()
        if (fileName) {
            const sanitizedFilename = _sanitizeFilename(fileName)
            paths.push(sanitizedFilename)
        }
        const file = path.join(getStoragePath(), ...paths.map(_sanitizeFilename))
        fs.unlinkSync(file)
    }
}

export const removeFolderFromStorage = async (...paths: string[]) => {
    const storageType = getStorageType()

    if (storageType === 's3') {
        let Key = paths.reduce((acc, cur) => acc + '/' + cur, '')
        if (Key.startsWith('/')) {
            Key = Key.substring(1)
        }
        await _deleteS3Folder(Key)
    } else if (storageType === 'azure') {
        let azureFolderPath = paths.reduce((acc, cur) => acc + '/' + cur, '')
        if (azureFolderPath.startsWith('/')) {
            azureFolderPath = azureFolderPath.substring(1)
        }

        const { containerClient } = getAzureConfig()
        const prefix = `.flowise/storage/${azureFolderPath}`

        // List all blobs with the prefix
        const blobs = containerClient.listBlobsFlat({ prefix })

        // Delete all blobs
        const deletePromises = []
        for await (const blob of blobs) {
            const blockBlobClient = containerClient.getBlockBlobClient(blob.name)
            deletePromises.push(blockBlobClient.delete())
        }

        if (deletePromises.length > 0) {
            await Promise.all(deletePromises)
        }
    } else if (process.env.NODE_ENV === 'production') {
        let gcsFolderPath = paths.reduce((acc, cur) => acc + '/' + cur, '')
        if (gcsFolderPath.startsWith('/')) {
            gcsFolderPath = gcsFolderPath.substring(1)
        }

        const bucket = storage!.bucket(bucketName)
        const [files] = await bucket.getFiles({ prefix: `.flowise/storage/${gcsFolderPath}` })

        if (files.length > 0) {
            await Promise.all(
                files.map(async (file) => {
                    await file.delete()
                })
            )
        }
    } else {
        const directory = path.join(getStoragePath(), ...paths.map(_sanitizeFilename))
        _deleteLocalFolderRecursive(directory, true)
    }
}

const _deleteLocalFolderRecursive = (directory: string, deleteParentChatflowFolder?: boolean) => {
    if (fs.existsSync(directory)) {
        if (deleteParentChatflowFolder) {
            fs.rmSync(directory, { recursive: true, force: true })
        } else {
            fs.readdir(directory, (error, files) => {
                if (error) console.error('Could not read directory')

                for (let i = 0; i < files.length; i++) {
                    const file = files[i]
                    const file_path = path.join(directory, file)

                    fs.stat(file_path, (error, stat) => {
                        if (error) console.error('File do not exist')

                        if (!stat.isDirectory()) {
                            fs.unlink(file_path, (error) => {
                                if (error) console.error('Could not delete file')
                            })
                            if (i === files.length - 1) {
                                fs.rmSync(directory, { recursive: true, force: true })
                            }
                        } else {
                            _deleteLocalFolderRecursive(file_path)
                        }
                    })
                }
            })
        }
    }
}

const _deleteS3Folder = async (location: string) => {
    let count = 0
    const { s3Client, Bucket } = getS3Config()

    async function recursiveS3Delete(token?: any) {
        const listCommand = new ListObjectsV2Command({
            Bucket: Bucket,
            Prefix: location,
            ContinuationToken: token
        })
        let list = await s3Client.send(listCommand)

        if (list.KeyCount) {
            const deleteCommand = new DeleteObjectsCommand({
                Bucket: Bucket,
                Delete: {
                    Objects: list.Contents?.map((item) => ({ Key: item.Key })),
                    Quiet: false
                }
            })
            let deleted = await s3Client.send(deleteCommand)
            // @ts-ignore
            count += deleted.Deleted.length

            if (deleted.Errors) {
                deleted.Errors.map((error: any) => console.error(`${error.Key} could not be deleted - ${error.Code}`))
            }
        }

        if (list.NextContinuationToken) {
            await recursiveS3Delete(list.NextContinuationToken)
        }

        return `${count} files deleted from S3`
    }

    return recursiveS3Delete()
}

export const streamStorageFile = async (
    chatflowId: string,
    chatId: string,
    fileName: string
): Promise<fs.ReadStream | Buffer | undefined> => {
    const storageType = getStorageType()
    const sanitizedFilename = sanitize(fileName)

    if (storageType === 's3') {
        const { s3Client, Bucket } = getS3Config()

        const Key = chatflowId + '/' + chatId + '/' + sanitizedFilename
        const getParams = {
            Bucket,
            Key
        }
        const response = await s3Client.send(new GetObjectCommand(getParams))
        const body = response.Body
        if (body instanceof Readable) {
            const blob = await body.transformToByteArray()
            return Buffer.from(blob)
        }
    } else if (storageType === 'azure') {
        const blobName = `.flowise/storage/${chatflowId}/${chatId}/${sanitizedFilename}`
        const fileBuffer = await getFileFromAzure(blobName)
        return fileBuffer
    } else if (process.env.NODE_ENV === 'production') {
        const filePath = `.flowise/storage/${chatflowId}/${chatId}/${sanitizedFilename}`
        const fileBuffer = await getFileFromGCS(filePath)
        return fileBuffer
    } else {
        const filePath = path.join(getStoragePath(), chatflowId, chatId, sanitizedFilename)
        //raise error if file path is not absolute
        if (!path.isAbsolute(filePath)) throw new Error(`Invalid file path`)
        //raise error if file path contains '..'
        if (filePath.includes('..')) throw new Error(`Invalid file path`)
        //only return from the storage folder
        if (!filePath.startsWith(getStoragePath())) throw new Error(`Invalid file path`)

        if (fs.existsSync(filePath)) {
            return fs.createReadStream(filePath)
        } else {
            throw new Error(`File ${fileName} not found`)
        }
    }
}

export const getS3Config = () => {
    const accessKeyId = process.env.S3_STORAGE_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_STORAGE_SECRET_ACCESS_KEY
    const region = process.env.S3_STORAGE_REGION
    const Bucket = process.env.S3_STORAGE_BUCKET_NAME
    const customURL = process.env.S3_ENDPOINT_URL
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true' ? true : false

    if (!region || !Bucket) {
        throw new Error('S3 storage configuration is missing')
    }

    const s3Config: S3ClientConfig = {
        region: region,
        endpoint: customURL,
        forcePathStyle: forcePathStyle
    }

    if (accessKeyId && secretAccessKey) {
        s3Config.credentials = {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
        }
    }

    const s3Client = new S3Client(s3Config)

    return { s3Client, Bucket }
}

const _sanitizeFilename = (filename: string): string => {
    if (filename) {
        let sanitizedFilename = sanitize(filename)
        // remove all leading .
        return sanitizedFilename.replace(/^\.+/, '')
    }
    return ''
}
