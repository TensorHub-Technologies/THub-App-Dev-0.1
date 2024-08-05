// assets
import {
    IconCode,
    IconTrash,
    IconFileUpload,
    IconFileExport,
    IconUsers,
    IconCopy,
    IconMessage,
    IconDatabaseExport,
    IconAdjustmentsHorizontal
} from '@tabler/icons'

// constant
const icons = {
    IconTrash,
    IconFileUpload,
    IconFileExport,
    IconCopy,
    IconUsers,
    IconMessage,
    IconDatabaseExport,
    IconAdjustmentsHorizontal,
    IconCode
}

// ==============================|| SETTINGS MENU ITEMS ||============================== //

const settings = {
    id: 'settings',
    title: '',
    type: 'group',
    children: [
        {
            id: 'apiEndpoint',
            title: 'API Endpoint',
            type: 'item',
            url: '',
            icon: icons.IconCode
        },

        {
            id: 'chatflowConfiguration',
            title: 'Configuration',
            type: 'item',
            url: '',
            icon: icons.IconAdjustmentsHorizontal
        },

        {
            id: 'viewUpsertHistory',
            title: 'Upsert History',
            type: 'item',
            url: '',
            icon: icons.IconDatabaseExport
        },
        {
            id: 'viewMessages',
            title: 'View Messages',
            type: 'item',
            url: '',
            icon: icons.IconMessage
        },
        {
            id: 'viewLeads',
            title: 'View Leads',
            type: 'item',
            url: '',
            icon: icons.IconUsers
        },
        {
            id: 'loadChatflow',
            title: 'Load Workflow',
            type: 'item',
            url: '',
            icon: icons.IconFileUpload
        },

        {
            id: 'duplicateChatflow',
            title: 'Duplicate Workflow',
            type: 'item',
            url: '',
            icon: icons.IconCopy
        },

        {
            id: 'exportChatflow',
            title: 'Export Workflow',
            type: 'item',
            url: '',
            icon: icons.IconFileExport
        },
        {
            id: 'deleteChatflow',
            title: 'Delete Workflow',
            type: 'item',
            url: '',
            icon: icons.IconTrash
        }
    ]
}

export default settings
