import { TextSplitter } from '@langchain/textsplitters';
import { RecursiveJsonTextSplitterParams, JsonValue } from './types';
declare class RecursiveJsonTextSplitter extends TextSplitter {
    private convertLists;
    private visitedObjects;
    constructor(fields: Partial<RecursiveJsonTextSplitterParams>);
    splitText(text: string): Promise<string[]>;
    splitJson(jsonData: JsonValue): JsonValue[];
    private splitRecursive;
    private addObjectToChunks;
    private setNestedProperty;
    private arrayToObject;
}
export default RecursiveJsonTextSplitter;
