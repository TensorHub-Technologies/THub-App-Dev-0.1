import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import './Node.css'

// material-ui

import { useTheme } from '@mui/material/styles'
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Divider,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Typography,
    TextField,
    Tooltip,
    Stack
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PersonIcon from '@mui/icons-material/Person'
import LinkIcon from '@mui/icons-material/Link'
import CachedIcon from '@mui/icons-material/Cached'
import ThreePIcon from '@mui/icons-material/ThreeP'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload'
// import FingerprintIcon from '@mui/icons-material/Fingerprint'
import { IconAffiliate } from '@tabler/icons'
import CallMergeIcon from '@mui/icons-material/CallMerge'
import MemoryIcon from '@mui/icons-material/Memory'
import AddModeratorIcon from '@mui/icons-material/AddModerator'

import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions'

import QueryStatsIcon from '@mui/icons-material/QueryStats'
import ContentCutIcon from '@mui/icons-material/ContentCut'
import ContactsIcon from '@mui/icons-material/Contacts'
import BuildIcon from '@mui/icons-material/Build'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import LayersIcon from '@mui/icons-material/Layers'
import ArchitectureIcon from '@mui/icons-material/Architecture'
import QrCodeIcon from '@mui/icons-material/QrCode'

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar'

// project imports
import MainCard from '@/ui-component/cards/MainCard'

// icons
import { IconX } from '@tabler/icons'

// const
import { baseURL } from '@/store/constant'
import { SET_COMPONENT_NODES } from '@/store/actions'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { SHOW_MENU } from '@/store/constant'

// ==============================|| ADD NODES||============================== //
function a11yProps(index) {
    return {
        id: `attachment-tab-${index}`,
        'aria-controls': `attachment-tabpanel-${index}`
    }
}

const allIconsObj = {
    Agents: <PersonIcon />,
    Cache: <CachedIcon />,
    Chains: <LinkIcon />,
    'Chat Models': <ThreePIcon />,
    'Document Loaders': <DriveFolderUploadIcon />,
    Embeddings: <IconAffiliate />,
    Memory: <MemoryIcon />,
    LLMs: <CallMergeIcon />,
    Moderation: <AddModeratorIcon />,
    'Output Parsers': <ExitToAppIcon />,
    Prompts: <IntegrationInstructionsIcon />,
    'Record Manager': <ContactsIcon />,
    Retrievers: <QueryStatsIcon />,
    'Text Splitters': <ContentCutIcon />,
    Tools: <BuildIcon />,
    Utilities: <AutoFixHighIcon />,
    'Vector Stores': <LayersIcon />,
    Engine: <ArchitectureIcon />,
    'Response Synthesizer': <QrCodeIcon />
}

const getIconWithClass = (iconName, className) => {
    const Icon = allIconsObj[iconName]
    if (Icon) {
        return React.cloneElement(Icon, { className })
    } else {
        return null
    }
}

