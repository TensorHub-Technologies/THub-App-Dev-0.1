import { DataSource } from 'typeorm'
import { AgentCard } from '../a2a/types'
import { AgentCardSkills } from '../database/entities/AgentCardSkills'
import { MyAgentExecutor } from './AgentExecutor/AgentExecutor'
import { A2ARequestHandlers } from '../A2ARequestHandlers'

interface RegisterAgentCardParams {
    agentCard: any
    apiHostName: string
    appDataSource: DataSource
}

export async function registerAgentCard({ agentCard, apiHostName, appDataSource }: RegisterAgentCardParams): Promise<void> {
    if (!agentCard?.is_agent_enabled) {
        return
    }

    const agentCardSkillsRepository = appDataSource.getRepository(AgentCardSkills)

    const agentCardSkills = await agentCardSkillsRepository.find({
        where: { agent_card_id: agentCard.id }
    })

    const mappedAgentCard: AgentCard = {
        protocolVersion: agentCard.protocol_version,
        name: agentCard.name,
        description: agentCard.description,
        url: `${apiHostName}/api/v1/agent2agent/${agentCard.workflow_id}`,
        provider: {
            organization: agentCard.provider_organization ?? 'A2A Samples',
            url: agentCard.provider_url ?? 'https://example.com/a2a-samples'
        },
        version: agentCard.version,
        capabilities: {
            streaming: Boolean(agentCard.capabilities_streaming),
            pushNotifications: Boolean(agentCard.capabilities_push_notifications),
            stateTransitionHistory: Boolean(agentCard.capabilities_state_transition_history)
        },
        securitySchemes: agentCard.security_schemes ? JSON.parse(agentCard.security_schemes) : undefined,
        security: agentCard.security ? JSON.parse(agentCard.security) : undefined,
        defaultInputModes: agentCard.default_input_modes?.split(',') ?? ['text'],
        defaultOutputModes: agentCard.default_output_modes?.split(',') ?? ['text', 'task-status'],
        skills: agentCardSkills.map((skill) => ({
            id: skill.skill_id,
            name: skill.name,
            description: skill.description ?? '',
            tags: skill.tags?.split(',') ?? [],
            examples: skill.examples ? skill.examples.split('||') : [],
            inputModes: skill.input_modes?.split(',') ?? ['text'],
            outputModes: skill.output_modes?.split(',') ?? ['text', 'task-status']
        })),
        supportsAuthenticatedExtendedCard: Boolean(agentCard.supports_authenticated_extended_card)
    }

    const agentExecutor = new MyAgentExecutor(agentCard.workflow_id)

    A2ARequestHandlers.registerRequestHandler(agentCard.workflow_id, mappedAgentCard, agentExecutor)

    console.log(`RegisteredAgentCards() workflowId: ${agentCard.workflow_id}`)
}
