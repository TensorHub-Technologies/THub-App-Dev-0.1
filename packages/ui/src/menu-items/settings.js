// assets
import {
    IconTrash,
    IconFileUpload,
    IconFileExport,
    IconUsers,
    IconCopy,
    IconMessage,
    IconDatabaseExport,
    IconAdjustmentsHorizontal,
    IconTemplate
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
    IconTemplate
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
            id: 'saveAsTemplate',
            title: 'Save As Template',
            type: 'item',
            url: '',
            icon: icons.IconTemplate
        },
        {
            id: 'loadChatflow',
            title: 'Load Workflow',
            type: 'item',
            url: '',
            icon: icons.IconFileUpload
        },

        {
            id: 'duplicateWorkflow',
            title: 'Duplicate Workflow',
            type: 'item',
            url: '',
            icon: icons.IconCopy
        },
        {
            id: 'loadChatflow',
            title: 'Load Chatflow',
            type: 'item',
            url: '',
            icon: icons.IconFileUpload
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
