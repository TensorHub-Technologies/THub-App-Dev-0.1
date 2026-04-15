import { TextSplitter } from '@langchain/textsplitters'
import { JsonArray, JsonObject, RecursiveJsonTextSplitterParams, JsonValue } from './types.js'

class RecursiveJsonTextSplitter extends TextSplitter {
    private convertLists: boolean
    private visitedObjects: Set<JsonValue>

    constructor(fields: Partial<RecursiveJsonTextSplitterParams>) {
        super(fields)
        this.convertLists = fields.convertLists || false
        this.visitedObjects = new Set()
    }

    public async splitText(text: string): Promise<string[]> {
        let jsonData
        try {
            jsonData = JSON.parse(text)
        } catch (error) {
            return [text]
        }

        const jsonChunks = this.splitJson(jsonData)
        return jsonChunks.map((chunk) => JSON.stringify(chunk))
    }

    public splitJson(jsonData: JsonValue): JsonValue[] {
        const chunks: JsonValue[] = []
        this.splitRecursive(jsonData, chunks, [], 0)
        return chunks
    }

    private splitRecursive(jsonData: JsonValue, chunks: JsonValue[], ancestorKeys: string[], currentSize: number): void {
        if (jsonData === null || typeof jsonData === 'string' || typeof jsonData === 'number' || typeof jsonData === 'boolean') {
            chunks.push(jsonData)
            return
        }

        if (this.visitedObjects.has(jsonData)) {
            throw new Error('Circular reference detected in JSON data.')
        }
        this.visitedObjects.add(jsonData)

        if (Array.isArray(jsonData)) {
            for (const item of jsonData) {
                const itemSize = JSON.stringify(item).length

                if (itemSize > this.chunkSize) {
                    this.splitRecursive(item, chunks, ancestorKeys, 0)
                } else {
                    chunks.push(item)
                }
            }
            return
        }

        if (typeof jsonData === 'object') {
            let partialObject: JsonObject = {}
            let tempSize = currentSize
            for (const [key, value] of Object.entries(jsonData)) {
                const testObject = { ...partialObject, [key]: value }
                const testSize = JSON.stringify(testObject).length

                if (testSize > this.chunkSize) {
                    if (typeof value === 'object' || Array.isArray(value)) {
                        this.splitRecursive(value, chunks, [...ancestorKeys, key], 0)
                    } else {
                        if (Object.keys(partialObject).length > 0) {
                            chunks.push(partialObject)
                        }
                        partialObject = { [key]: value }
                    }
                } else {
                    partialObject[key] = value
                    tempSize = testSize
                }
            }

            if (Object.keys(partialObject).length > 0) {
                chunks.push(partialObject)
            }
        }

        this.visitedObjects.delete(jsonData)
    }

    private addObjectToChunks(object: JsonObject | JsonArray, chunks: JsonValue[], ancestorKeys: string[]) {
        // create an object with the ancestor keys as nested properties
        const nestedObject: Record<string, JsonValue> = {}

        const updatedObjectWithValue = this.setNestedProperty(nestedObject, ancestorKeys, object)
        chunks.push(updatedObjectWithValue)
    }
    private setNestedProperty(obj: JsonObject, keys: string[], value: JsonValue): JsonValue {
        let current: JsonObject = obj

        if (keys.length === 0 && (Array.isArray(value) || typeof value === 'object')) {
            return value
        }

        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                // Assign the value to the final key
                current[key] = value
            } else {
                // Ensure intermediate objects exist
                if (typeof current[key] !== 'object' || current[key] === null) {
                    current[key] = {}
                }
                current = current[key] as JsonObject
            }
        })
        return obj
    }

    private arrayToObject(array: JsonArray): JsonObject {
        return array.reduce<JsonObject>((acc, item, index) => {
            acc[index] = item
            return acc
        }, {})
    }
}

export default RecursiveJsonTextSplitter
