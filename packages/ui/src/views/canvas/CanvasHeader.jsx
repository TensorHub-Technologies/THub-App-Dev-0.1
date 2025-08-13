import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef, useState } from 'react'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, Typography, Stack, TextField, Button, Menu, MenuItem } from '@mui/material'

// icons
import { IconSettings, IconChevronLeft, IconDeviceFloppy, IconPencil, IconCheck, IconX, IconCode } from '@tabler/icons-react'

// project imports
import Settings from '@/views/settings'
import SaveChatflowDialog from '@/ui-component/dialog/SaveChatflowDialog'
import APICodeDialog from '@/views/chatflows/APICodeDialog'
import ViewMessagesDialog from '@/ui-component/dialog/ViewMessagesDialog'
import ChatflowConfigurationDialog from '@/ui-component/dialog/ChatflowConfigurationDialog'
import UpsertHistoryDialog from '@/views/vectorstore/UpsertHistoryDialog'
import ViewLeadsDialog from '@/ui-component/dialog/ViewLeadsDialog'
import ExportAsTemplateDialog from '@/ui-component/dialog/ExportAsTemplateDialog'
import ListIcon from '@mui/icons-material/List'
import PerfectScrollbar from 'react-perfect-scrollbar'

import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined'
import DynamicFeedOutlinedIcon from '@mui/icons-material/DynamicFeedOutlined'
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined'
import { IconMathIntegral } from '@tabler/icons-react'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'

// API
import chatflowsApi from '@/api/chatflows'

// Hooks
import useApi from '@/hooks/useApi'

// utils
import { generateExportFlowData } from '@/utils/genericHelper'
import { uiBaseURL } from '@/store/constant'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction, SET_CHATFLOW, SET_DARKMODE } from '@/store/actions'
import VectorStorePopUp from '../vectorstore/VectorStorePopUp'
import toggle_1 from '@/assets/images/toggle_mode-1.svg'
import toggle_2 from '@/assets/images/toggle_mode-2.svg'
import ColorfulLogo from '@/assets/images/THub_icon_colorful_logo.png'
import { IconUsersGroup } from '@tabler/icons-react'
import { IconListCheck } from '@tabler/icons-react'
import { StyledFab } from '@/ui-component/button/StyledFab'

// ==============================|| CANVAS HEADER ||============================== //

