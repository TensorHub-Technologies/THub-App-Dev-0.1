import { INodeParams, INodeCredential } from '../src/Interface.js'

class HuggingFaceApi implements INodeCredential {
    label: string
    name: string
    version: number
    inputs: INodeParams[]

    constructor() {
        this.label = 'HuggingFace API'
        this.name = 'huggingFaceApi'
        this.version = 1.0
        this.inputs = [
            {
                label: 'HuggingFace Api Key',
                name: 'huggingFaceApiKey',
                type: 'password'
            }
        ]
    }
}

export const credClass = HuggingFaceApi