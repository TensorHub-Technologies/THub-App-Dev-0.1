import { IDocument, ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface.js'
import { TextSplitter } from 'langchain/text_splitter'
import { INodeOutputsValue } from '../../../src/index.js'
import { exec } from 'child_process'
import sanitize from 'sanitize-filename'
import path from 'path'
import fs from 'fs'
import { Storage } from '@google-cloud/storage'
import { promisify } from 'util'
import Tesseract from 'tesseract.js'
import { handleEscapeCharacters } from '../../../src/index.js'

const execAsync = promisify(exec)

class Image_DocumentLoaders implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'Image File'
        this.name = 'ImageFile'
        this.version = 2.0
        this.type = 'Document'
        this.icon = 'ImageLoader.svg'
        this.category = 'Document Loaders'
        this.description = `Load data from Image files using OCR or AI`
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Image File',
                name: 'imageFile',
                type: 'file',
                fileType: '.pdf'
            },
            {
                label: 'Text Splitter',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            }
        ]
        this.outputs = [
            {
                label: 'Document',
                name: 'document',
                description: 'Array of document objects containing metadata and pageContent',
                baseClasses: [...this.baseClasses, 'json']
            },
            {
                label: 'Text',
                name: 'text',
                description: 'Concatenated string from pageContent of documents',
                baseClasses: ['string', 'json']
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const pdfFileBase64 = nodeData.inputs?.imageFile as string
        const output = nodeData.outputs?.output as string

        const storage = new Storage()
        const bucketName = 'thub-files'
        const chatflowId = options.chatflowid
        let combinedText = ''
        const format = 'png'
        const dpi = 300
        const outputFilePrefix = 'page'
        const tmpfsBase = '/tmpfs'

        let docs: IDocument[] = []
        let files: string[] = []

        if (pdfFileBase64.startsWith('FILE-STORAGE::')) {
            const fileName = pdfFileBase64.replace('FILE-STORAGE::', '')
            if (fileName.startsWith('[') && fileName.endsWith(']')) {
                files = JSON.parse(fileName)
            } else {
                files = [fileName]
            }

            for (const fileName of files) {
                if (!fileName) continue

                const sanitizedFilename = sanitize(fileName)
                const workingDir = path.join(tmpfsBase, chatflowId)
                const pdfPath = path.join(workingDir, sanitizedFilename)
                const imageDir = path.join(workingDir, 'images')

                fs.mkdirSync(imageDir, { recursive: true })

                const gcsFilePath = `.flowise/storage/${chatflowId}/${sanitizedFilename}`
                console.log(`📥 Downloading from GCS: ${gcsFilePath} → ${pdfPath}`)

                await storage.bucket(bucketName).file(gcsFilePath).download({ destination: pdfPath })

                // Convert PDF to images (synchronously wait for it)
                await execAsync(`pdftoppm -r ${dpi} -${format} "${pdfPath}" "${path.join(imageDir, outputFilePrefix)}"`)

                const images = fs
                    .readdirSync(imageDir)
                    .filter((f) => f.endsWith('.png'))
                    .sort()

                //extract text from images using Tesseract
                for (const imageFile of images) {
                    const imagePath = path.join(imageDir, imageFile)
                    console.log(`🧠 Running OCR on ${imageFile}...`)

                    const {
                        data: { text }
                    } = await Tesseract.recognize(imagePath, 'eng')
                    combinedText += text + '\n'
                }

                // 🔥 Delete entire working directory
                fs.rmSync(workingDir, { recursive: true, force: true })
                console.log(`🧹 Cleaned up: ${workingDir}`)
            }
        } else {
            console.log('dosent start with FILE-STORAGE::')
        }

        if (textSplitter) {
            docs.push(...(await textSplitter.createDocuments([combinedText])))
        }

        if (output === 'document') {
            return docs
        } else {
            let finaltext = ''
            for (const doc of docs) {
                finaltext += `${doc.pageContent}\n`
            }
            return handleEscapeCharacters(finaltext, false)
        }
    }
}

export const nodeClass = Image_DocumentLoaders
