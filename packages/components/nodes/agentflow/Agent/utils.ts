import { isAbsolute, normalize, relative } from 'path'
import { ICommonObject } from '../../../src/Interface'

/**
 * Validates if a file path is safe to import from
 * @param filePath The file path to validate
 * @param baseDir The base directory that contains allowed files
 * @returns boolean indicating if the path is safe
 */
export function isPathSafe(filePath: string, baseDir: string): boolean {
    if (!isAbsolute(filePath)) return false

    // Normalize paths to handle different path separators and resolve ..
    const normalizedPath = normalize(filePath)
    const normalizedBase = normalize(baseDir)

    // Check if the path is within the base directory
    const relativePath = relative(normalizedBase, normalizedPath)
    return !relativePath.startsWith('..') && !isAbsolute(relativePath)
}

/**
 * Validates a tool configuration and its filepath
 * @param componentNodes The available component nodes
 * @param toolName The name of the tool to validate
 * @param baseDir The base directory containing allowed files
 * @returns The validated file path or throws an error
 */
export function validateToolPath(componentNodes: ICommonObject, toolName: string, baseDir: string): string {
    // Check if tool exists in component nodes
    if (!componentNodes[toolName]) {
        throw new Error(`Invalid tool: ${toolName} not found in component nodes`)
    }

    const filePath = componentNodes[toolName].filePath
    if (typeof filePath !== 'string') {
        throw new Error(`Invalid file path for tool: ${toolName}`)
    }

    // Normalize the file path and base directory
    const normalizedPath = normalize(filePath)
    const normalizedBaseDir = normalize(baseDir)

    // Ensure path is absolute
    if (!isAbsolute(normalizedPath)) {
        throw new Error(`Tool path must be absolute: ${toolName}`)
    }

    // Check if path is within allowed directory
    if (!isPathSafe(normalizedPath, normalizedBaseDir)) {
        throw new Error(`Invalid file path: ${filePath} is outside of allowed directory`)
    }

    // Additional security checks
    if (!normalizedPath.endsWith('.js') && !normalizedPath.endsWith('.ts')) {
        throw new Error(`Invalid file type for tool: ${toolName}`)
    }

    // Verify path contains expected subdirectory structure
    if (!normalizedPath.includes('dist/nodes/') && !normalizedPath.includes('src/nodes/')) {
        throw new Error(`Invalid tool path structure for: ${toolName}`)
    }

    return normalizedPath
}

/**
 * Type guard to validate imported module has required properties
 */
export function isValidToolModule(module: any): boolean {
    return module && typeof module.nodeClass === 'function' && typeof module.nodeClass.prototype.init === 'function'
}
