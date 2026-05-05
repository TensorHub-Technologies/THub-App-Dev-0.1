// constant

import Agent from '@/assets/images/agentpipeline/Agent.png'
import Condition from '@/assets/images/agentpipeline/Condition.png'
import Loop from '@/assets/images/agentpipeline/Loop.png'
import LLM from '@/assets/images/agentpipeline/LLM.png'
import StartAgentflow from '@/assets/images/agentpipeline/StartAgents.png'
import StickyNote from '@/assets/images/agentpipeline/StickyNotes.png'
import HumanInput from '@/assets/images/agentpipeline/HumanInput.png'
import DirectReplay from '@/assets/images/agentpipeline/DirectReply.png'
import CustomFunction from '@/assets/images/agentpipeline/CustomFunction.png'
import Tool from '@/assets/images/agentpipeline/Tools.png'
import Retriever from '@/assets/images/agentpipeline/Reteriever.png'
import ConditionAgent from '@/assets/images/agentpipeline/ConsitionAgent.png'
import Http from '@/assets/images/agentpipeline/Http.png'
import Iteration from '@/assets/images/agentpipeline/Iteration.png'
import ExecuteFlow from '@/assets/images/agentpipeline/ExecuteFlow.png'
import { apiBaseUrl } from '@/utils/apiBaseUrl'

export const gridSpacing = 3
export const drawerWidth = 260
export const appDrawerWidth = 320
export const headerHeight = 80
export const maxScroll = 100000
export const baseURL = apiBaseUrl
export const uiBaseURL = import.meta.env.VITE_UI_BASE_URL || window.location.origin
export const THUB_CREDENTIAL_ID = 'THUB_CREDENTIAL_ID'
export const REDACTED_CREDENTIAL_VALUE = '_THUB_BLANK_07167752-1a71-43b1-bf8f-4f32252165db'
export const SHOW_MENU = 'SHOW_MENU'
export const AGENTFLOW_ICONS = [
    {
        name: 'conditionAgentflow',
        icon: Condition,
        color: '#FF9F1C'
    },
    {
        name: 'startAgentflow',
        icon: StartAgentflow,
        color: '#06D6A0'
    },
    {
        name: 'llmAgentflow',
        icon: LLM,
        color: '#118AB2'
    },
    {
        name: 'agentAgentflow',
        icon: Agent,
        color: '#FFD166'
    },
    {
        name: 'humanInputAgentflow',
        icon: HumanInput,
        color: '#52289F'
    },
    {
        name: 'loopAgentflow',
        icon: Loop,
        color: '#FFA07A'
    },
    {
        name: 'directReplyAgentflow',
        icon: DirectReplay,
        color: '#06D6A0'
    },
    {
        name: 'customFunctionAgentflow',
        icon: CustomFunction,
        color: '#4B3CA7'
    },
    {
        name: 'toolAgentflow',
        icon: Tool,
        color: '#FFD166'
    },
    {
        name: 'retrieverAgentflow',
        icon: Retriever,
        color: '#B6B6C6'
    },
    {
        name: 'conditionAgentAgentflow',
        icon: ConditionAgent,
        color: '#B6B6C6'
    },
    {
        name: 'stickyNoteAgentflow',
        icon: StickyNote,
        color: '#fee440'
    },
    {
        name: 'httpAgentflow',
        icon: Http,
        color: '#B6B6C6'
    },
    {
        name: 'iterationAgentflow',
        icon: Iteration,
        color: '#9C89B8'
    },
    {
        name: 'executeFlowAgentflow',
        icon: ExecuteFlow,
        color: '#F0F0F5'
    }
]
