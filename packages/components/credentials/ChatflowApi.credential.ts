import { INodeParams, INodeCredential } from '../src/Interface.js'

class ChatflowApi implements INodeCredential {
    label: string
    name: string
    version: number
    inputs: INodeParams[]

    constructor() {
        this.label = 'Workflow API'
        this.name = 'chatflowApi'
        this.version = 1.0
        this.inputs = [
            {
                label: 'Workflow Api Key',
                name: 'chatflowApiKey',
                type: 'password'
            }
        ]
    }
}

export const credClass = ChatflowApi