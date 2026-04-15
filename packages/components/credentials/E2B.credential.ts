import { INodeParams, INodeCredential } from '../src/Interface.js'

class E2BApi implements INodeCredential {
    label: string
    name: string
    version: number
    inputs: INodeParams[]

    constructor() {
        this.label = 'E2B API'
        this.name = 'E2BApi'
        this.version = 1.0
        this.inputs = [
            {
                label: 'E2B Api Key',
                name: 'e2bApiKey',
                type: 'password'
            }
        ]
    }
}

export const credClass = E2BApi