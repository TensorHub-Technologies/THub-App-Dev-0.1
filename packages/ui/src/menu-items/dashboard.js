// assets
import AppsOutlinedIcon from '@/assets/custom-svg/AppsOutlinedIcon'
import DynamicFeedOutlinedIcon from '@/assets/custom-svg/DynamicFeedOutlinedIcon'
import ConstructionOutlinedIcon from '@/assets/custom-svg/ConstructionOutlinedIcon'
import HttpsOutlinedIcon from '@/assets/custom-svg/HttpsOutlinedIcon'
import VpnKeyOutlinedIcon from '@/assets/custom-svg/VpnKeyOutlinedIcon'
import IconMathIntegral from '@/assets/custom-svg/IconMathIntegral'
import { IconUsersGroup, IconListCheck } from '@tabler/icons-react'

const icons = {
    AppsOutlinedIcon,
    DynamicFeedOutlinedIcon,
    ConstructionOutlinedIcon,
    IconMathIntegral,
    HttpsOutlinedIcon,
    VpnKeyOutlinedIcon,
    IconUsersGroup,
    IconListCheck
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
            title: 'Agent Pipeline',
            type: 'item',
            url: '/agentflows',
            icon: icons.IconUsersGroup,
            breadcrumbs: true
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

export default dashboard