const CanvasHeader = ({
    chatflow,
    isAgentCanvas,
    isAgentflowV2,
    handleSaveFlow,
    handleDeleteFlow,
    handleLoadFlow,
    isUpsertButtonEnabled
}) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const flowNameRef = useRef()
    const settingsRef = useRef()

    const customization = useSelector((state) => state.customization)

    const [isEditingFlowName, setEditingFlowName] = useState(null)
    const [flowName, setFlowName] = useState('')
    const [isSettingsOpen, setSettingsOpen] = useState(false)
    const [flowDialogOpen, setFlowDialogOpen] = useState(false)
    const [apiDialogOpen, setAPIDialogOpen] = useState(false)
    const [apiDialogProps, setAPIDialogProps] = useState({})
    const [viewMessagesDialogOpen, setViewMessagesDialogOpen] = useState(false)
    const [viewMessagesDialogProps, setViewMessagesDialogProps] = useState({})
    const [viewLeadsDialogOpen, setViewLeadsDialogOpen] = useState(false)
    const [viewLeadsDialogProps, setViewLeadsDialogProps] = useState({})
    const [upsertHistoryDialogOpen, setUpsertHistoryDialogOpen] = useState(false)
    const [upsertHistoryDialogProps, setUpsertHistoryDialogProps] = useState({})
    const [chatflowConfigurationDialogOpen, setChatflowConfigurationDialogOpen] = useState(false)
    const [chatflowConfigurationDialogProps, setChatflowConfigurationDialogProps] = useState({})
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)

    const [exportAsTemplateDialogOpen, setExportAsTemplateDialogOpen] = useState(false)
    const [exportAsTemplateDialogProps, setExportAsTemplateDialogProps] = useState({})
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const title = isAgentCanvas ? 'Agents' : 'Workflow'

    const updateChatflowApi = useApi(chatflowsApi.updateChatflow)
    const canvas = useSelector((state) => state.canvas)

    const changeDarkMode = () => {
        const newTheme = !customization.isDarkMode
        dispatch({ type: SET_DARKMODE, isDarkMode: newTheme })
        localStorage.setItem('isDarkMode', newTheme)
        const url = new URL(window.location.href)
        url.searchParams.set('theme', newTheme ? 'dark' : 'dark')
        window.history.replaceState({}, '', url)
    }

    // navigation
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

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
        } else if (setting === 'viewLeads') {
            setViewLeadsDialogProps({
                title: 'View Leads',
                chatflow: chatflow
            })
            setViewLeadsDialogOpen(true)
        } else if (setting === 'saveAsTemplate') {
            if (canvas.isDirty) {
                enqueueSnackbar({
                    message: 'Please save the flow before exporting as template',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'error',
                        persist: true,
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                return
            }
            setExportAsTemplateDialogProps({
                title: 'Export As Template',
                chatflow: chatflow
            })
            setExportAsTemplateDialogOpen(true)
        } else if (setting === 'viewUpsertHistory') {
            setUpsertHistoryDialogProps({
                title: 'View Upsert History',
                chatflow: chatflow
            })
            setUpsertHistoryDialogOpen(true)
        } else if (setting === 'chatflowConfiguration') {
            setChatflowConfigurationDialogProps({
                title: `${title} Configuration`,
                chatflow: chatflow
            })
            setChatflowConfigurationDialogOpen(true)
        } else if (setting === 'duplicateChatflow') {
            try {
                let flowData = chatflow.flowData
                const parsedFlowData = JSON.parse(flowData)
                flowData = JSON.stringify(parsedFlowData)
                localStorage.setItem('duplicatedFlowData', flowData)
                if (isAgentflowV2) {
                    window.open(`${uiBaseURL}/v2/agentcanvas`, '_blank')
                } else if (isAgentCanvas) {
                    window.open(`${uiBaseURL}/agentcanvas`, '_blank')
                } else {
                    window.open(`${uiBaseURL}/canvas`, '_blank')
                }
            } catch (e) {
                console.error(e)
            }
        } else if (setting === 'exportChatflow') {
            try {
                const flowData = JSON.parse(chatflow.flowData)
                let dataStr = JSON.stringify(generateExportFlowData(flowData), null, 2)
                const blob = new Blob([dataStr], { type: 'application/json' })
                const dataUri = URL.createObjectURL(blob)

                let exportFileDefaultName = `${chatflow.name} ${title}.json`

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
        console.log('description', chatflowDescription)
    }

    useEffect(() => {
        if (updateChatflowApi.data) {
            setFlowName(updateChatflowApi.data.name)
            dispatch({ type: SET_CHATFLOW, chatflow: updateChatflowApi.data })
        }
        setEditingFlowName(false)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateChatflowApi.data])

    useEffect(() => {
        if (chatflow) {
            setFlowName(chatflow.name)
            // if configuration dialog is open, update its data
            if (chatflowConfigurationDialogOpen) {
                setChatflowConfigurationDialogProps({
                    title: `${title} Configuration`,
                    chatflow
                })
            }
        }
    }, [chatflow, title, chatflowConfigurationDialogOpen])

    return (
        <>
            <Stack flexDirection='row' justifyContent='space-between' alignItems='center' sx={{ width: '100%' }}>
                {/* Left Section */}
                <Stack flexDirection='row' alignItems='center' sx={{ minWidth: 0, flex: 1, maxWidth: '60%' }}>
                    <button
                        type='button'
                        style={{
                            marginLeft: '-8px',
                            marginTop: '4px',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                        onClick={() => {
                            navigate('/workflows')
                        }}
                    >
                        <img src={ColorfulLogo} alt='THub_Logo' width={35} />
                    </button>

                    <StyledFab
                        aria-label='back'
                        title='Back'
                        style={{ marginLeft: '14px', marginRight: '6px' }}
                        onClick={() => {
                            if (window.history.state && window.history.state.idx > 0) {
                                navigate(-1)
                            } else {
                                navigate(-1, { replace: true })
                            }
                        }}
                    >
                        <IconChevronLeft />
                    </StyledFab>
                    {/* Flow Name Section */}
                    <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center' }}>
                        {!isEditingFlowName ? (
                            <Stack flexDirection='row' alignItems='center' sx={{ minWidth: 0, width: '100%' }}>
                                <Typography
                                    sx={{
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        minWidth: 0,
                                        maxWidth: 'calc(100% - 60px)' // Reserve space for edit button
                                    }}
                                    title={flowName} // Show full name on hover
                                >
                                    {canvas.isDirty && <strong style={{ color: theme.palette.orange.main }}>*</strong>} {flowName}
                                </Typography>
                                {chatflow?.id && (
                                    <StyledFab
                                        aria-label='editname'
                                        title='Edit Name'
                                        sx={{ flexShrink: 0, ml: 2 }}
                                        onClick={() => setEditingFlowName(true)}
                                    >
                                        <IconPencil />
                                    </StyledFab>
                                )}
                            </Stack>
                        ) : (
                            <Stack flexDirection='row' alignItems='center' sx={{ width: '100%', minWidth: 0 }}>
                                <TextField
                                    //eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                    size='small'
                                    inputRef={flowNameRef}
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        maxWidth: 'calc(100% - 100px)' // Reserve space for buttons
                                    }}
                                    defaultValue={flowName}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            submitFlowName()
                                        } else if (e.key === 'Escape') {
                                            setEditingFlowName(false)
                                        }
                                    }}
                                />

                                <StyledFab aria-label='savename' title='Save Name' sx={{ flexShrink: 0, ml: 1 }} onClick={submitFlowName}>
                                    <IconCheck />
                                </StyledFab>

                                <StyledFab
                                    aria-label='cancel'
                                    title='Cancel'
                                    sx={{ flexShrink: 0, ml: 1 }}
                                    onClick={() => setEditingFlowName(false)}
                                >
                                    <IconX />
                                </StyledFab>
                            </Stack>
                        )}
                    </Box>
                </Stack>

                {/* Right Section - Action Buttons */}
                <Stack flexDirection='row' alignItems='center' gap={2} sx={{ flexShrink: 0 }}>
                    <StyledFab aria-label='mode' title='Theme' onClick={changeDarkMode}>
                        <img
                            src={customization.isDarkMode ? toggle_1 : toggle_2}
                            style={{ width: '24px', height: '24px' }}
                            alt={customization.isDarkMode ? 'dark' : 'lite'}
                        />
                    </StyledFab>

                    <StyledFab>
                        <VectorStorePopUp chatflowid={chatflow?.id} isUpsertButtonEnabled={isUpsertButtonEnabled} />
                    </StyledFab>

                    {chatflow?.id && (
                        <StyledFab aria-label='apiendpoint' title='API Endpoint' onClick={onAPIDialogClick}>
                            <IconCode />
                        </StyledFab>
                    )}

                    <StyledFab aria-label={`Save ${title}`} title={`Save ${title}`} onClick={onSaveChatflowClick}>
                        <IconDeviceFloppy />
                    </StyledFab>

                    <StyledFab title='Navbar'>
                        <Avatar
                            sx={{
                                color: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                background: 'transparent'
                            }}
                            onClick={handleClick}
                        >
                            <ListIcon style={{ color: customization.isDarkMode ? '#E22A90' : '#3C5BA4', background: 'transparent' }} />
                        </Avatar>

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
                                    padding: '0',
                                    overflow: 'hidden',
                                    height: 'auto',
                                    fontFamily: 'roboto sans-serif',
                                    maxHeight: 'calc(-235px + 100vh)',
                                    marginBottom: '16px',
                                    background: customization.isDarkMode
                                        ? 'radial-gradient(circle at top left, black 0%, rgb(28, 43, 77) 50%, rgb(28, 43, 77) 72%, rgb(60, 91, 164) 100%), radial-gradient(circle at top left, rgb(255, 255, 255) 0%, rgb(242, 242, 242) 17%, rgba(186, 198, 225, 1) 67%, rgba(186, 198, 225, 1) 100%)'
                                        : 'radial-gradient(circle at top left, rgb(255, 255, 255) 0%, rgb(242, 242, 242) 17%, rgba(186, 198, 225, 1) 67%, rgba(186, 198, 225, 1) 100%)'
                                },
                                '& .ps__rail-x': {
                                    display: 'none !important'
                                }
                            }}
                        >
                            <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 250px)', overflowX: 'hidden' }}>
                                <div style={{ padding: '30px' }}>
                                    {' '}
                                    {/* Move padding here */}
                                    {[
                                        { icon: <AppsOutlinedIcon />, text: 'AI Workspace', href: '/workflows' },
                                        { icon: <IconUsersGroup />, text: 'Agent Studio', href: '/agentflows' },
                                        { icon: <IconListCheck />, text: 'Executions', href: '/executions' },
                                        { icon: <DynamicFeedOutlinedIcon />, text: 'Templates', href: '/templates' },
                                        { icon: <ConstructionOutlinedIcon />, text: 'Tools', href: '/tools' },
                                        { icon: <SmartToyOutlinedIcon />, text: 'Assistants', href: '/assistants' },
                                        { icon: <HttpsOutlinedIcon />, text: 'Credentials', href: '/credentials' },
                                        { icon: <IconMathIntegral />, text: 'Variables', href: '/variables' },
                                        { icon: <VpnKeyOutlinedIcon />, text: 'API Keys', href: '/apikey' }
                                    ].map((item, index) => (
                                        <MenuItem
                                            key={index}
                                            onClick={handleClose}
                                            sx={{
                                                color: customization.isDarkMode ? 'white' : 'black',
                                                lineHeight: '3em',
                                                backgroundColor: 'transparent',
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                                    '& .MuiSvgIcon-root': {
                                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                    }
                                                }
                                            }}
                                        >
                                            {item.icon}
                                            <a
                                                href={item.href}
                                                style={{
                                                    color: customization.isDarkMode ? 'white' : 'black',
                                                    textDecoration: 'none',
                                                    marginLeft: '13px',
                                                    lineHeight: '3em',
                                                    transition: 'color 0.3s ease'
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.target.style.color = customization.isDarkMode ? '#e22a90' : '#3c5ba4')
                                                }
                                                onMouseLeave={(e) => (e.target.style.color = customization.isDarkMode ? '#fff' : '#000')}
                                            >
                                                {item.text}
                                            </a>
                                        </MenuItem>
                                    ))}
                                </div>
                            </PerfectScrollbar>
                        </Menu>
                    </StyledFab>

                    <StyledFab ref={settingsRef} aria-label='settings' title='Settings' onClick={() => setSettingsOpen(!isSettingsOpen)}>
                        <IconSettings />
                    </StyledFab>
                </Stack>
            </Stack>

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
                    title: `Save New ${title}`,
                    confirmButtonName: 'Save',
                    cancelButtonName: 'Cancel'
                }}
                onCancel={() => setFlowDialogOpen(false)}
                onConfirm={onConfirmSaveName}
            />
            {apiDialogOpen && <APICodeDialog show={apiDialogOpen} dialogProps={apiDialogProps} onCancel={() => setAPIDialogOpen(false)} />}
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
                isAgentCanvas={isAgentCanvas}
            />
        </>
    )
}

CanvasHeader.propTypes = {
    chatflow: PropTypes.object,
    handleSaveFlow: PropTypes.func,
    handleDeleteFlow: PropTypes.func,
    handleLoadFlow: PropTypes.func,
    isAgentCanvas: PropTypes.bool,
    isAgentflowV2: PropTypes.bool,
    isUpsertButtonEnabled: PropTypes.bool
}

export default CanvasHeader
