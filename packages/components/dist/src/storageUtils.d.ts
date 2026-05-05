import fs from 'fs';
import { S3Client } from '@aws-sdk/client-s3';
export declare const getStorageType: () => string;
/**
 * Get Azure Blob Storage configuration
 */
export declare const getAzureConfig: () => {
    containerClient: import("@azure/storage-blob").ContainerClient;
    containerName: string;
};
export declare const addBase64FilesToStorage: (fileBase64: string, chatflowid: string, fileNames: string[]) => Promise<string>;
export declare const addArrayFilesToStorage: (mime: string, bf: Buffer, fileName: string, fileNames: string[], ...paths: string[]) => Promise<string>;
export declare const addSingleFileToStorage: (mime: string, bf: Buffer, fileName: string, ...paths: string[]) => Promise<string>;
/**
 * Read file from Google Cloud Storage and return as Buffer
 * @param filePath - Path to the file in GCS
 */
export declare function getFileFromGCS(filePaths: string): Promise<Buffer>;
/**
 * Read file from Azure Blob Storage and return as Buffer
 * @param blobName - Name/path of the blob in Azure
 */
export declare function getFileFromAzure(blobName: string): Promise<Buffer>;
export declare const getFileFromUpload: (filePath: string) => Promise<Buffer>;
export declare const getFileFromStorage: (file: string, ...paths: string[]) => Promise<Buffer>;
/**
 * Prepare storage path
 */
export declare const getStoragePath: () => string;
export declare const removeFilesFromStorage: (...paths: string[]) => Promise<void>;
export declare const removeSpecificFileFromUpload: (filePath: string) => Promise<void>;
export declare const removeSpecificFileFromStorage: (...paths: string[]) => Promise<void>;
export declare const removeFolderFromStorage: (...paths: string[]) => Promise<void>;
export declare const streamStorageFile: (chatflowId: string, chatId: string, fileName: string) => Promise<fs.ReadStream | Buffer | undefined>;
export declare const getS3Config: () => {
    s3Client: S3Client;
    Bucket: string;
};
