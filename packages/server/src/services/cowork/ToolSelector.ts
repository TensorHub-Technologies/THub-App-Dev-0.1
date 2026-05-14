import { DataSource } from 'typeorm'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Credential } from '../../database/entities/Credential'
import logger from '../../utils/logger'

export interface SelectedTool {
    name: string
    label: string
    description: string
    category: string
    hasCredentials: boolean
    credentialNames: string[]
}

// ── Build in-memory keyword index from NodesPool ──────────────────────────────
// No vector DB needed — keyword overlap is sufficient for v1
const buildToolIndex = (): Map<string, string[]> => {
    const appServer = getRunningExpressApp()
    const index = new Map<string, string[]>()
    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'with', 'is', 'are', 'that', 'this', 'it'])

    for (const [name, node] of Object.entries(appServer.nodesPool.componentNodes)) {
        const text = `${node.name} ${node.label} ${node.description} ${node.category}`.toLowerCase()
        const keywords = text
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2 && !stopWords.has(w))
        index.set(name, [...new Set(keywords)])
    }
    return index
}

// ── Score tools by keyword overlap + persona hints ────────────────────────────
export const findRelevantTools = async (
    taskName: string,
    taskDescription: string,
    persona: string,
    maxTools = 5
): Promise<SelectedTool[]> => {
    const appServer = getRunningExpressApp()
    const nodes = appServer.nodesPool.componentNodes
    const toolIndex = buildToolIndex()
    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'with', 'is', 'are', 'that', 'this', 'it'])

    const queryText = `${taskName} ${taskDescription} ${persona}`.toLowerCase()
    const queryWords = new Set(
        queryText
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2 && !stopWords.has(w))
    )

    const personaHints: Record<string, string[]> = {
        coder: ['code', 'python', 'interpreter', 'github', 'file', 'execute'],
        researcher: ['search', 'web', 'scraper', 'browser', 'brave', 'serp', 'tavily', 'arxiv'],
        analyst: ['calculator', 'json', 'sql', 'database', 'sheet', 'csv'],
        writer: ['file', 'write', 'read', 'pdf', 'document'],
        architect: ['http', 'api', 'webhook', 'openapi'],
        reviewer: ['search', 'web', 'browser']
    }
    const hints = new Set(personaHints[persona] || [])

    const scores: Array<{ name: string; score: number }> = []

    for (const [toolName, toolKeywords] of toolIndex.entries()) {
        const node = nodes[toolName]
        if (!node || ['Memory', 'Chat Models', 'Embeddings'].includes(node.category)) continue

        const toolSet = new Set(toolKeywords)
        const overlap = [...queryWords].filter((w) => toolSet.has(w)).length
        const hintBonus = [...hints].filter((h) => toolKeywords.some((k) => k.includes(h))).length * 2
        const score = (overlap + hintBonus) / Math.sqrt(queryWords.size * toolSet.size || 1)

        if (score > 0.05) scores.push({ name: toolName, score })
    }

    scores.sort((a, b) => b.score - a.score)
    return scores.slice(0, maxTools).map(({ name }) => {
        const node = nodes[name]
        const credNames: string[] = node.credential?.credentialNames || []
        return {
            name,
            label: node.label,
            description: node.description ?? '',
            category: node.category,
            hasCredentials: credNames.length === 0,
            credentialNames: credNames
        }
    })
}

// ── Filter out tools the tenant has no credentials for ────────────────────────
export const filterToolsByCredentials = async (
    tools: SelectedTool[],
    tenantId: string,
    appDataSource: DataSource
): Promise<SelectedTool[]> => {
    const tenantCreds = await appDataSource.getRepository(Credential).find({ where: { tenantId } })
    const available = new Set(tenantCreds.map((c) => c.credentialName))

    return tools.filter((tool) => tool.credentialNames.length === 0 || tool.credentialNames.some((cred) => available.has(cred)))
}

// ── Discover MCP tools scored against task description ────────────────────────
export const findMCPTools = async (taskDescription: string): Promise<SelectedTool[]> => {
    const nodes = getRunningExpressApp().nodesPool.componentNodes
    const queryWords = new Set(
        taskDescription
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 3)
    )

    return Object.entries(nodes)
        .filter(([, node]) => node.category?.includes('MCP'))
        .map(([name, node]) => ({
            tool: {
                name,
                label: node.label,
                description: node.description ?? '',
                category: node.category,
                hasCredentials: true,
                credentialNames: []
            },
            score: [...queryWords].filter((w) => node.description?.toLowerCase().includes(w)).length
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ tool }) => tool)
}

// ── Public API ────────────────────────────────────────────────────────────────
export const selectToolsForTask = async (
    taskName: string,
    taskDescription: string,
    persona: string,
    tenantId: string,
    appDataSource: DataSource
): Promise<SelectedTool[]> => {
    try {
        const candidates = await findRelevantTools(taskName, taskDescription, persona)
        const filtered = await filterToolsByCredentials(candidates, tenantId, appDataSource)
        const mcpTools = await findMCPTools(taskDescription)

        const unique = [...filtered, ...mcpTools].filter((t, i, arr) => arr.findIndex((x) => x.name === t.name) === i).slice(0, 5)

        logger.info(`[tool-selector]: Task "${taskName}" → ${unique.length} tools: [${unique.map((t) => t.name).join(', ')}]`)
        return unique
    } catch (error) {
        logger.error(`[tool-selector]: Tool selection failed, continuing without tools: ${error}`)
        return []
    }
}
