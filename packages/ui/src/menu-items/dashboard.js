// assets
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined' // AI Workspace
import DynamicFeedOutlinedIcon from '@mui/icons-material/DynamicFeedOutlined' // Templates
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined' //Tools
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined' // Assistants
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined' // Credentials
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'

const icons = {
    AppsOutlinedIcon,
    DynamicFeedOutlinedIcon,
    ConstructionOutlinedIcon,
    SmartToyOutlinedIcon,
    InventoryOutlinedIcon,
    HttpsOutlinedIcon,
    VpnKeyOutlinedIcon
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
            id: 'assistants',
            title: 'Assistants',
            type: 'item',
            url: '/assistants',
            icon: icons.SmartToyOutlinedIcon,
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
            icon: icons.InventoryOutlinedIcon,
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
