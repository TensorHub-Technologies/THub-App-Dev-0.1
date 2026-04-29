import express from 'express'
import multer from 'multer'
import { BlobServiceClient } from '@azure/storage-blob'
import { Request, Response } from 'express'
import logger from '../../utils/logger'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
    try {
        const file = req.file
        const userId = req.body.userId

        if (!file) return res.status(400).json({ success: false, message: 'No file provided' })

        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
        if (!connectionString) return res.status(500).json({ success: false, message: 'Storage not configured' })

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
        const containerClient = blobServiceClient.getContainerClient('profile-images')

        const blobName = `${userId}-${Date.now()}-${file.originalname}`
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype }
        })

        logger.info(`[image-upload]: Uploaded ${blobName} for user ${userId}`)
        return res.json({ success: true, imageUrl: blockBlobClient.url })
    } catch (error) {
        logger.error(`[image-upload]: Upload failed: ${error}`)
        return res.status(500).json({ success: false, message: 'Upload failed' })
    }
})

export default router
