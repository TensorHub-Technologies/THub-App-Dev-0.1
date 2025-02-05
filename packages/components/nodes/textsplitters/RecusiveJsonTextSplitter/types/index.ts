import { TextSplitterParams } from '@langchain/textsplitters'

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export interface JsonObject {
    [key: string]: JsonValue
}
export type JsonArray = JsonValue[]

export interface RecursiveJsonTextSplitterParams extends TextSplitterParams {
    convertLists?: boolean
    ignoreKeys?: string[]
}
