import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef, useState } from 'react'

// navigation
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, ButtonBase, Typography, Stack, TextField } from '@mui/material'
import AppsOutlinedIcon from '@/assets/custom-svg/AppsOutlinedIcon'
import DynamicFeedOutlinedIcon from '@/assets/custom-svg/DynamicFeedOutlinedIcon'
import ConstructionOutlinedIcon from '@/assets/custom-svg/ConstructionOutlinedIcon'
import HttpsOutlinedIcon from '@/assets/custom-svg/HttpsOutlinedIcon'
import SmartToyOutlinedIcon from '@/assets/custom-svg/SmartToyOutlinedIcon'

// icons
import { IconChevronLeft, IconDeviceFloppy, IconCheck, IconX } from '@tabler/icons-react'
import MenuIcon from '@mui/icons-material/Menu'
import ListIcon from '@mui/icons-material/List'
import { VectorStorePopUp } from '@/views/vectorstore/VectorStorePopUp'
import { SET_DARKMODE } from '@/store/actions'

//Logo
// import logo from '@/assets/images/THub_logo_dark.png'
import ColorfulLogo from '@/assets/images/THub_icon_colorful_logo.png'

// project imports
import Settings from '@/views/settings'
import SaveChatflowDialog from '@/ui-component/dialog/SaveChatflowDialog'
import APICodeDialog from '@/views/chatflows/APICodeDialog'
import ViewMessagesDialog from '@/ui-component/dialog/ViewMessagesDialog'
import ChatflowConfigurationDialog from '@/ui-component/dialog/ChatflowConfigurationDialog'
import { IconButton } from '@mui/material'
import toggle_1 from '@/assets/images/toggle_mode-1.svg'
import toggle_2 from '@/assets/images/toggle_mode-2.svg'

// API
import chatflowsApi from '@/api/chatflows'

// Hooks
import useApi from '@/hooks/useApi'

// utils
import { styled } from '@mui/material/styles'
import { Switch, Link } from '@mui/material'
import { generateExportFlowData, getUpsertDetails } from '@/utils/genericHelper'
import { uiBaseURL } from '@/store/constant'
import UpsertHistoryDialog from '../vectorstore/UpsertHistoryDialog'
import ViewLeadsDialog from '@/ui-component/dialog/ViewLeadsDialog'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction, SET_CHATFLOW } from '@/store/actions'
import ExportAsTemplateDialog from '@/ui-component/dialog/ExportAsTemplateDialog'
import Edit from '@/assets/icons/EditPencil'
import VpnKeyOutlinedIcon from '@/assets/custom-svg/VpnKeyOutlinedIcon'
import IconMathIntegral from '@/assets/custom-svg/IconMathIntegral'

// ==============================|| CANVAS HEADER ||============================== //

