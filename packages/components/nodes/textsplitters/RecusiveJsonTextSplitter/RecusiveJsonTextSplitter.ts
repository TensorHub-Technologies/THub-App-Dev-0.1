import { INode, INodeData, INodeParams } from '../../../src/Interface.js'
import { getBaseClasses } from '../../../src/utils.js'
import RecursiveJsonTextSplitter from './RecursiveJsonTextSplitter.js'
import { RecursiveJsonTextSplitterParams } from './types.js'

class RecursiveJsonTextSplitter_TextSplitters implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Recursive JSON Text Splitter'
        this.name = 'recursiveJSONTextSplitter'
        this.version = 1.0
        this.type = 'RecursiveJsonTextSplitter'
        this.icon = 'jsonsplitter.svg'
        this.category = 'Text Splitters'
        this.description = `Recursively splits JSON objects into smaller chunks while preserving structure.`
        this.baseClasses = [this.type, ...getBaseClasses(RecursiveJsonTextSplitter)]
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
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const chunkSize = nodeData.inputs?.chunkSize as string
        const chunkOverlap = nodeData.inputs?.chunkOverlap as string
        const keysToIgnore = nodeData.inputs?.keysToIgnore as string
        const shouldConvertLists = nodeData.inputs?.convertLists as string

        const ignoreKeys = keysToIgnore ? keysToIgnore.split(',').map((k) => k.trim()) : []

        const obj = {} as RecursiveJsonTextSplitterParams
        obj.ignoreKeys = ignoreKeys
        if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10)
        if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10)
        if (shouldConvertLists) obj.convertLists = true

        const splitter = new RecursiveJsonTextSplitter(obj)
        return splitter
    }
}

export const nodeClass = RecursiveJsonTextSplitter_TextSplitters