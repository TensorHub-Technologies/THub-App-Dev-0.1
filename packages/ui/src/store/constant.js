// constant
import {
    IconLibrary,
    IconTools,
    IconFunctionFilled,
    IconMessageCircleFilled,
    IconRobot,
    IconArrowsSplit,
    IconPlayerPlayFilled,
    IconSparkles,
    IconReplaceUser,
    IconRepeat,
    IconSubtask,
    IconNote,
    IconWorld,
    IconRelationOneToManyFilled,
    IconVectorBezier2
} from '@tabler/icons-react'

export const gridSpacing = 3
export const drawerWidth = 260
export const appDrawerWidth = 320
export const headerHeight = 80
export const maxScroll = 100000
export const baseURL = import.meta.env.VITE_API_BASE_URL || window.location.origin
export const uiBaseURL = import.meta.env.VITE_UI_BASE_URL || window.location.origin
export const FLOWISE_CREDENTIAL_ID = 'FLOWISE_CREDENTIAL_ID'
export const REDACTED_CREDENTIAL_VALUE = '_FLOWISE_BLANK_07167752-1a71-43b1-bf8f-4f32252165db'
export const SHOW_MENU = 'SHOW_MENU'
export const AGENTFLOW_ICONS = [
    {
        name: 'conditionAgentflow',
        icon: IconArrowsSplit,
        color: '#FF9F1C'
    },
    {
        name: 'startAgentflow',
        icon: IconPlayerPlayFilled,
        color: '#06D6A0'
    },
    {
        name: 'llmAgentflow',
        icon: IconSparkles,
        color: '#118AB2'
    },
    {
        name: 'agentAgentflow',
        icon: IconRobot,
        color: '#7C29A7'
    },
    {
        name: 'humanInputAgentflow',
        icon: IconReplaceUser,
        color: '#52289F'
    },
    {
        name: 'loopAgentflow',
        icon: IconRepeat,
        color: '#FFA07A'
    },
    {
        name: 'directReplyAgentflow',
        icon: IconMessageCircleFilled,
        color: '#06D6A0'
    },
    {
        name: 'customFunctionAgentflow',
        icon: IconFunctionFilled,
        color: '#4B3CA7'
    },
    {
        name: 'toolAgentflow',
        icon: IconTools,
        color: '#FFD166'
    },
    {
        name: 'retrieverAgentflow',
        icon: IconLibrary,
        color: '#B6B6C6'
    },
    {
        name: 'conditionAgentAgentflow',
        icon: IconSubtask,
        color: '#EF476F'
    },
    {
        name: 'stickyNoteAgentflow',
        icon: IconNote,
        color: '#fee440'
    },
    {
        name: 'httpAgentflow',
        icon: IconWorld,
        color: '#EF476F'
    },
    {
        name: 'iterationAgentflow',
        icon: IconRelationOneToManyFilled,
        color: '#9C89B8'
    },
    {
        name: 'executeFlowAgentflow',
        icon: IconVectorBezier2,
        color: '#C7376D'
    }
]
