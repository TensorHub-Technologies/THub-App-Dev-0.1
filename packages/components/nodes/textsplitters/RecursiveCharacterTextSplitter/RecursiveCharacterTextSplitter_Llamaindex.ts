import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { SentenceSplitter } from 'llamaindex'

class RecursiveCharacterTextSplitter_Llamaindex implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    tags: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Recursive Character Text Splitter'
        this.name = 'recursiveCharacterTextSplitter'
        this.version = 2.0
        this.type = 'RecursiveCharacterTextSplitter'
        this.icon = 'textsplitter.svg'
        this.category = 'Text Splitters'
        this.description = `Split documents recursively by different characters - starting with "\\n\\n", then "\\n", then " "`
        this.baseClasses = [this.type, ...getBaseClasses(SentenceSplitter)]
        this.tags = ['LlamaIndex']
        this.inputs = [
            {
                label: 'Chunk Size',
                name: 'chunkSize',
                type: 'number',
                description: 'Number of tokens in each chunk. Default is 1024.',
                default: 1024,
                optional: true
            },
            {
                label: 'Chunk Overlap',
                name: 'chunkOverlap',
                type: 'number',
                description: 'Number of tokens to overlap between chunks. Default is 20.',
                default: 20,
                optional: true
            },
            {
                label: 'Custom Separators',
                name: 'separators',
                type: 'string',
                rows: 4,
                description: 'Array of custom separators to determine when to split the text, will override the default separators',
                placeholder: `["|", "##", ">", "-"]`,
                additionalParams: true,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const chunkSize = nodeData.inputs?.chunkSize as string
        const chunkOverlap = nodeData.inputs?.chunkOverlap as string
        const separators = nodeData.inputs?.separators

        const splitterParams = {
            chunkSize: chunkSize ? parseInt(chunkSize, 10) : 1024,
            chunkOverlap: chunkOverlap ? parseInt(chunkOverlap, 10) : 20,
            paragraphSeparator: separators ? JSON.parse(separators) : ['\n\n', '\n', ' ']
        }

        const splitter = new SentenceSplitter(splitterParams)

        return splitter
    }

    async run(nodeData: INodeData, input: string, options?: any): Promise<any> {
        const splitter = await this.init(nodeData)

        const documents = [{ text: input }]
        const showProgress = nodeData.inputs?.showProgress ?? false

        const nodes = splitter.get_nodes_from_documents(documents, showProgress)

        return nodes
    }
}

module.exports = { nodeClass: RecursiveCharacterTextSplitter_Llamaindex }
