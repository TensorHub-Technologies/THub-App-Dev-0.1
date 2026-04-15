import { INodeParams, INodeCredential } from '../src/Interface.js'

class HTTPBearerTokenCredential implements INodeCredential {
    label: string
    name: string
    version: number
    inputs: INodeParams[]

    constructor() {
        this.label = 'HTTP Bearer Token'
        this.name = 'httpBearerToken'
        this.version = 1.0
        this.inputs = [
            {
                label: 'Token',
                name: 'token',
                type: 'password'
            }
        ]
    }
}

export const credClass = HTTPBearerTokenCredential