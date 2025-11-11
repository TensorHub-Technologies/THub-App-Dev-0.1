import { useState, useRef, useEffect, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

// material-ui
import { useTheme } from '@mui/material/styles'
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Drawer,
    Divider,
    InputAdornment,
    List,
    ListItemButton,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Chip,
    Tab,
    Tabs,
    IconButton,
    Collapse,
    Stack,
    Tooltip,
    TextField
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar'

// project imports
import { StyledFab } from '@/ui-component/button/StyledFab'
import AgentflowGeneratorDialog from '@/ui-component/dialog/AgentflowGeneratorDialog'
import '../../ui-component/cards/card.css'
// icons
import { IconSearch, IconX, IconSparkles } from '@tabler/icons-react'
import LlamaindexPNG from '@/assets/images/llamaindex.png'
import LangChainPNG from '@/assets/images/langchain.png'
import agentPipelinePNG from '@/assets/images/agentpipeline.png'
import { getCategoryIcon } from './CategoryIcon'
import subscriptionPlan from './subscriptionPlan.json'

// const
import { baseURL, AGENTFLOW_ICONS } from '@/store/constant'
import { SET_COMPONENT_NODES } from '@/store/actions'

// ==============================|| ADD NODES DRAWER ||============================== //
function a11yProps(index) {
    return {
        id: `attachment-tab-${index}`,
        'aria-controls': `attachment-tabpanel-${index}`
    }
}

const blacklistCategoriesForAgentCanvas = ['Agents', 'Memory', 'Record Manager', 'Utilities']

const agentMemoryNodes = ['agentMemory', 'sqliteAgentMemory', 'postgresAgentMemory', 'mySQLAgentMemory']

// Show blacklisted nodes (exceptions) for agent canvas
const exceptionsForAgentCanvas = {
    Memory: agentMemoryNodes,
    Utilities: ['getVariable', 'setVariable', 'stickyNote']
}

// Hide some nodes from the chatflow canvas
const blacklistForChatflowCanvas = {
    Memory: agentMemoryNodes
}

const DRAWER_WIDTH = 360
const MINI_DRAWER_WIDTH = 80

const AddNodes = ({ nodesData, node, isAgentCanvas, isAgentflowv2, onFlowGenerated }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const userData = useSelector((state) => state.user.userData)
    const subscription = userData?.subscription_type
    const [searchValue, setSearchValue] = useState('')
    const [nodes, setNodes] = useState({})
    const [isExpanded, setIsExpanded] = useState(true)
    const [categoryExpanded, setCategoryExpanded] = useState({})
    const [hoveredNode, setHoveredNode] = useState(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})

    const isAgentCanvasV2 = window.location.pathname.includes('/v2/agentcanvas')

    const allowedPlan = subscriptionPlan.find((x) => Object.keys(x).includes(userData.subscription_type))
    userData.subscription_type === null || undefined ? (userData.subscription_type = 'free') : userData.subscription_type
    if (!userData.subscription_type) {
        userData.subscription_type = localStorage.getItem('subscription_type')
    }
    const allowedMenu = allowedPlan[userData?.subscription_type]
    const [tab, setTab] = useState(['LangChain', 'LlamaIndex'])
    const [tabValue, setTabValue] = useState(0)

    for (let nodeKey in nodes) {
        const allowedSubMenuItems = allowedMenu[nodeKey]
        const subMenuItemToCheck = nodes[nodeKey]
        const updatedSubMenuItems = subMenuItemToCheck.filter((val) => allowedSubMenuItems.includes(val.label))
        nodes[nodeKey] = updatedSubMenuItems
    }

    const ps = useRef()

    const scrollTop = () => {
        const curr = ps.current
        if (curr) {
            curr.scrollTop = 0
        }
    }

    useEffect(() => {
        const pathname = location.pathname
        const hasCanvasId = pathname.startsWith('/canvas/') && pathname !== '/canvas'
        const hasAgentCanvasId = pathname.startsWith('/v2/agentcanvas/') && pathname !== '/v2/agentcanvas'

        if (hasCanvasId) {
            setTab(['LangChain', 'LlamaIndex'])
        } else if (hasAgentCanvasId) {
            setTab(['Agent Studio'])
            setTabValue(0)
        } else if (pathname === '/canvas' || pathname === '/v2/agentcanvas') {
            setTab(['LangChain', 'LlamaIndex', 'Agent Studio'])
        }
    }, [location.pathname, userData.subscription_type])

    useEffect(() => {
        if (location.pathname === '/v2/agentcanvas') {
            setTabValue(2)
        } else if (location.pathname === '/canvas') {
            if (tabValue === 2) {
                setTabValue(0)
            }
        } else if (location.pathname.startsWith('/v2/agentcanvas/')) {
            setTabValue(0)
        }
    }, [location.pathname])

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
        filterSearch(searchValue, newValue)
        const selectedTab = tab[newValue]

        if (selectedTab === 'Agent Studio') {
            if (location.pathname.startsWith('/v2/agentcanvas/')) {
                return
            }
            navigate('/v2/agentcanvas')
        } else if ((selectedTab === 'LangChain' || selectedTab === 'LlamaIndex') && location.pathname === '/v2/agentcanvas') {
            navigate('/canvas')
        }
    }

    const addException = (category) => {
        let nodes = []
        if (category) {
            const nodeNames = exceptionsForAgentCanvas[category] || []
            nodes = nodesData.filter((nd) => nd.category === category && nodeNames.includes(nd.name))
        } else {
            for (const category in exceptionsForAgentCanvas) {
                const nodeNames = exceptionsForAgentCanvas[category]
                nodes.push(...nodesData.filter((nd) => nd.category === category && nodeNames.includes(nd.name)))
            }
        }
        return nodes
    }

    const getSearchedNodes = (value) => {
        if (isAgentCanvas) {
            const nodes = nodesData.filter((nd) => !blacklistCategoriesForAgentCanvas.includes(nd.category))
            nodes.push(...addException())
            const passed = nodes.filter((nd) => {
                const passesName = nd.name.toLowerCase().includes(value.toLowerCase())
                const passesLabel = nd.label.toLowerCase().includes(value.toLowerCase())
                const passesCategory = nd.category.toLowerCase().includes(value.toLowerCase())
                return passesName || passesCategory || passesLabel
            })
            return passed
        }
        let nodes = nodesData.filter((nd) => nd.category !== 'Multi Agents' && nd.category !== 'Sequential Agents')

        for (const category in blacklistForChatflowCanvas) {
            const nodeNames = blacklistForChatflowCanvas[category]
            nodes = nodes.filter((nd) => !nodeNames.includes(nd.name))
        }

        const passed = nodes.filter((nd) => {
            const passesName = nd.name.toLowerCase().includes(value.toLowerCase())
            const passesLabel = nd.label.toLowerCase().includes(value.toLowerCase())
            const passesCategory = nd.category.toLowerCase().includes(value.toLowerCase())
            return passesName || passesCategory || passesLabel
        })
        return passed
    }

    const filterSearch = (value, newTabValue) => {
        setSearchValue(value)
        setTimeout(() => {
            if (value) {
                const returnData = getSearchedNodes(value)
                groupByCategory(returnData, newTabValue ?? tabValue, true)
                scrollTop()
            } else if (value === '') {
                groupByCategory(nodesData, newTabValue ?? tabValue)
                scrollTop()
            }
        }, 500)
    }

    const groupByTags = (nodes, newTabValue = 0) => {
        const langchainNodes = nodes.filter((nd) => !nd.tags)
        const llmaindexNodes = nodes.filter((nd) => nd.tags && nd.tags.includes('LlamaIndex'))
        // const utilitiesNodes = nodes.filter((nd) => nd.tags && nd.tags.includes('Utilities'))
        if (newTabValue === 0) {
            return langchainNodes
        } else if (newTabValue === 1) {
            return llmaindexNodes
        } else {
            // return utilitiesNodes
        }
    }

    const groupByCategory = (nodes, newTabValue, isFilter) => {
        if (isAgentCanvas) {
            const accordianCategories = {}
            const result = nodes.reduce(function (r, a) {
                r[a.category] = r[a.category] || []
                r[a.category].push(a)
                accordianCategories[a.category] = isFilter ? true : false
                return r
            }, Object.create(null))

            const filteredResult = {}
            for (const category in result) {
                if (isAgentCanvasV2) {
                    if (category !== 'Agent Studio') {
                        continue
                    }
                } else {
                    if (category === 'Agent Studio') {
                        continue
                    }
                }
                // Filter out blacklisted categories
                if (!blacklistCategoriesForAgentCanvas.includes(category)) {
                    // Filter out LlamaIndex nodes
                    const nodes = result[category].filter((nd) => !nd.tags || !nd.tags.includes('LlamaIndex'))
                    if (!nodes.length) continue

                    filteredResult[category] = nodes
                }

                // Allow exceptionsForAgentCanvas
                if (Object.keys(exceptionsForAgentCanvas).includes(category)) {
                    filteredResult[category] = addException(category)
                }
            }
            setNodes(filteredResult)
            accordianCategories['Multi Agents'] = true
            accordianCategories['Sequential Agents'] = true
            accordianCategories['Memory'] = true
            accordianCategories['Agent Studio'] = true
            setCategoryExpanded(accordianCategories)
        } else {
            const taggedNodes = groupByTags(nodes, newTabValue)
            const accordianCategories = {}
            const result = taggedNodes.reduce(function (r, a) {
                r[a.category] = r[a.category] || []
                r[a.category].push(a)
                accordianCategories[a.category] = isFilter ? true : false
                return r
            }, Object.create(null))

            const filteredResult = {}
            for (const category in result) {
                if (category === 'Agent Studio') {
                    continue
                }
                if (Object.keys(blacklistForChatflowCanvas).includes(category)) {
                    const nodes = blacklistForChatflowCanvas[category]
                    result[category] = result[category].filter((nd) => !nodes.includes(nd.name))
                }
                filteredResult[category] = result[category]
            }

            setNodes(filteredResult)
            setCategoryExpanded(accordianCategories)
        }
    }

    const handleAccordionChange = (category) => (event, isExpanded) => {
        const accordianCategories = { ...categoryExpanded }
        accordianCategories[category] = isExpanded
        setCategoryExpanded(accordianCategories)
    }

    const onDragStart = (event, node) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(node))
        event.dataTransfer.effectAllowed = 'move'
    }

    const getImage = (tab) => {
        if (tab === 'LangChain') {
            return LangChainPNG
        } else if (tab === 'LlamaIndex') {
            return LlamaindexPNG
        } else if (tab === 'Agent Studio') {
            return agentPipelinePNG
        }
    }

    const renderIcon = (node) => {
        const foundIcon = AGENTFLOW_ICONS.find((icon) => icon.name === node.name)

        if (!foundIcon) return null

        return (
            <img
                src={foundIcon.icon}
                alt={node.name}
                style={{
                    width: 30,
                    height: 30,
                    objectFit: 'contain'
                }}
            />
        )
    }

    const renderMiniNodeItem = (node, index) => (
        <Box
            key={`${node.name}-${index}`}
            sx={{
                position: 'relative',
                cursor: 'move'
            }}
            onDragStart={(event) => onDragStart(event, node)}
            draggable
            onMouseEnter={() => setHoveredNode(`${node.name}-${index}`)}
            onMouseLeave={() => setHoveredNode(null)}
        >
            <ListItemAvatar
                sx={{
                    mt: 0,
                    borderRadius: `${customization.borderRadius}px`,
                    py: 0.2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 30
                }}
            >
                {node.color && !node.icon ? (
                    <div
                        style={{
                            padding: '3px',
                            borderRadius: '10px',
                            // background: 'linear-gradient(to right, #3C5BA4, #E22A90)',
                            display: 'inline-block',
                            marginBottom: '5px'
                        }}
                    >
                        <div
                            style={{
                                borderRadius: '10%',
                                // backgroundColor: customization.isDarkMode ? '#f0f0f0' : '#fff',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '32px',
                                height: '32px'
                            }}
                        >
                            {renderIcon(node)}
                        </div>
                    </div>
                ) : (
                    // Gradient border wrapper
                    <img
                        style={{
                            width: '31px',
                            height: '32px',
                            objectFit: 'contain',
                            borderRadius: '10px',
                            marginBottom: '10px'
                        }}
                        alt={node.name}
                        src={`${baseURL}/api/v1/node-icon/${node.name}`}
                    />
                )}
            </ListItemAvatar>
        </Box>
    )

    useEffect(() => {
        if (node) setIsExpanded(false)
    }, [node])

    useEffect(() => {
        if (nodesData) {
            groupByCategory(nodesData)
            dispatch({ type: SET_COMPONENT_NODES, componentNodes: nodesData })
        }
    }, [nodesData, dispatch])

    // Handle dialog open/close
    const handleOpenDialog = () => {
        setOpenDialog(true)
        setDialogProps({
            title: 'What would you like to build?',
            description:
                'Enter your prompt to generate an agentflow. Performance may vary with different models. Only nodes and edges are generated, you will need to fill in the input fields for each node.'
        })
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
    }

    const handleConfirmDialog = () => {
        setOpenDialog(false)
        onFlowGenerated()
    }

    return (
        <>
            {/* Generate Agentflow Fab */}
            {isAgentflowv2 && (
                <StyledFab
                    sx={{
                        position: 'fixed',
                        // left: 1240,
                        right: 140,
                        top: 40,

                        zIndex: theme.zIndex.drawer + 2
                    }}
                    onClick={handleOpenDialog}
                    size='small'
                    color='primary'
                    aria-label='generate'
                    title='Generate Agentflow'
                >
                    <IconSparkles />
                </StyledFab>
            )}

            <AgentflowGeneratorDialog
                show={openDialog}
                dialogProps={dialogProps}
                onCancel={handleCloseDialog}
                onConfirm={handleConfirmDialog}
            />

            {/* Mini/Full Drawer */}
            <Drawer
                variant='permanent'
                classes={{
                    paper: customization.isDarkMode ? 'gradient-card-global-subtle-dark' : 'gradient-card-global-subtle-light'
                }}
                sx={{
                    width: isExpanded ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: isExpanded ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen
                        }),
                        overflowX: 'hidden',
                        // backgroundColor: theme.palette.background.paper,
                        borderRight: `1px solid ${theme.palette.divider}`
                    }
                }}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: isExpanded ? 2 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: 64,
                        marginTop: 10,
                        justifyContent: isExpanded ? 'space-between' : 'center'
                    }}
                ></Box>

                {/* Search Bar - Only show when expanded */}
                {isExpanded && (
                    <Box sx={{ px: 2, pb: 2 }}>
                        <TextField
                            id='input-search-node'
                            label='Search Node'
                            variant='standard'
                            fullWidth
                            value={searchValue}
                            onChange={(e) => filterSearch(e.target.value)}
                            placeholder='Search nodes'
                            sx={{
                                mb: 2,
                                transition: 'all .2s ease-in-out',
                                '& input': {
                                    color: customization.isDarkMode ? '#fff' : '#000'
                                },
                                '& label.Mui-focused': {
                                    color: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                },
                                '& .MuiInput-underline:before': {
                                    borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                },
                                '& .MuiInput-underline:after': {
                                    borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                },
                                '&:hover .MuiInput-underline:before': {
                                    borderBottomColor: `${customization.isDarkMode ? '#E22A90' : '#3C5BA4'} !important`
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <IconSearch size='1rem' stroke={1.5} color={customization.isDarkMode ? '#E22A90' : '#3C5BA4'} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchValue && (
                                    <InputAdornment position='end'>
                                        <IconButton size='small' onClick={() => filterSearch('')} edge='end'>
                                            <IconX size='1rem' stroke={1.5} color={customization.isDarkMode ? '#E22A90' : '#3C5BA4'} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                )}

                {/* Tabs - Only show when expanded and not agent canvas */}
                {isExpanded && (
                    <Box sx={{ pb: 1, ml: 2 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label='tabs'
                            TabIndicatorProps={{
                                style: {
                                    backgroundColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                    padding: '0px'
                                }
                            }}
                            sx={{ minHeight: 40 }}
                        >
                            {tab.map((item, index) => (
                                <Tab
                                    key={index}
                                    icon={
                                        <img
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                objectFit: 'contain'
                                            }}
                                            src={getImage(item)}
                                            alt={item}
                                        />
                                    }
                                    iconPosition='start'
                                    label={item}
                                    sx={{
                                        minHeight: '50px',
                                        height: '50px',
                                        color: customization.isDarkMode ? '#fff' : '#000',
                                        '&.Mui-selected': {
                                            color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                        },
                                        '&:hover': {
                                            color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                        },
                                        padding: '0px',
                                        marginRight: 2
                                    }}
                                    {...a11yProps(index)}
                                />
                            ))}
                        </Tabs>
                        <Divider sx={{ mt: 1 }} />
                    </Box>
                )}

                {/* Node Categories */}
                <PerfectScrollbar
                    containerRef={(el) => {
                        ps.current = el
                    }}
                    style={{ height: '100%', overflowX: 'hidden' }}
                >
                    <Box
                        sx={{
                            p: 2,
                            pt: 0,
                            height: '100%'
                        }}
                    >
                        {isExpanded ? (
                            // Full drawer view
                            <List
                                sx={{
                                    width: '100%',
                                    // border:"2px solid red",
                                    maxWidth: 350,
                                    py: 0,
                                    borderRadius: '10px',
                                    [theme.breakpoints.down('md')]: {
                                        maxWidth: 350
                                    },
                                    '& .MuiListItemSecondaryAction-root': {
                                        top: 22
                                    },
                                    '& .MuiDivider-root': {
                                        my: 0
                                    },
                                    '& .list-container': {
                                        pl: 7
                                    }
                                }}
                            >
                                {Object.keys(nodes)
                                    .sort()
                                    .map((category) => {
                                        const isAgentPipeline = category.replace(';NEW', '') === 'Agent Studio'

                                        return (
                                            <Accordion
                                                key={category}
                                                expanded={isAgentPipeline ? true : categoryExpanded[category] || false}
                                                onChange={isAgentPipeline ? undefined : handleAccordionChange(category)}
                                                disableGutters
                                                sx={{
                                                    boxShadow: 'none',
                                                    background: 'transparent',
                                                    '&:before': { display: 'none' }
                                                }}
                                            >
                                                {!isAgentPipeline && (
                                                    <AccordionSummary
                                                        expandIcon={
                                                            <ExpandMoreIcon
                                                                className={
                                                                    customization?.isDarkMode ? 'ExpandMoreIcon1' : 'ExpandMoreIcon2'
                                                                }
                                                                sx={{
                                                                    background: 'transparent !important'
                                                                }}
                                                            />
                                                        }
                                                        sx={{
                                                            minHeight: 48,
                                                            '& .MuiAccordionSummary-content': {
                                                                margin: '8px 0'
                                                            }
                                                        }}
                                                        aria-controls={`nodes-accordian-${category}`}
                                                        id={`nodes-accordian-header-${category}`}
                                                    >
                                                        <Stack
                                                            id='stack-icons'
                                                            gap={1}
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <Typography sx={{ fontSize: '1.2rem' }}>
                                                                {getCategoryIcon(category.replace(';NEW', ''), customization)}
                                                            </Typography>
                                                            {category.split(';').length > 1 ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Typography
                                                                        className={
                                                                            customization?.isDarkMode ? 'stack-text1' : 'stack-text2'
                                                                        }
                                                                        variant='subtitle2'
                                                                    >
                                                                        {category.split(';')[0]}
                                                                    </Typography>
                                                                    <Chip
                                                                        sx={{
                                                                            ml: 1,
                                                                            height: 20,
                                                                            fontSize: '0.65rem',
                                                                            background:
                                                                                category.split(';')[1] === 'DEPRECATING'
                                                                                    ? theme.palette.warning.main
                                                                                    : theme.palette.info.main,
                                                                            color: 'white'
                                                                        }}
                                                                        size='small'
                                                                        label={category.split(';')[1]}
                                                                    />
                                                                </Box>
                                                            ) : (
                                                                <Typography
                                                                    className={customization?.isDarkMode ? 'stack-text1' : 'stack-text2'}
                                                                    variant='h5'
                                                                >
                                                                    {category.replace(';NEW', '')}
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    </AccordionSummary>
                                                )}

                                                <AccordionDetails sx={{ pt: 0 }}>
                                                    <List>
                                                        {nodes[category].map((node, index) => (
                                                            <Box
                                                                key={node.name}
                                                                onDragStart={(event) => onDragStart(event, node)}
                                                                draggable
                                                            >
                                                                <Tooltip title={node.description} followCursor>
                                                                    <Box
                                                                        sx={{
                                                                            borderRadius: `${customization.borderRadius}px`,
                                                                            p: 0.2,
                                                                            mb: index === nodes[category].length - 1 ? 0 : 1,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            backgroundColor: 'transparent',
                                                                            '&:hover': {
                                                                                background: `linear-gradient(to right, #3C5BA4, #E22A90) !important`,
                                                                                '& > .MuiListItem-root': {
                                                                                    backgroundColor: theme.palette.background.default,
                                                                                    borderRadius: `${customization.borderRadius}px`
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <ListItem
                                                                            alignItems='flex-start'
                                                                            sx={{
                                                                                borderRadius: `${customization.borderRadius}px`,
                                                                                cursor: 'move',
                                                                                display: 'flex',
                                                                                justifyContent: 'flex-start',
                                                                                alignItems: 'center',
                                                                                p: 0
                                                                            }}
                                                                        >
                                                                            <ListItemAvatar>
                                                                                {node.color && !node.icon ? (
                                                                                    <Box
                                                                                        sx={{
                                                                                            width: 40,
                                                                                            height: 40,
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center',
                                                                                            borderRadius: '20%'
                                                                                            // backgroundColor: customization.isDarkMode
                                                                                            //     ? '#f0f0f0'
                                                                                            //     : '#f0f0f0'
                                                                                        }}
                                                                                    >
                                                                                        {renderIcon(node)}
                                                                                    </Box>
                                                                                ) : (
                                                                                    <div
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'center',
                                                                                            alignItems: 'center',
                                                                                            width: 40,
                                                                                            height: 40,
                                                                                            borderRadius: '20%'
                                                                                            // backgroundColor: customization.isDarkMode
                                                                                            //     ? '#f0f0f0'
                                                                                            //     : '#f0f0f0'
                                                                                        }}
                                                                                    >
                                                                                        <img
                                                                                            style={{
                                                                                                width: '32px',
                                                                                                height: '32px',
                                                                                                objectFit: 'contain',
                                                                                                borderRadius: '10px',
                                                                                                marginBottom: '10px'
                                                                                            }}
                                                                                            alt={node.name}
                                                                                            src={`${baseURL}/api/v1/node-icon/${node.name}`}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </ListItemAvatar>

                                                                            <ListItemText
                                                                                sx={{
                                                                                    ml: 1,
                                                                                    display: 'flex',
                                                                                    flexDirection: 'column'
                                                                                }}
                                                                                primary={
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                        <Typography variant='body2'>
                                                                                            {node.label}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                }
                                                                            />
                                                                        </ListItem>
                                                                    </Box>
                                                                </Tooltip>
                                                                {index === nodes[category].length - 1 ? null : <Divider />}
                                                            </Box>
                                                        ))}
                                                    </List>
                                                </AccordionDetails>
                                            </Accordion>
                                        )
                                    })}
                            </List>
                        ) : (
                            // Mini drawer view - show category icons and expanded nodes
                            <List sx={{ py: 1 }}>
                                {Object.keys(nodes)
                                    .sort()
                                    .map((category) => (
                                        <Box key={category}>
                                            {/* Category Icon */}
                                            <ListItemButton
                                                sx={{
                                                    justifyContent: 'center',
                                                    px: 1,
                                                    py: 1.5,
                                                    mb: 0.5,
                                                    borderRadius: 1,
                                                    minHeight: 'auto'
                                                }}
                                                title={category}
                                            >
                                                <Typography sx={{ fontSize: '1.5rem' }}>
                                                    {getCategoryIcon(category, customization)}
                                                </Typography>
                                            </ListItemButton>

                                            {/* Expanded Nodes */}
                                            <Collapse in={categoryExpanded[category]} timeout='auto' unmountOnExit>
                                                <Box sx={{ pl: 0.5, pr: 0.5 }}>
                                                    {nodes[category]?.map((node, index) => renderMiniNodeItem(node, index))}
                                                </Box>
                                            </Collapse>
                                        </Box>
                                    ))}
                            </List>
                        )}
                    </Box>
                </PerfectScrollbar>
            </Drawer>
        </>
    )
}

AddNodes.propTypes = {
    nodesData: PropTypes.array,
    node: PropTypes.object,
    onFlowGenerated: PropTypes.func,
    isAgentCanvas: PropTypes.bool,
    isAgentflowv2: PropTypes.bool
}

export default memo(AddNodes)
