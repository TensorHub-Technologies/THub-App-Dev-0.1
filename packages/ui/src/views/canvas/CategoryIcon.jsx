import agentsIcondark from '../../assets/icons/agent_lite.svg'
import agentsIconlite from '../../assets/icons/agent_dark.svg'
import chainIcondark from '../../assets/icons/chain_lite.svg'
import chainIconlite from '../../assets/icons/chain_dark.svg'
import cacheIcondark from '../../assets/icons/cache_lite.svg'
import cacheIconlite from '../../assets/icons/cache_dark.svg'
import ThreePIcon from '@mui/icons-material/ThreeP'
import docsIcondark from '../../assets/icons/document_dark.svg'
import docsIconlite from '../../assets/icons/document_lite.svg'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import MemoryIcon from '@mui/icons-material/Memory'
import AddModeratorIcon from '@mui/icons-material/AddModerator'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import promptsIcondark from '../../assets/icons/prompt_lite.svg'
import promptsIconlite from '../../assets/icons/prompt_dark.svg'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import ContentCutIcon from '@mui/icons-material/ContentCut'
import ContactsIcon from '@mui/icons-material/Contacts'
import toolsIcondark from '../../assets/icons/tools_lite.svg'
import toolsIconlite from '../../assets/icons/tools_dark.svg'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import LayersIcon from '@mui/icons-material/Layers'
import engineIconlite from '../../assets/icons/engine_dark.svg'
import engineIcondark from '../../assets/icons/engine_lite.svg'
import QrCodeIcon from '@mui/icons-material/QrCode'
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount'
import { IconChartScatter3d, IconGraph, IconUsersGroup, IconTools } from '@tabler/icons-react'

const getCategoryIcon = (category, customization) => {
    const allIconsObj = {
        Agents: (
            <img
                src={customization?.isDarkMode ? agentsIconlite : agentsIcondark}
                alt='Agents'
                style={{ width: '25px', height: '25px', backgroundColor: 'transparent' }}
            />
        ),
        Cache: (
            <img
                src={customization?.isDarkMode ? cacheIconlite : cacheIcondark}
                alt='cache'
                style={{ width: '23px', height: '23px', backgroundColor: 'transparent' }}
            />
        ),
        Chains: (
            <img
                src={customization?.isDarkMode ? chainIcondark : chainIconlite}
                alt='chain'
                style={{ width: '23px', height: '23px', backgroundColor: 'transparent' }}
            />
        ),
        'Chat Models': <ThreePIcon />,
        'Document Loaders': (
            <img
                src={customization?.isDarkMode ? docsIcondark : docsIconlite}
                alt='document loaders'
                style={{ width: '23px', height: '23px', backgroundColor: 'transparent' }}
            />
        ),
        Embeddings: <IconChartScatter3d />,
        Graph: <IconGraph />,
        Memory: <MemoryIcon />,
        LLMs: <ViewInArIcon />,
        'Multi Agents': <IconUsersGroup />,
        Moderation: <AddModeratorIcon />,
        'Output Parsers': <ExitToAppIcon />,
        Prompts: (
            <img
                src={customization?.isDarkMode ? promptsIconlite : promptsIcondark}
                alt='prompts'
                style={{ width: '26px', height: '26px', backgroundColor: 'transparent' }}
            />
        ),
        'Record Manager': <ContactsIcon />,
        Retrievers: <QueryStatsIcon />,
        'Sequential Agents': <SwitchAccountIcon />,
        'Text Splitters': <ContentCutIcon />,
        Tools: (
            <img
                src={customization?.isDarkMode ? toolsIconlite : toolsIcondark}
                alt='tools'
                style={{ width: '26px', height: '26px', backgroundColor: 'transparent' }}
            />
        ),
        'Tools (MCP)': <IconTools />,
        Utilities: <AutoFixHighIcon />,
        'Vector Stores': <LayersIcon />,
        // 'Agent Studio': (
        //     <img src={AgentPipeline} alt='AgentPipeline' style={{ width: '25px', height: '25px', backgroundColor: 'transparent' }} />
        // ),
        Engine: (
            <img
                src={customization?.isDarkMode ? engineIconlite : engineIcondark}
                alt='engine'
                style={{ width: '26px', height: '26px', backgroundColor: 'transparent' }}
            />
        ),
        'Response Synthesizer': <QrCodeIcon />
    }

    return allIconsObj[category] || ''
}

export { getCategoryIcon }
