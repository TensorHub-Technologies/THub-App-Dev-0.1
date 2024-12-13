// assets
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined'
import DynamicFeedOutlinedIcon from '@mui/icons-material/DynamicFeedOutlined'
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import { IconMathIntegral } from '@tabler/icons-react'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'

const icons = {
    AppsOutlinedIcon,
    DynamicFeedOutlinedIcon,
    ConstructionOutlinedIcon,
    SmartToyOutlinedIcon,
    IconMathIntegral,
    HttpsOutlinedIcon,
    VpnKeyOutlinedIcon,
    InsertDriveFileOutlinedIcon
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
        // {
        //     id: 'agentflows',
        //     title: 'Agentflows',
        //     type: 'item',
        //     url: '/agentflows',
        //     icon: icons.IconUsersGroup,
        //     breadcrumbs: true,
        //     isBeta: true
        // },
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
        // {
        //     id: 'assistants',
        //     title: 'Assistants',
        //     type: 'item',
        //     url: '/assistants',
        //     icon: icons.SmartToyOutlinedIcon,
        //     breadcrumbs: true
        // },
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

        // {
        //     id: 'document-stores',
        //     title: 'Document Stores',
        //     type: 'item',
        //     url: '/document-stores',
        //     icon: icons.InsertDriveFileOutlinedIcon,
        //     breadcrumbs: true
        // }
    ]
}

export default dashboard
