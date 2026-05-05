"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const textsplitters_1 = require("@langchain/textsplitters");
class RecursiveJsonTextSplitter extends textsplitters_1.TextSplitter {
    convertLists;
    visitedObjects;
    constructor(fields) {
        super(fields);
        this.convertLists = fields.convertLists || false;
        this.visitedObjects = new Set();
    }
    async splitText(text) {
        let jsonData;
        try {
            jsonData = JSON.parse(text);
        }
        catch (error) {
            return [text];
        }
        const jsonChunks = this.splitJson(jsonData);
        return jsonChunks.map((chunk) => JSON.stringify(chunk));
    }
    splitJson(jsonData) {
        const chunks = [];
        this.splitRecursive(jsonData, chunks, [], 0);
        return chunks;
    }
    splitRecursive(jsonData, chunks, ancestorKeys, currentSize) {
        if (jsonData === null || typeof jsonData === 'string' || typeof jsonData === 'number' || typeof jsonData === 'boolean') {
            chunks.push(jsonData);
            return;
        }
        if (this.visitedObjects.has(jsonData)) {
            throw new Error('Circular reference detected in JSON data.');
        }
        this.visitedObjects.add(jsonData);
        if (Array.isArray(jsonData)) {
            for (const item of jsonData) {
                const itemSize = JSON.stringify(item).length;
                if (itemSize > this.chunkSize) {
                    this.splitRecursive(item, chunks, ancestorKeys, 0);
                }
                else {
                    chunks.push(item);
                }
            }
            return;
        }
        if (typeof jsonData === 'object') {
            let partialObject = {};
            let tempSize = currentSize;
            for (const [key, value] of Object.entries(jsonData)) {
                const testObject = { ...partialObject, [key]: value };
                const testSize = JSON.stringify(testObject).length;
                if (testSize > this.chunkSize) {
                    if (typeof value === 'object' || Array.isArray(value)) {
                        this.splitRecursive(value, chunks, [...ancestorKeys, key], 0);
                    }
                    else {
                        if (Object.keys(partialObject).length > 0) {
                            chunks.push(partialObject);
                        }
                        partialObject = { [key]: value };
                    }
                }
                else {
                    partialObject[key] = value;
                    tempSize = testSize;
                }
            }
            if (Object.keys(partialObject).length > 0) {
                chunks.push(partialObject);
            }
        }
        this.visitedObjects.delete(jsonData);
    }
    addObjectToChunks(object, chunks, ancestorKeys) {
        // create an object with the ancestor keys as nested properties
        const nestedObject = {};
        const updatedObjectWithValue = this.setNestedProperty(nestedObject, ancestorKeys, object);
        chunks.push(updatedObjectWithValue);
    }
    setNestedProperty(obj, keys, value) {
        let current = obj;
        if (keys.length === 0 && (Array.isArray(value) || typeof value === 'object')) {
            return value;
        }
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                // Assign the value to the final key
                current[key] = value;
            }
            else {
                // Ensure intermediate objects exist
                if (typeof current[key] !== 'object' || current[key] === null) {
                    current[key] = {};
                }
                current = current[key];
            }
        });
        return obj;
    }
    arrayToObject(array) {
        return array.reduce((acc, item, index) => {
            acc[index] = item;
            return acc;
        }, {});
    }
}
exports.default = RecursiveJsonTextSplitter;
//# sourceMappingURL=RecursiveJsonTextSplitter.js.map