const AddNodes = ({ nodesData, node }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    console.log('customization', customization)
    const [searchValue, setSearchValue] = useState('')
    const [nodes, setNodes] = useState({})
    // const [open, setOpen] = useState(false)
    const [categoryExpanded, setCategoryExpanded] = useState({})
    const [tabValue, setTabValue] = useState(0)

    // const anchorRef = useRef(null)
    // const prevOpen = useRef(open)
    const ps = useRef()

    // Temporary method to handle Deprecating Vector Store and New ones
    const categorizeVectorStores = (nodes, accordianCategories, isFilter) => {
        const obj = { ...nodes }
        const vsNodes = obj['Vector Stores'] ?? []
        const deprecatingNodes = []
        const newNodes = []
        for (const vsNode of vsNodes) {
            if (vsNode.badge === 'DEPRECATING') deprecatingNodes.push(vsNode)
            else newNodes.push(vsNode)
        }
        delete obj['Vector Stores']

        if (newNodes.length) {
            obj['Vector Stores;NEW'] = newNodes
            accordianCategories['Vector Stores;NEW'] = isFilter ? true : false
        }
        setNodes(obj)
    }

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

    const getSearchedNodes = (value) => {
        const passed = nodesData.filter((nd) => {
            const passesQuery = nd.name.toLowerCase().includes(value.toLowerCase())
            const passesCategory = nd.category.toLowerCase().includes(value.toLowerCase())
            return passesQuery || passesCategory
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
        if (newTabValue === 0) {
            return langchainNodes
        } else {
            return llmaindexNodes
        }
    }

    const groupByCategory = (nodes, newTabValue, isFilter) => {
        const taggedNodes = groupByTags(nodes, newTabValue)
        const accordianCategories = {}
        const result = taggedNodes.reduce(function (r, a) {
            r[a.category] = r[a.category] || []
            r[a.category].push(a)
            accordianCategories[a.category] = isFilter ? true : false
            return r
        }, Object.create(null))
        setNodes(result)
        categorizeVectorStores(result, accordianCategories, isFilter)
        setCategoryExpanded(accordianCategories)
    }

    const handleAccordionChange = (category) => (event, isExpanded) => {
        const accordianCategories = { ...categoryExpanded }
        accordianCategories[category] = isExpanded
        setCategoryExpanded(accordianCategories)
    }

    const [isInputFocused, setInputFocused] = useState(false)

    const onDragStart = (event, node) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(node))
        event.dataTransfer.effectAllowed = 'move'
    }

    useEffect(() => {
        if (nodesData) {
            groupByCategory(nodesData)
            dispatch({ type: SET_COMPONENT_NODES, componentNodes: nodesData })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodesData, dispatch])

    console.log(customization.menu_open, 'SHOW_MENU')

    return (
        <>
            <Paper
                sx={{
                    // transition: 'width 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    zIndex: 1000,
                    width: customization.menu_open ? '350px' : '100px',
                    //  height: 'calc(100vh - 70px)',
                    borderRight: `2px solid ${theme.palette.divider}`,
                    borderRadius: 0,
                    overflow: 'hidden'
                }}
                onMouseEnter={() => dispatch({ type: SHOW_MENU })}
                onMouseLeave={() => dispatch({ type: SHOW_MENU })}
            >
                <MainCard
                    sx={{
                        bgcolor: theme.palette.background.default,
                        borderRadius: '0 !important'
                    }}
                    border={false}
                    elevation={16}
                    content={false}
                    boxShadow
                    shadow={theme.shadows[16]}
                >
                    <Box sx={{ p: 2 }}>
                        <Box
                            sx={{
                                marginLeft: '17px',
                                display: 'flex',
                                alignItems: 'flex-end'
                            }}
                        >
                            <SearchOutlinedIcon
                                stroke={1.5}
                                size='1rem'
                                sx={{
                                    cursor: 'default',
                                    color: customization?.isDarkMode ? '#fff' : '#fff',
                                    background: isInputFocused
                                        ? 'linear-gradient(to right, #3C5BA4, #E22A90)'
                                        : customization?.isDarkMode
                                        ? '#E22A90'
                                        : '#3C5BA4',
                                    borderRadius: '20%',
                                    padding: '2px',
                                    mb: 2,
                                    mr: 1,
                                    '&:hover': {
                                        background: `linear-gradient(to right, #3C5BA4, #E22A90) !important`
                                    }
                                }}
                            />
                            {customization.menu_open && (
                                <TextField
                                    label='Search'
                                    variant='standard'
                                    sx={{
                                        width: '100%',
                                        mb: 2,
                                        '& .TextField-root': {
                                            '& fieldset': {
                                                borderColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                            },
                                            '&:hover fieldset': { borderColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4' },
                                            '&.Mui-focused fieldset': { borderColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4' }
                                        },
                                        transition: 'all .2s ease-in-out',
                                        '& input': { color: customization.isDarkMode ? '#fff' : '#000' },
                                        '& label.Mui-focused': { color: customization.isDarkMode ? '#E22A90' : '#3C5BA4' },
                                        '& .MuiInput-underline:after': {
                                            borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                        },
                                        '& .MuiInput-underline:before': {
                                            borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                        },
                                        '&:hover': {
                                            '& .MuiInput-underline:before': {
                                                borderBottomColor: customization.isDarkMode ? '#3C5BA4 !important' : '#E22A90 !important'
                                            }
                                        }
                                    }}
                                    id='input-search-node'
                                    value={searchValue}
                                    onChange={(e) => filterSearch(e.target.value)}
                                    onFocus={() => setInputFocused(true)}
                                    onBlur={() => setInputFocused(false)}
                                    placeholder='Search1'
                                    InputProps={{
                                        'aria-label': 'weight',
                                        endAdornment: (
                                            <InputAdornment
                                                position='end'
                                                sx={{
                                                    cursor: 'pointer',
                                                    color: theme.palette.grey[500],
                                                    '&:hover': {
                                                        color: theme.palette.grey[900]
                                                    }
                                                }}
                                                title='Clear Search'
                                            >
                                                <IconX
                                                    stroke={1.5}
                                                    size='1rem'
                                                    onClick={() => filterSearch('')}
                                                    style={{
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        </Box>

                        {/* {customization.menu_open && (
                            <Tabs
                                sx={{ position: 'relative', minHeight: '50px', height: '50px' }}
                                variant='fullWidth'
                                value={tabValue}
                                onChange={handleTabChange}
                                aria-label='tabs'
                            >
                                {['LangChain', 'LlamaIndex'].map((item, index) => (
                                    <Tab
                                        icon={
                                            <div
                                                style={{
                                                    borderRadius: '50%'
                                                }}
                                            >
                                                <img
                                                    style={{
                                                        width: '25px',
                                                        height: '25px',
                                                        borderRadius: '50%',
                                                        objectFit: 'contain'
                                                    }}
                                                    src={index === 0 ? LangChainPNG : LlamaindexPNG}
                                                    alt={item}
                                                />
                                            </div>
                                        }
                                        iconPosition='start'
                                        sx={{ minHeight: '50px', height: '50px' }}
                                        key={index}
                                        label={item}
                                        {...a11yProps(index)}
                                    ></Tab>
                                ))}

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        borderRadius: 10,
                                        background: 'rgb(254,252,191)',
                                        padding: '1px 6px',
                                        width: 'max-content',
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        fontSize: '0.6rem',
                                        lineHeight: '1.5',
                                        fontWeight: 700
                                    }}
                                >
                                    <span style={{ color: 'rgb(116,66,16)' }}>BETA</span>
                                </div>
                            </Tabs>
                        )} */}
                        <Divider />
                    </Box>

                    <PerfectScrollbar
                        containerRef={(el) => {
                            ps.current = el
                        }}
                        style={{ height: '100%', maxHeight: 'calc(100vh - 200px)', overflowX: 'hidden' }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                pt: 0,
                                height: '100%'
                            }}
                        >
                            <List
                                sx={{
                                    width: '100%',
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
                                    .map((category) => (
                                        <Accordion
                                            expanded={categoryExpanded[category] || false}
                                            onChange={handleAccordionChange(category)}
                                            key={category}
                                            disableGutters
                                        >
                                            <AccordionSummary
                                                expandIcon={
                                                    customization.menu_open && (
                                                        <ExpandMoreIcon
                                                            className={customization?.isDarkMode ? 'ExpandMoreIcon1' : 'ExpandMoreIcon2'}
                                                            sx={{
                                                                background: 'transparent !important'
                                                            }}
                                                        />
                                                    )
                                                }
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
                                                    {getIconWithClass(
                                                        category.replace(';NEW', ''),
                                                        customization?.isDarkMode ? 'icon-dark' : 'icon-light'
                                                    )}
                                                    {customization.menu_open && (
                                                        <Typography
                                                            className={customization?.isDarkMode ? 'stack-text1' : 'stack-text2'}
                                                            variant='h5'
                                                        >
                                                            {category.replace(';NEW', '')}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </AccordionSummary>

                                            <AccordionDetails>
                                                <List>
                                                    {nodes[category].map((node, index) => (
                                                        <Box key={node.name} onDragStart={(event) => onDragStart(event, node)} draggable>
                                                            <Tooltip title={node.description} followCursor>
                                                                <Box
                                                                    sx={{
                                                                        borderRadius: `${customization.borderRadius}px`,
                                                                        p: 0.2,
                                                                        mb: 1,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        backgroundColor: 'transparent',
                                                                        '&:hover': {
                                                                            background: `linear-gradient(to right, #3C5BA4, #E22A90) !important`,
                                                                            '& > .MuiListItem-root': {
                                                                                backgroundColor: theme.palette.background.default,
                                                                                borderRadius: `${customization.borderRadius}px`
                                                                            },
                                                                            '& > .MuiListItem-root .MuiListItemAvatar-root': {
                                                                                background:
                                                                                    'linear-gradient(to left, #3C5BA4, #E22A90) !important'
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
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center'
                                                                        }}
                                                                    >
                                                                        <ListItemAvatar
                                                                            sx={{
                                                                                mt: 0,
                                                                                borderRadius: `${customization.borderRadius}px`,
                                                                                py: 0.3,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                background: `linear-gradient(to right, #3C5BA4, #E22A90)`
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    justifyContent: 'center',
                                                                                    alignItems: 'center',
                                                                                    width: 50,
                                                                                    height: 50,
                                                                                    borderRadius: '20%',
                                                                                    // backgroundColor: theme.palette.background.default
                                                                                    backgroundColor: customization.isDarkMode
                                                                                        ? '#f0f0f0'
                                                                                        : '#f0f0f0'
                                                                                }}
                                                                            >
                                                                                <img
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        padding: 5,
                                                                                        objectFit: 'contain'
                                                                                    }}
                                                                                    alt={node.name}
                                                                                    src={`${baseURL}/api/v1/node-icon/${node.name}`}
                                                                                />
                                                                            </div>
                                                                        </ListItemAvatar>

                                                                        {customization.menu_open ? (
                                                                            <ListItemText
                                                                                sx={{
                                                                                    ml: 1,
                                                                                    display: 'flex',
                                                                                    alignItems: 'center'
                                                                                }}
                                                                                primary={node.label}
                                                                            />
                                                                        ) : (
                                                                            ''
                                                                        )}
                                                                    </ListItem>
                                                                </Box>
                                                            </Tooltip>
                                                            {index === nodes[category].length - 1 ? null : <Divider />}
                                                        </Box>
                                                    ))}
                                                </List>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                            </List>
                            <Box sx={{ mr: 2 }}>
                                {/* <ButtonBase title='Toggle' sx={{ marginLeft: customization.menu_open ? "325px" : "75px", marginTop: customization.menu_open ? "-1200px" : "-1000px" }}
                                    onClick={() => dispatch({ type: SHOW_MENU })}>
                                    <Avatar className='sideAvatar'
                                        variant='rounded'
                                        sx={{
                                            ...theme.typography.commonAvatar,
                                            ...theme.typography.mediumAvatar,
                                            transition: 'all .2s ease-in-out',
                                            // background: theme.palette.canvasHeader.settingsLight,
                                            background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                            // color: theme.palette.canvasHeader.settingsDark,
                                            color: '#fff',
                                            '&:hover': {
                                                // background: theme.palette.canvasHeader.settingsDark,
                                                // background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                                                // color: theme.palette.canvasHeader.settingsLight
                                                // color: '#fff'
                                            }
                                        }}
                                      
                                    >

                                        <KeyboardArrowRightIcon stroke={1.5} size='1.3rem' sx={{ background: customization.isDarkMode ? '#E22A90' : '#3C5BA4' }} />
                                    </Avatar>
                                </ButtonBase> */}
                            </Box>
                        </Box>
                    </PerfectScrollbar>
                </MainCard>
            </Paper>
        </>
    )
}

AddNodes.propTypes = {
    nodesData: PropTypes.array,
    node: PropTypes.object
}

export default AddNodes
