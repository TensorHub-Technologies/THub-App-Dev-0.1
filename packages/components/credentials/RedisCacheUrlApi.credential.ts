import { INodeParams, INodeCredential } from '../src/Interface.js'

class RedisCacheUrlApi implements INodeCredential {
    label: string
    name: string
    version: number
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'Redis URL'
        this.name = 'redisCacheUrlApi'
        this.version = 1.0
        this.inputs = [
            {
                label: 'Redis URL',
                name: 'redisUrl',
                type: 'string',
                default: 'redis://localhost:6379'
            }
        ]
    }
}

export const credClass = RedisCacheUrlApi