const CanvasHeader = ({ chatflow, isAgentCanvas, handleSaveFlow, handleDeleteFlow, handleLoadFlow }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const [viewLeadsDialogProps, setViewLeadsDialogProps] = useState({})
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const flowNameRef = useRef()
    const settingsRef = useRef()
    const [isEditingFlowName, setEditingFlowName] = useState(null)
    const [flowName, setFlowName] = useState('')
    const [isSettingsOpen, setSettingsOpen] = useState(false)
    const [flowDialogOpen, setFlowDialogOpen] = useState(false)
    const [apiDialogOpen, setAPIDialogOpen] = useState(false)
    const [apiDialogProps, setAPIDialogProps] = useState({})
    const [upsertHistoryDialogOpen, setUpsertHistoryDialogOpen] = useState(false)
    const [upsertHistoryDialogProps, setUpsertHistoryDialogProps] = useState({})
    const [viewMessagesDialogOpen, setViewMessagesDialogOpen] = useState(false)
    const [viewMessagesDialogProps, setViewMessagesDialogProps] = useState({})
    const [chatflowConfigurationDialogOpen, setChatflowConfigurationDialogOpen] = useState(false)
    const [chatflowConfigurationDialogProps, setChatflowConfigurationDialogProps] = useState({})
    const [viewLeadsDialogOpen, setViewLeadsDialogOpen] = useState(false)

    const [exportAsTemplateDialogOpen, setExportAsTemplateDialogOpen] = useState(false)
    const [exportAsTemplateDialogProps, setExportAsTemplateDialogProps] = useState({})
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))
    const title = isAgentCanvas ? 'Agents' : 'Workflow'

    // navigation
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)

    const updateChatflowApi = useApi(chatflowsApi.updateChatflow)
    const canvas = useSelector((state) => state.canvas)
    const [canvasDataStore, setCanvasDataStore] = useState(canvas)
    const [isUpsertButtonEnabled, setIsUpsertButtonEnabled] = useState(false)

    const URLpath = document.location.pathname.toString().split('/')
    const chatflowId = URLpath[URLpath.length - 1] === 'canvas' ? '' : URLpath[URLpath.length - 1]

    const [isDark, setIsDark] = useState(() => {
        const storedTheme = localStorage.getItem('isDarkMode')
        return storedTheme !== null ? JSON.parse(storedTheme) : customization.isDarkMode
    })

    const [hovered, setHovered] = useState(false)
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const baseColor = customization?.isDarkMode ? '#fff' : '#000'
    const hoverColor = customization?.isDarkMode ? '#E22A90' : '#3C5BA4'

    const onSettingsItemClick = (setting) => {
        setSettingsOpen(false)

        if (setting === 'deleteChatflow') {
            handleDeleteFlow()
        } else if (setting === 'viewMessages') {
            setViewMessagesDialogProps({
                title: 'View Messages',
                chatflow: chatflow
            })
            setViewMessagesDialogOpen(true)
        } else if (setting === 'viewUpsertHistory') {
            setUpsertHistoryDialogProps({
                title: 'View Upsert History',
                chatflow: chatflow
            })
            setUpsertHistoryDialogOpen(true)
        } else if (setting === 'viewLeads') {
            setViewLeadsDialogProps({
                title: 'View Leads',
                chatflow: chatflow
            })
            setViewLeadsDialogOpen(true)
        } else if (setting === 'chatflowConfiguration') {
            setChatflowConfigurationDialogProps({
                title: 'Workflow Configuration',
                chatflow: chatflow
            })
            setChatflowConfigurationDialogOpen(true)
        } else if (setting === 'apiEndpoint') {
            onAPIDialogClick()
        } else if (setting === 'duplicateWorkflow') {
            try {
                let flowData = chatflow.flowData
                const parsedFlowData = JSON.parse(flowData)
                flowData = JSON.stringify(parsedFlowData)
                localStorage.setItem('duplicatedFlowData', flowData)
                window.open(`${uiBaseURL}/${isAgentCanvas ? 'agentcanvas' : 'canvas'}`, '_self')
            } catch (e) {
                console.error(e)
            }
        } else if (setting === 'exportChatflow') {
            try {
                const flowData = JSON.parse(chatflow.flowData)
                let dataStr = JSON.stringify(generateExportFlowData(flowData), null, 2)
                let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

                let exportFileDefaultName = `${chatflow.name} Workflow.json`

                let linkElement = document.createElement('a')
                linkElement.setAttribute('href', dataUri)
                linkElement.setAttribute('download', exportFileDefaultName)
                linkElement.click()
            } catch (e) {
                console.error(e)
            }
        }
    }

    const onUploadFile = (file) => {
        setSettingsOpen(false)
        handleLoadFlow(file)
    }

    const submitFlowName = () => {
        if (chatflow.id) {
            const updateBody = {
                name: flowNameRef.current.value
            }
            updateChatflowApi.request(chatflow.id, updateBody)
        }
    }
    const MaterialUISwitch = styled(Switch)(({ theme }) => ({
        width: 62,
        height: 34,
        padding: 7,
        '& .MuiSwitch-switchBase': {
            margin: 1,
            padding: 0,
            transform: 'translateX(6px)',
            '&.Mui-checked': {
                color: '#fff',
                transform: 'translateX(22px)',
                '& .MuiSwitch-thumb:before': {
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                        '#fff'
                    )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`
                },
                '& + .MuiSwitch-track': {
                    opacity: 1,
                    backgroundColor: theme.palette.mode === 'dark' ? '#3C5BA4' : '#E22A90'
                }
            }
        },
        '& .MuiSwitch-thumb': {
            background: 'linear-gradient(to right, #3C5BA4, #E22A90)',
            width: 32,
            height: 32,
            '&:before': {
                content: "''",
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                    '#fff'
                )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`
            }
        },
        '& .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: theme.palette.mode === 'dark' ? '#E22A90' : '#3C5BA4',
            borderRadius: 20 / 2
        }
    }))

    const checkIfUpsertAvailable = (nodes, edges) => {
        const upsertNodeDetails = getUpsertDetails(nodes, edges)
        if (upsertNodeDetails.length) setIsUpsertButtonEnabled(true)
        else setIsUpsertButtonEnabled(false)
    }

    useEffect(() => {
        setCanvasDataStore(canvas)
    }, [canvas])

    useEffect(() => {
        if (canvasDataStore.chatflow) {
            const flowData = canvasDataStore.chatflow.flowData ? JSON.parse(canvasDataStore.chatflow.flowData) : []
            checkIfUpsertAvailable(flowData.nodes || [], flowData.edges || [])
        }
    }, [canvasDataStore.chatflow])

    const onAPIDialogClick = () => {
        // If file type is file, isFormDataRequired = true
        let isFormDataRequired = false
        try {
            const flowData = JSON.parse(chatflow.flowData)
            const nodes = flowData.nodes
            for (const node of nodes) {
                if (node.data.inputParams.find((param) => param.type === 'file')) {
                    isFormDataRequired = true
                    break
                }
            }
        } catch (e) {
            console.error(e)
        }

        // If sessionId memory, isSessionMemory = true
        let isSessionMemory = false
        try {
            const flowData = JSON.parse(chatflow.flowData)
            const nodes = flowData.nodes
            for (const node of nodes) {
                if (node.data.inputParams.find((param) => param.name === 'sessionId')) {
                    isSessionMemory = true
                    break
                }
            }
        } catch (e) {
            console.error(e)
        }

        setAPIDialogProps({
            title: 'Embed in website or use as API',
            chatflowid: chatflow.id,
            chatflowApiKeyId: chatflow.apikeyid,
            isFormDataRequired,
            isSessionMemory,
            isAgentCanvas
        })
        setAPIDialogOpen(true)
    }

    const onSaveChatflowClick = () => {
        if (chatflow.id) handleSaveFlow(flowName)
        else setFlowDialogOpen(true)
    }

    const onConfirmSaveName = (flowName, chatflowDescription) => {
        setFlowDialogOpen(false)
        handleSaveFlow(flowName, chatflowDescription)
    }

    useEffect(() => {
        let url = new URL(window.location.href)
        console.log('URL:', url)
        let params = new URLSearchParams(url.search)
        const urlTheme = params.get('theme') === 'dark'

        const storedTheme = localStorage.getItem('isDarkMode')
        const initialTheme = storedTheme !== null ? JSON.parse(storedTheme) : urlTheme

        setIsDark(initialTheme)
        dispatch({ type: SET_DARKMODE, isDarkMode: initialTheme })
        localStorage.setItem('isDarkMode', initialTheme)
    }, [dispatch])

    const changeDarkMode = () => {
        const newTheme = !isDark
        setIsDark(newTheme)
        dispatch({ type: SET_DARKMODE, isDarkMode: newTheme })
        localStorage.setItem('isDarkMode', newTheme)
    }

    useEffect(() => {
        if (updateChatflowApi.data) {
            setFlowName(updateChatflowApi.data.name)
            dispatch({ type: SET_CHATFLOW, chatflow: updateChatflowApi.data })
        }
        setEditingFlowName(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateChatflowApi.data])

    // navigation
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    useEffect(() => {
        if (chatflow) {
            setFlowName(chatflow.name)
            // if configuration dialog is open, update its data
            if (chatflowConfigurationDialogOpen) {
                setChatflowConfigurationDialogProps({
                    title: 'Workflow Configuration',
                    chatflow
                })
            }
        }
    }, [chatflow, title, chatflowConfigurationDialogOpen])

    const StyledLink = styled(Link)(({ theme }) => ({
        color: customization?.isDarkMode ? '#fff' : '#000',
        fontSize: '0.87rem', // Adjust font size as needed
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        textDecoration: 'none',

        '&:hover': {
            color: customization?.isDarkMode ? '#e22a90' : '#3c5ba4'
        }
    }))

    const userId = localStorage.getItem('userId')

    const handleUrlChange = () => {
        window.history.state?.idx > 0 ? navigate(-1) : navigate('/workflows', { replace: true })
    }

    return (
        <>
            <img src={ColorfulLogo} alt='THub_Logo' width={35} />
            <Box>
                <ButtonBase title='Back' sx={{ borderRadius: '20%', marginLeft: customization.menu_open ? '198px' : '37px' }}>
                    <Avatar
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
                                background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                                // color: theme.palette.canvasHeader.settingsLight
                                color: '#fff'
                            }
                        }}
                        onClick={handleUrlChange}
                    >
                        <IconChevronLeft stroke={1.5} size='1.3rem' />
                    </Avatar>
                </ButtonBase>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
                {!isEditingFlowName && (
                    <Stack flexDirection='row'>
                        <Typography
                            sx={{
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                mx: 2
                            }}
                        >
                            {canvas.isDirty && <strong style={{ color: theme.palette.orange.main }}>*</strong>} {flowName}
                        </Typography>
                        {chatflow?.id && (
                            <ButtonBase title='Edit Name' sx={{ borderRadius: '20%' }}>
                                <Avatar
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
                                            background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                                            // color: theme.palette.canvasHeader.settingsLight
                                            color: '#fff'
                                        }
                                    }}
                                    onClick={() => setEditingFlowName(true)}
                                >
                                    <Edit />
                                    {/* <EditPencil stroke={1.5} size='1.3rem' /> */}
                                </Avatar>
                            </ButtonBase>
                        )}
                    </Stack>
                )}

                {isEditingFlowName && (
                    <Stack flexDirection='row'>
                        <TextField
                            size='small'
                            inputRef={flowNameRef}
                            sx={{
                                width: '50%',
                                ml: 2
                            }}
                            defaultValue={flowName}
                        />

                        <ButtonBase title='Save Name' sx={{ borderRadius: '50%' }}>
                            <Avatar
                                variant='rounded'
                                sx={{
                                    ...theme.typography.commonAvatar,
                                    ...theme.typography.mediumAvatar,
                                    transition: 'all .2s ease-in-out',
                                    // background: theme.palette.success.light,
                                    background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                    // color: theme.palette.success.dark,
                                    color: '#fff',
                                    ml: 1,
                                    '&:hover': {
                                        // background: theme.palette.success.dark,
                                        background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                                        //  color: theme.palette.success.light
                                        color: '#fff'
                                    }
                                }}
                                color='inherit'
                                onClick={submitFlowName}
                            >
                                <IconCheck stroke={1.5} size='1.3rem' />
                            </Avatar>
                        </ButtonBase>
                        <ButtonBase title='Cancel' sx={{ borderRadius: '50%' }}>
                            <Avatar
                                variant='rounded'
                                sx={{
                                    ...theme.typography.commonAvatar,
                                    ...theme.typography.mediumAvatar,
                                    transition: 'all .2s ease-in-out',
                                    // background: theme.palette.error.light,
                                    background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                    // color: theme.palette.error.dark,
                                    color: '#fff',
                                    ml: 1,
                                    '&:hover': {
                                        // background: theme.palette.error.dark,
                                        background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                                        // color: theme.palette.error.light
                                        color: '#fff'
                                    }
                                }}
                                color='inherit'
                                onClick={() => setEditingFlowName(false)}
                            >
                                <IconX stroke={1.5} size='1.3rem' />
                            </Avatar>
                        </ButtonBase>
                    </Stack>
                )}
            </Box>
            {/* NAVIGATION */}
            <IconButton onClick={changeDarkMode}>
                <img
                    src={isDark ? toggle_1 : toggle_2}
                    alt={isDark ? 'dark' : 'light'}
                    style={{ width: isDark ? '30px' : '27px', marginRight: '5px' }}
                />
            </IconButton>

            <Box>
                <ButtonBase>
                    <VectorStorePopUp chatflowid={chatflowId} isUpsertButtonEnabled={isUpsertButtonEnabled} />
                </ButtonBase>
                <ButtonBase title='Save Workspace' sx={{ borderRadius: '50%', mr: 2 }}>
                    <Avatar
                        variant='rounded'
                        sx={{
                            ...theme.typography.commonAvatar,
                            ...theme.typography.mediumAvatar,
                            transition: 'all .2s ease-in-out',
                            // background: theme.palette.canvasHeader.saveLight,
                            background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                            // color: theme.palette.canvasHeader.saveDark,
                            color: '#fff',
                            '&:hover': {
                                // background: theme.palette.canvasHeader.saveDark,
                                background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                                // color: theme.palette.canvasHeader.saveLight
                                color: '#fff'
                            }
                        }}
                        color='inherit'
                        onClick={onSaveChatflowClick}
                    >
                        <IconDeviceFloppy stroke={1.5} size='1.3rem' />
                    </Avatar>
                </ButtonBase>

                <ButtonBase>
                    <div title='Navbar'>
                        <IconButton
                            style={{ marginLeft: '-15px' }}
                            id='demo-positioned-button'
                            aria-controls={open ? 'demo-positioned-menu' : undefined}
                            aria-haspopup='true'
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                        >
                            <Avatar
                                variant='rounded'
                                sx={{
                                    ...theme.typography.commonAvatar,
                                    ...theme.typography.mediumAvatar,
                                    transition: 'all .2s ease-in-out',
                                    background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                    color: '#fff',
                                    '&:hover': {
                                        background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                                        color: '#fff'
                                    }
                                }}
                            >
                                <ListIcon stroke={1.5} size='1.3rem' style={{ background: 'transparent' }} />
                            </Avatar>
                        </IconButton>

                        <Menu
                            style={{ marginTop: '60px', marginLeft: '15px', height: '260px' }}
                            id='demo-positioned-menu'
                            aria-labelledby='demo-positioned-button'
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left'
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left'
                            }}
                            sx={{
                                '& .MuiPaper-root': {
                                    position: 'relative',
                                    top: '65px',
                                    width: '220px',
                                    fontSize: '0.875rem',
                                    padding: '30px',
                                    overflow: 'hidden',
                                    // background: customization.isDarkMode ? '#23262C' : '#FFF',
                                    height: 'auto',
                                    fontFamily: 'roboto sans-serif',
                                    maxHeight: 'calc(-235px + 100vh)',
                                    marginBottom: '16px'
                                }
                            }}
                        >
                            {[
                                {
                                    icon: (color) => <AppsOutlinedIcon color={color} />,
                                    text: 'AI Workspace',
                                    href: '/workflows'
                                },
                                {
                                    icon: (color) => <DynamicFeedOutlinedIcon color={color} />,
                                    text: 'Templates',
                                    href: '/templates'
                                },
                                {
                                    icon: (color) => <ConstructionOutlinedIcon color={color} />,
                                    text: 'Tools',
                                    href: '/tools'
                                },
                                {
                                    icon: (color) => <SmartToyOutlinedIcon color={color} />,
                                    text: 'Assistants',
                                    href: '/assistants'
                                },
                                {
                                    icon: (color) => <HttpsOutlinedIcon color={color} />,
                                    text: 'Credentials',
                                    href: '/credentials'
                                },
                                {
                                    icon: (color) => <IconMathIntegral color={color} />,
                                    text: 'Variables',
                                    href: '/variables'
                                },
                                {
                                    icon: (color) => <VpnKeyOutlinedIcon color={color} />,
                                    text: 'API Keys',
                                    href: '/apikey'
                                }
                            ].map((item, index) => {
                                const isHovered = hoveredIndex === index
                                const iconColor = isHovered ? hoverColor : baseColor
                                const textColor = isHovered ? hoverColor : customization?.isDarkMode ? '#fff' : '#616161'
                                return (
                                    <MenuItem
                                        key={index}
                                        onClick={handleClose}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {item.icon(iconColor)}
                                        <a
                                            href={item.href}
                                            style={{
                                                textDecoration: 'none',
                                                marginLeft: '14px',
                                                lineHeight: '3em',
                                                color: textColor
                                            }}
                                        >
                                            {item.text}
                                        </a>
                                    </MenuItem>
                                )
                            })}
                        </Menu>
                    </div>
                </ButtonBase>

                <ButtonBase ref={settingsRef} title='Menu' sx={{ borderRadius: '50%' }}>
                    <Avatar
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
                                background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                                // color: theme.palette.canvasHeader.settingsLight
                                color: '#fff'
                            }
                        }}
                        onClick={() => setSettingsOpen(!isSettingsOpen)}
                    >
                        <MenuIcon stroke={1.5} size='1.3rem' style={{ background: 'transparent' }} />
                    </Avatar>
                </ButtonBase>
            </Box>
            <Settings
                chatflow={chatflow}
                isSettingsOpen={isSettingsOpen}
                anchorEl={settingsRef.current}
                onClose={() => setSettingsOpen(false)}
                onSettingsItemClick={onSettingsItemClick}
                onUploadFile={onUploadFile}
                isAgentCanvas={isAgentCanvas}
            />
            <SaveChatflowDialog
                show={flowDialogOpen}
                dialogProps={{
                    title: `Save New Workspace`,
                    confirmButtonName: 'Save',
                    cancelButtonName: 'Cancel'
                }}
                onCancel={() => setFlowDialogOpen(false)}
                onConfirm={onConfirmSaveName}
            />
            <APICodeDialog show={apiDialogOpen} dialogProps={apiDialogProps} onCancel={() => setAPIDialogOpen(false)} />
            <ViewMessagesDialog
                show={viewMessagesDialogOpen}
                dialogProps={viewMessagesDialogProps}
                onCancel={() => setViewMessagesDialogOpen(false)}
            />
            <ViewLeadsDialog show={viewLeadsDialogOpen} dialogProps={viewLeadsDialogProps} onCancel={() => setViewLeadsDialogOpen(false)} />
            {exportAsTemplateDialogOpen && (
                <ExportAsTemplateDialog
                    show={exportAsTemplateDialogOpen}
                    dialogProps={exportAsTemplateDialogProps}
                    onCancel={() => setExportAsTemplateDialogOpen(false)}
                />
            )}
            <UpsertHistoryDialog
                show={upsertHistoryDialogOpen}
                dialogProps={upsertHistoryDialogProps}
                onCancel={() => setUpsertHistoryDialogOpen(false)}
            />
            <ChatflowConfigurationDialog
                key='chatflowConfiguration'
                show={chatflowConfigurationDialogOpen}
                dialogProps={chatflowConfigurationDialogProps}
                onCancel={() => setChatflowConfigurationDialogOpen(false)}
            />
        </>
    )
}

CanvasHeader.propTypes = {
    chatflow: PropTypes.object,
    handleSaveFlow: PropTypes.func,
    handleDeleteFlow: PropTypes.func,
    handleLoadFlow: PropTypes.func,
    isAgentCanvas: PropTypes.bool
}

export default CanvasHeader
