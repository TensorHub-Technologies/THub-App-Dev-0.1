import { useState, useRef, useEffect, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
    OutlinedInput,
    Typography,
    Chip,
    Tab,
    Tabs,
    IconButton,
    Collapse
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar'

// project imports
import { StyledFab } from '@/ui-component/button/StyledFab'
import AgentflowGeneratorDialog from '@/ui-component/dialog/AgentflowGeneratorDialog'

// icons
import { IconSearch, IconX, IconSparkles, IconChevronRight, IconChevronLeft } from '@tabler/icons-react'
import LlamaindexPNG from '@/assets/images/llamaindex.png'
import LangChainPNG from '@/assets/images/langchain.png'
import utilNodesPNG from '@/assets/images/utilNodes.png'
import { getCategoryIcon } from './CategoryIcon'
import subscriptionPlan from './subscriptionPlan'

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

const DRAWER_WIDTH = 350
const MINI_DRAWER_WIDTH = 80

const AddNodes = ({ nodesData, node, isAgentCanvas, isAgentflowv2, onFlowGenerated }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()

    const userData = useSelector((state) => state.user.userData)
    const subscription = userData?.subscription_type
    console.log(subscription, 'subscription')

    const [searchValue, setSearchValue] = useState('')
    const [nodes, setNodes] = useState({})
    const [isExpanded, setIsExpanded] = useState(false)
    const [categoryExpanded, setCategoryExpanded] = useState({})
    const [tabValue, setTabValue] = useState(0)
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
    // const allowedMenu="Premium"
    const allowedMenuItemKeys = Object.keys(allowedMenu)
    const [tab, setTab] = useState(['LangChain'])

    useEffect(() => {
        if (userData.subscription_type !== 'free') {
            setTab(['LangChain', 'LlamaIndex', 'Utilities'])
        }
    }, [])

    for (let nodeKey in nodes) {
        if (Object.prototype.hasOwnProperty.call(nodes, nodeKey) && !allowedMenuItemKeys.includes(nodeKey)) {
            delete nodes[nodeKey]
        } else {
            const allowedSubMenuItems = allowedMenu[nodeKey]
            const subMenuItemToCheck = nodes[nodeKey]

            const updatedSubMenuItems = subMenuItemToCheck.filter((val) => allowedSubMenuItems.includes(val.label))
            nodes[nodeKey] = updatedSubMenuItems
        }
    }

    const ps = useRef()

    const scrollTop = () => {
        const curr = ps.current
        if (curr) {
            curr.scrollTop = 0
        }
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
        filterSearch(searchValue, newValue)
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
        const utilitiesNodes = nodes.filter((nd) => nd.tags && nd.tags.includes('Utilities'))
        if (newTabValue === 0) {
            return langchainNodes
        } else if (newTabValue === 1) {
            return llmaindexNodes
        } else {
            return utilitiesNodes
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
                    if (category !== 'Agent Flows') {
                        continue
                    }
                } else {
                    if (category === 'Agent Flows') {
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
            accordianCategories['Agent Flows'] = true
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
                if (category === 'Agent Flows' || category === 'Multi Agents' || category === 'Sequential Agents') {
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

    const getImage = (tabValue) => {
        if (tabValue === 0) {
            return LangChainPNG
        } else if (tabValue === 1) {
            return LlamaindexPNG
        } else {
            return utilNodesPNG
        }
    }

    const renderIcon = (node) => {
        const foundIcon = AGENTFLOW_ICONS.find((icon) => icon.name === node.name)

        if (!foundIcon) return null
        return <foundIcon.icon size={30} color={node.color} />
    }

    // Render mini node item
    const renderMiniNodeItem = (node, index) => (
        <Box
            key={`${node.name}-${index}`}
            sx={{
                position: 'relative',
                mb: 0.5,
                cursor: 'move'
            }}
            onDragStart={(event) => onDragStart(event, node)}
            draggable
            onMouseEnter={() => setHoveredNode(`${node.name}-${index}`)}
            onMouseLeave={() => setHoveredNode(null)}
        >
            <ListItemButton
                sx={{
                    justifyContent: 'center',
                    px: 0.5,
                    py: 0.5,
                    borderRadius: 1,
                    minHeight: 'auto',
                    position: 'relative',
                    overflow: 'visible'
                }}
            >
                {/* Node Icon */}
                <Box
                    sx={{
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 2
                    }}
                >
                    {node.color && !node.icon ? (
                        renderIcon(node)
                    ) : (
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <img
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    objectFit: 'contain'
                                }}
                                alt={node.name}
                                src={`${baseURL}/api/v1/node-icon/${node.name}`}
                            />
                        </Box>
                    )}
                </Box>

                {/* Hover Label */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        ml: 0.5,
                        whiteSpace: 'nowrap',
                        boxShadow: theme.shadows[2],
                        opacity: hoveredNode === `${node.name}-${index}` ? 1 : 0,
                        visibility: hoveredNode === `${node.name}-${index}` ? 'visible' : 'hidden',
                        transition: theme.transitions.create(['opacity', 'visibility'], {
                            duration: theme.transitions.duration.short
                        }),
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                >
                    <Typography variant='caption' sx={{ fontSize: '0.7rem' }}>
                        {node.label}
                    </Typography>
                </Box>
            </ListItemButton>
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
                        left: isExpanded ? DRAWER_WIDTH + 20 : MINI_DRAWER_WIDTH + 20,
                        top: 80,
                        background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)'
                        },
                        transition: theme.transitions.create(['left'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen
                        }),
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
                        backgroundColor: theme.palette.background.paper,
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
                >
                    {isExpanded ? (
                        <>
                            <Typography variant='h6'>Add Nodes</Typography>
                            <IconButton size='small'>
                                <IconChevronLeft />
                            </IconButton>
                        </>
                    ) : (
                        <IconButton size='small'>
                            <IconChevronRight />
                        </IconButton>
                    )}
                </Box>

                {/* Search Bar - Only show when expanded */}
                {isExpanded && (
                    <Box sx={{ px: 2, pb: 2 }}>
                        <OutlinedInput
                            sx={{ width: '100%' }}
                            id='input-search-node'
                            value={searchValue}
                            onChange={(e) => filterSearch(e.target.value)}
                            placeholder='Search nodes'
                            size='small'
                            startAdornment={
                                <InputAdornment position='start'>
                                    <IconSearch stroke={1.5} size='1rem' color={theme.palette.grey[500]} />
                                </InputAdornment>
                            }
                            endAdornment={
                                searchValue && (
                                    <InputAdornment position='end'>
                                        <IconButton size='small' onClick={() => filterSearch('')} edge='end'>
                                            <IconX size='1rem' />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        />
                    </Box>
                )}

                {/* Tabs - Only show when expanded and not agent canvas */}
                {isExpanded && !isAgentCanvas && (
                    <Box sx={{ px: 2, pb: 1 }}>
                        <Tabs variant='fullWidth' value={tabValue} onChange={handleTabChange} aria-label='tabs' sx={{ minHeight: 40 }}>
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
                                            src={getImage(index)}
                                            alt={item}
                                        />
                                    }
                                    iconPosition='start'
                                    label={item}
                                    sx={{
                                        minHeight: 40,
                                        fontSize: '0.75rem'
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
                    style={{
                        height: '100%',
                        flex: 1,
                        overflowX: 'hidden'
                    }}
                >
                    <Box sx={{ px: isExpanded ? 2 : 0.5 }}>
                        {isExpanded ? (
                            // Full drawer view
                            <List sx={{ py: 0 }}>
                                {Object.keys(nodes)
                                    .sort()
                                    .map((category) => (
                                        <Accordion
                                            key={category}
                                            expanded={categoryExpanded[category] || false}
                                            onChange={handleAccordionChange(category)}
                                            disableGutters
                                            sx={{
                                                boxShadow: 'none',
                                                '&:before': { display: 'none' }
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                sx={{
                                                    minHeight: 48,
                                                    '& .MuiAccordionSummary-content': {
                                                        margin: '8px 0'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography sx={{ mr: 1, fontSize: '1.2rem' }}>
                                                        {getCategoryIcon(category, customization)}
                                                    </Typography>
                                                    {category.split(';').length > 1 ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Typography variant='subtitle2'>{category.split(';')[0]}</Typography>
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
                                                        <Typography variant='subtitle2'>{category}</Typography>
                                                    )}
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ pt: 0 }}>
                                                {nodes[category].map((node, index) => (
                                                    <div key={node.name} onDragStart={(event) => onDragStart(event, node)} draggable>
                                                        <ListItemButton
                                                            sx={{
                                                                p: 1,
                                                                borderRadius: 1,
                                                                cursor: 'move',
                                                                mb: index === nodes[category].length - 1 ? 0 : 0.5
                                                            }}
                                                        >
                                                            <ListItem sx={{ p: 0 }}>
                                                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                                                    {node.color && !node.icon ? (
                                                                        <Box
                                                                            sx={{
                                                                                width: 32,
                                                                                height: 32,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            }}
                                                                        >
                                                                            {renderIcon(node)}
                                                                        </Box>
                                                                    ) : (
                                                                        <Box
                                                                            sx={{
                                                                                width: 32,
                                                                                height: 32,
                                                                                borderRadius: '50%',
                                                                                backgroundColor: 'white',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            }}
                                                                        >
                                                                            <img
                                                                                style={{
                                                                                    width: '20px',
                                                                                    height: '20px',
                                                                                    objectFit: 'contain'
                                                                                }}
                                                                                alt={node.name}
                                                                                src={`${baseURL}/api/v1/node-icon/${node.name}`}
                                                                            />
                                                                        </Box>
                                                                    )}
                                                                </ListItemAvatar>
                                                                <ListItemText
                                                                    primary={
                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                            <Typography variant='body2'>{node.label}</Typography>
                                                                            {node.badge && (
                                                                                <Chip
                                                                                    sx={{
                                                                                        ml: 1,
                                                                                        height: 18,
                                                                                        fontSize: '0.6rem',
                                                                                        background:
                                                                                            node.badge === 'DEPRECATING'
                                                                                                ? theme.palette.warning.main
                                                                                                : theme.palette.info.main,
                                                                                        color: 'white'
                                                                                    }}
                                                                                    size='small'
                                                                                    label={node.badge}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    }
                                                                    secondary={
                                                                        <Typography variant='caption' color='textSecondary'>
                                                                            {node.description}
                                                                        </Typography>
                                                                    }
                                                                />
                                                            </ListItem>
                                                        </ListItemButton>
                                                    </div>
                                                ))}
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
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
