"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage_1 = require("@google-cloud/storage");
const util_1 = require("util");
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const src_1 = require("../../../src");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class Image_DocumentLoaders {
    label;
    name;
    version;
    description;
    type;
    icon;
    category;
    baseClasses;
    inputs;
    outputs;
    constructor() {
        this.label = 'Image File';
        this.name = 'ImageFile';
        this.version = 2.0;
        this.type = 'Document';
        this.icon = 'ImageLoader.svg';
        this.category = 'Document Loaders';
        this.description = `Load data from Image files using OCR or AI`;
        this.baseClasses = [this.type];
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
        ];
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
        ];
    }
    async init(nodeData, _, options) {
        const textSplitter = nodeData.inputs?.textSplitter;
        const pdfFileBase64 = nodeData.inputs?.imageFile;
        const output = nodeData.outputs?.output;
        const storage = new storage_1.Storage();
        const bucketName = 'thub-files';
        const chatflowId = options.chatflowid;
        let combinedText = '';
        const format = 'png';
        const dpi = 300;
        const outputFilePrefix = 'page';
        const tmpfsBase = '/tmpfs';
        let docs = [];
        let files = [];
        if (pdfFileBase64.startsWith('FILE-STORAGE::')) {
            const fileName = pdfFileBase64.replace('FILE-STORAGE::', '');
            if (fileName.startsWith('[') && fileName.endsWith(']')) {
                files = JSON.parse(fileName);
            }
            else {
                files = [fileName];
            }
            for (const fileName of files) {
                if (!fileName)
                    continue;
                const sanitizedFilename = (0, sanitize_filename_1.default)(fileName);
                const workingDir = path_1.default.join(tmpfsBase, chatflowId);
                const pdfPath = path_1.default.join(workingDir, sanitizedFilename);
                const imageDir = path_1.default.join(workingDir, 'images');
                fs_1.default.mkdirSync(imageDir, { recursive: true });
                const gcsFilePath = `.thub/storage/${chatflowId}/${sanitizedFilename}`;
                console.log(`📥 Downloading from GCS: ${gcsFilePath} → ${pdfPath}`);
                await storage.bucket(bucketName).file(gcsFilePath).download({ destination: pdfPath });
                // Convert PDF to images (synchronously wait for it)
                await execAsync(`pdftoppm -r ${dpi} -${format} "${pdfPath}" "${path_1.default.join(imageDir, outputFilePrefix)}"`);
                const images = fs_1.default
                    .readdirSync(imageDir)
                    .filter((f) => f.endsWith('.png'))
                    .sort();
                //extract text from images using Tesseract
                for (const imageFile of images) {
                    const imagePath = path_1.default.join(imageDir, imageFile);
                    console.log(`🧠 Running OCR on ${imageFile}...`);
                    const { data: { text } } = await tesseract_js_1.default.recognize(imagePath, 'eng');
                    combinedText += text + '\n';
                }
                // 🔥 Delete entire working directory
                fs_1.default.rmSync(workingDir, { recursive: true, force: true });
                console.log(`🧹 Cleaned up: ${workingDir}`);
            }
        }
        else {
            console.log('dosent start with FILE-STORAGE::');
        }
        if (textSplitter) {
            docs.push(...(await textSplitter.createDocuments([combinedText])));
        }
        if (output === 'document') {
            return docs;
        }
        else {
            let finaltext = '';
            for (const doc of docs) {
                finaltext += `${doc.pageContent}\n`;
            }
            return (0, src_1.handleEscapeCharacters)(finaltext, false);
        }
    }
}
module.exports = { nodeClass: Image_DocumentLoaders };
//# sourceMappingURL=ImageLoader.js.map