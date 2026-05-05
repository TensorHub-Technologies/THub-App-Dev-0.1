// assets
import AppsOutlinedIcon from '@/assets/custom-svg/AppsOutlinedIcon'
import DynamicFeedOutlinedIcon from '@/assets/custom-svg/DynamicFeedOutlinedIcon'
import ConstructionOutlinedIcon from '@/assets/custom-svg/ConstructionOutlinedIcon'
import HttpsOutlinedIcon from '@/assets/custom-svg/HttpsOutlinedIcon'
import VpnKeyOutlinedIcon from '@/assets/custom-svg/VpnKeyOutlinedIcon'
import IconMathIntegral from '@/assets/custom-svg/IconMathIntegral'
import { IconUsersGroup, IconListCheck, IconFiles, IconDatabase, IconTestPipe, IconChartHistogram, IconRobot } from '@tabler/icons-react'

const icons = {
    AppsOutlinedIcon,
    DynamicFeedOutlinedIcon,
    ConstructionOutlinedIcon,
    IconMathIntegral,
    HttpsOutlinedIcon,
    VpnKeyOutlinedIcon,
    IconUsersGroup,
    IconListCheck,
    IconFiles,
    IconDatabase,
    IconTestPipe,
    IconChartHistogram,
    IconRobot
}

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
    id: 'dashboard',
    title: '',
    type: 'group',
    children: [
        {
            id: 'workflows',
            title: 'AI Workspace',
            type: 'item',
            url: '/workflows',
            icon: icons.AppsOutlinedIcon,
            breadcrumbs: true
        },
        {
            id: 'agentflows',
            title: 'Agent Studio',
            type: 'item',
            url: '/agentflows',
            icon: icons.IconUsersGroup,
            breadcrumbs: true
        },
        {
            id: 'cowork',
            title: 'CoWork',
            type: 'collapse',
            icon: icons.IconRobot,
            children: [
                {
                    id: 'cowork-sessions',
                    title: 'Sessions',
                    type: 'item',
                    url: '/cowork',
                    breadcrumbs: false
                },
                {
                    id: 'cowork-prompts',
                    title: 'Prompt Studio',
                    type: 'item',
                    url: '/cowork/prompts',
                    breadcrumbs: false
                },
                {
                    id: 'cowork-skills',
                    title: 'Skills',
                    type: 'item',
                    url: '/cowork/skills',
                    breadcrumbs: false
                }
            ]
        },
        {
            id: 'document-stores',
            title: 'Document Stores',
            type: 'item',
            url: '/document-stores',
            icon: icons.IconFiles,
            breadcrumbs: true,
            permission: 'documentStores:view'
        },
        {
            id: 'executions',
            title: 'Executions',
            type: 'item',
            url: '/executions',
            icon: icons.IconListCheck,
            breadcrumbs: true
        },

        {
            id: 'marketplaces',
            title: 'Templates',
            type: 'item',
            url: '/templates',
            icon: icons.DynamicFeedOutlinedIcon,
            breadcrumbs: true
        },
        {
            id: 'tools',
            title: 'Tools',
            type: 'item',
            url: '/tools',
            icon: icons.ConstructionOutlinedIcon,
            breadcrumbs: true
        },
        {
            id: 'credentials',
            title: 'Credentials',
            type: 'item',
            url: '/credentials',
            icon: icons.HttpsOutlinedIcon,
            breadcrumbs: true
        },
        {
            id: 'variables',
            title: 'Variables',
            type: 'item',
            url: '/variables',
            icon: icons.IconMathIntegral,
            breadcrumbs: true
        },
        {
            id: 'apikey',
            title: 'API Keys',
            type: 'item',
            url: '/apikey',
            icon: icons.VpnKeyOutlinedIcon,
            breadcrumbs: true
        }
    ]
}

// Second group for evaluation-related items (appears after divider)
const evaluation = {
    id: 'evaluation',
    title: '',
    type: 'group',
    children: [
        {
            id: 'datasets',
            title: 'Datasets',
            type: 'item',
            url: '/datasets',
            icon: icons.IconDatabase,
            breadcrumbs: true
        },
        {
            id: 'evaluators',
            title: 'Evaluators',
            type: 'item',
            url: '/evaluators',
            icon: icons.IconTestPipe,
            breadcrumbs: true
        },
        {
            id: 'evaluations',
            title: 'Evaluations',
            type: 'item',
            url: '/evaluations',
            icon: icons.IconChartHistogram,
            breadcrumbs: true
        }
    ]
}

export default dashboard
export { evaluation }
