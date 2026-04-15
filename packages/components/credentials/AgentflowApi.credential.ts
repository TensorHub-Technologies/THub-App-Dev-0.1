import { INodeParams, INodeCredential } from '../src/Interface.js'

class AgentflowApi implements INodeCredential {
    label: string
    name: string
    version: number
    inputs: INodeParams[]

    constructor() {
        this.label = 'Agentflow API'
        this.name = 'agentflowApi'
        this.version = 1.0
        this.inputs = [
            {
                label: 'Agentflow Api Key',
                name: 'agentflowApiKey',
                type: 'password'
            }
        ]
    }
}

export const credClass = AgentflowApi