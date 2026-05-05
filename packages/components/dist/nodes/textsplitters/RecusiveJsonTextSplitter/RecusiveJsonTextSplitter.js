"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const RecursiveJsonTextSplitter_1 = __importDefault(require("./RecursiveJsonTextSplitter"));
class RecursiveJsonTextSplitter_TextSplitters {
    label;
    name;
    version;
    description;
    type;
    icon;
    category;
    baseClasses;
    inputs;
    constructor() {
        this.label = 'Recursive JSON Text Splitter';
        this.name = 'recursiveJSONTextSplitter';
        this.version = 1.0;
        this.type = 'RecursiveJsonTextSplitter';
        this.icon = 'jsonsplitter.svg';
        this.category = 'Text Splitters';
        this.description = `Recursively splits JSON objects into smaller chunks while preserving structure.`;
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(RecursiveJsonTextSplitter_1.default)];
        this.inputs = [
            {
                label: 'Chunk Size',
                name: 'chunkSize',
                type: 'number',
                description: 'Maximum number of characters in each chunk. Default is 500.',
                default: 500,
                optional: true
            },
            {
                label: 'Chunk Overlap',
                name: 'chunkOverlap',
                type: 'number',
                description: 'Number of characters to overlap between chunks. Default is 100.',
                default: 100,
                optional: true
            },
            {
                label: 'Keys to Ignore',
                name: 'keysToIgnore',
                type: 'string',
                rows: 2,
                description: 'Comma-separated list of JSON keys to ignore while splitting (e.g., "metadata,timestamp").',
                optional: true
            }
        ];
    }
    async init(nodeData) {
        const chunkSize = nodeData.inputs?.chunkSize;
        const chunkOverlap = nodeData.inputs?.chunkOverlap;
        const keysToIgnore = nodeData.inputs?.keysToIgnore;
        const shouldConvertLists = nodeData.inputs?.convertLists;
        const ignoreKeys = keysToIgnore ? keysToIgnore.split(',').map((k) => k.trim()) : [];
        const obj = {};
        obj.ignoreKeys = ignoreKeys;
        if (chunkSize)
            obj.chunkSize = parseInt(chunkSize, 10);
        if (chunkOverlap)
            obj.chunkOverlap = parseInt(chunkOverlap, 10);
        if (shouldConvertLists)
            obj.convertLists = true;
        const splitter = new RecursiveJsonTextSplitter_1.default(obj);
        return splitter;
    }
}
module.exports = { nodeClass: RecursiveJsonTextSplitter_TextSplitters };
//# sourceMappingURL=RecusiveJsonTextSplitter.js.map