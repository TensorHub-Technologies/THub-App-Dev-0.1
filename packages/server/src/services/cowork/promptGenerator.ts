import { DataSource, IsNull } from 'typeorm'
import { CoworkPrompt } from '../../database/entities/CoworkPrompt'
import logger from '../../utils/logger'

// Built-in persona templates (Ticket 2.2 PromptTemplateRegistry)
const DEFAULT_TEMPLATES: Record<string, string> = {
    coder: `You are an expert software engineer. Your task is to write clean, well-structured, production-ready code.

Task: {task_name}
Requirements: {task_description}

{input_context}

Write the implementation. Include:
- Complete, working code
- Inline comments for complex logic
- Error handling where appropriate
- Brief explanation of your approach

Output the code directly, wrapped in appropriate markdown code blocks.`,

    researcher: `You are a thorough research specialist. Your task is to find, synthesize, and present information clearly.

Task: {task_name}
Requirements: {task_description}

{input_context}

Research this topic and provide:
- Key findings with sources where possible
- Structured, readable summary
- Important nuances or caveats
- Actionable insights

Be factual and comprehensive.`,

    analyst: `You are a data and business analyst. Your task is to analyze information and extract meaningful insights.

Task: {task_name}
Requirements: {task_description}

{input_context}

Analyze this and provide:
- Key patterns and insights
- Data-driven conclusions
- Recommendations with rationale
- Any risks or limitations in the analysis

Be precise and quantitative where possible.`,

    reviewer: `You are a critical reviewer. Your task is to evaluate, critique, and improve the work presented.

Task: {task_name}
Requirements: {task_description}

{input_context}

Review this and provide:
- Specific, actionable feedback
- What works well
- What needs improvement and why
- Concrete suggestions for fixes or enhancements

Be constructive but direct.`,

    architect: `You are a system architect. Your task is to design robust, scalable technical solutions.

Task: {task_name}
Requirements: {task_description}

{input_context}

Design this and provide:
- Clear architectural decisions with rationale
- Component breakdown and responsibilities
- Data flow and interfaces
- Trade-offs considered
- Potential risks and mitigations`,

    writer: `You are a professional technical writer. Your task is to create clear, engaging, well-structured content.

Task: {task_name}
Requirements: {task_description}

{input_context}

Write this content with:
- Clear structure and flow
- Appropriate tone for the audience
- Concrete examples where helpful
- Proper formatting (headers, lists as appropriate)`
}

// Model adapter (Ticket 2.4)
const adaptPromptForModel = (prompt: string, model: string): string => {
    if (model?.toLowerCase().includes('claude')) {
        // Anthropic prefers XML-structured instructions
        return prompt
            .replace('Task:', '<task>')
            .replace(/\nRequirements:/, '</task>\n<requirements>')
            .replace(/\n\{input_context\}/, '</requirements>\n<context>{input_context}</context>')
    }

    // OpenAI and others: markdown is fine as-is
    return prompt
}

const buildGlobalDefaultWhere = (persona: string) => ({
    persona,
    isDefault: true,
    tenantId: IsNull()
})

// Main function (Ticket 2.3 PromptOptimizer)
export const buildSystemPrompt = async (
    persona: string,
    taskName: string,
    taskDescription: string,
    inputContext: string,
    appDataSource: DataSource,
    targetModel?: string
): Promise<string> => {
    try {
        // 1. Check DB for a global default prompt for this persona (Ticket 2.5 versioning)
        const promptRepo = appDataSource.getRepository(CoworkPrompt)
        let template: string | null = null

        const dbPrompt = await promptRepo.findOne({
            where: buildGlobalDefaultWhere(persona),
            order: { version: 'DESC' }
        })

        if (dbPrompt) {
            template = dbPrompt.templateContent
            logger.info(`[cowork-prompt]: Using DB prompt for persona=${persona} version=${dbPrompt.version}`)
        } else {
            // Fall back to built-in template
            template = DEFAULT_TEMPLATES[persona] || DEFAULT_TEMPLATES.researcher
        }

        // 2. Adapt for target model before variable injection so placeholders remain available
        if (targetModel) {
            template = adaptPromptForModel(template, targetModel)
        }

        // 3. Inject variables
        const prompt = template
            .replaceAll('{task_name}', taskName)
            .replaceAll('{task_description}', taskDescription)
            .replaceAll(
                '{input_context}',
                inputContext ? `Previous task outputs:\n${inputContext}` : 'No prior context - this is the first task.'
            )

        return prompt
    } catch (error) {
        // Never fail prompt generation - fall back to a minimal prompt
        logger.error(`[cowork-prompt]: Failed to build prompt, using fallback: ${error}`)
        return `You are a helpful AI assistant.\n\nTask: ${taskName}\n${taskDescription}\n\n${inputContext}`
    }
}
console.log('Hii')

// Seed default prompts into DB (Ticket 2.5)
export const seedDefaultPrompts = async (appDataSource: DataSource): Promise<void> => {
    const promptRepo = appDataSource.getRepository(CoworkPrompt)

    for (const [persona, template] of Object.entries(DEFAULT_TEMPLATES)) {
        const existing = await promptRepo.findOneBy(buildGlobalDefaultWhere(persona))

        if (!existing) {
            await promptRepo.save(
                promptRepo.create({
                    persona,
                    templateContent: template,
                    variableMappings: JSON.stringify({
                        task_name: 'Name of the task',
                        task_description: 'Full task requirements',
                        input_context: 'Outputs from dependency tasks'
                    }),
                    version: 1,
                    isDefault: true
                })
            )
            logger.info(`[cowork-prompt]: Seeded default prompt for persona=${persona}`)
        }
    }
}
