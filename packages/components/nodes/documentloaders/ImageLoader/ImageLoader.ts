import { IDocument, ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { getFileFromStorage, handleEscapeCharacters, INodeOutputsValue } from '../../../src'
import { exec } from 'child_process'
import sanitize from 'sanitize-filename'
import { getFileFromGCS } from '../../../src/storageUtils'
import path from 'path'
import fs from 'fs'
import { Storage } from '@google-cloud/storage'

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
            },
            {
                label: 'Usage',
                name: 'usage',
                type: 'options',
                options: [
                    {
                        label: 'One document per page',
                        name: 'perPage'
                    },
                    {
                        label: 'One document per file',
                        name: 'perFile'
                    }
                ],
                default: 'perPage'
            },
            {
                label: 'Use Legacy Build',
                name: 'legacyBuild',
                type: 'boolean',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Additional Metadata',
                name: 'metadata',
                type: 'json',
                description: 'Additional metadata to be added to the extracted documents',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Omit Metadata Keys',
                name: 'omitMetadataKeys',
                type: 'string',
                rows: 4,
                description:
                    'Each document loader comes with a default set of metadata keys that are extracted from the document. You can use this field to omit some of the default metadata keys. The value should be a list of keys, seperated by comma. Use * to omit all metadata keys execept the ones you specify in the Additional Metadata field',
                placeholder: 'key1, key2, key3.nestedKey1',
                optional: true,
                additionalParams: true
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
        const usage = nodeData.inputs?.usage as string
        const legacyBuild = nodeData.inputs?.legacyBuild as boolean
        const _omitMetadataKeys = nodeData.inputs?.omitMetadataKeys as string
        const output = nodeData.outputs?.output as string

        const storage = new Storage()
        const bucketName = 'thub-files'
        const chatflowId = options.chatflowid

        const format = 'png'
        const dpi = 300
        const outputFilePrefix = 'page'

        const tmpfsBase = '/tmpfs'

        let omitMetadataKeys: string[] = []
        if (_omitMetadataKeys) {
            omitMetadataKeys = _omitMetadataKeys.split(',').map((key) => key.trim())
        }

        let docs: IDocument[] = []
        let files: string[] = []

        console.log('works till init', pdfFileBase64)

        if (pdfFileBase64.startsWith('FILE-STORAGE::')) {
            const fileName = pdfFileBase64.replace('FILE-STORAGE::', '')
            if (fileName.startsWith('[') && fileName.endsWith(']')) {
                files = JSON.parse(fileName)
            } else {
                files = [fileName]
            }

            for (const fileName of files) {
                if (!fileName) continue
                console.log('file', fileName)

                const sanitizedFilename = sanitize(fileName)
                const filePath = `.flowise/storage/${chatflowId}/${sanitizedFilename}`

                const fileBuffer = await getFileFromGCS(filePath)
                console.log('fileBuffer: ', fileBuffer)

                const pdfPath = path.join(tmpfsBase, sanitizedFilename)
                const imageDir = path.join(tmpfsBase, 'images')
                fs.mkdirSync(imageDir, { recursive: true })

                const gcsFilePath = `.flowise/storage/${chatflowId}/${sanitizedFilename}`
                console.log(`📥 Downloading from GCS: ${gcsFilePath} → ${pdfPath}`)

                await storage.bucket(bucketName).file(gcsFilePath).download({ destination: pdfPath })

                const command = `pdftoppm -r ${dpi} -${format} "${pdfPath}" "${path.join(imageDir, outputFilePrefix)}"`
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error('❌ Error running pdftoppm:', stderr)
                        return
                    }
                    console.log('✅ PDF converted successfully.')

                    const images = fs
                        .readdirSync(imageDir)
                        .filter((f) => f.endsWith('.png'))
                        .sort()
                    console.log('🖼️ Generated images:')
                    images.forEach((img) => console.log('- ' + img))

                    for (const img of images) {
                        const imgPath = path.join(imageDir, img)
                        fs.unlinkSync(imgPath)
                        console.log(`🗑️ Deleted image: ${img}`)
                    }

                    fs.unlinkSync(pdfPath)
                    console.log(`🗑️ Deleted PDF: ${pdfPath}`)

                    fs.rmdirSync(imageDir)
                    console.log(`🧹 Removed image folder: ${imageDir}`)
                })

                const fileData = await getFileFromStorage(fileName, chatflowId)
                const bf = Buffer.from(fileData)
                await this.extractDocs(usage, bf, legacyBuild, textSplitter, docs)
            }
        } else {
            console.log('dosent start with FILE-STORAGE::')
        }

        /*
        //path where pdf is uploaded to
        const pdfPath = path.resolve(__dirname, "../sample.pdf");
        //path were image will be stored
        const imageDir = path.resolve(__dirname, '../images');

        //command to convert pdf to image
        const command = `pdftoppm -r ${dpi} -${format} "${pdfPath}" "${path.join(imageDir, outputFilePrefix)}"`;
    
        //execute the command
        exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("Error running pdftoppm:", stderr);
        }
            console.log("PDF converted successfully.");
        });

        //loop through the folder to get all the images
        const imageFiles = fs
        .readdirSync(imageDir)
        .filter(file => file.endsWith('.png'))
        .sort((a, b) => {
            // Sort by page number if names are like page-1.png, page-2.png, etc.
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            return numA - numB;
        });

        //loop through the images and run OCR
        for (const imageFile of imageFiles) {
            const imagePath = path.join(imageDir, imageFile);
            const {data: { text },} = await Tesseract.recognize(imagePath, 'eng');
            console.log(`${text}\n`);
        }

        //delete the images after processing
        for (const imageFile of imageFiles) {
            const imagePath = path.join(imageDir, imageFile);
            fs.unlinkSync(imagePath); // or use await fs.promises.unlink(imagePath) if you want async
            console.log(`🗑 Deleted: ${imageFile}`);
        }
        */

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

    private async extractDocs(usage: string, bf: Buffer, legacyBuild: boolean, textSplitter: TextSplitter, docs: IDocument[]) {
        //read file and extract text and send to text splitter
        console.log('extractDocs')
        if (usage === 'perFile') {
            //OCR call

            if (textSplitter) {
                /*let splittedDocs = await loader.load()
                splittedDocs = await textSplitter.splitDocuments(splittedDocs)
                docs.push(...splittedDocs)*/
            }
        }
    }
}

module.exports = { nodeClass: Image_DocumentLoaders }
