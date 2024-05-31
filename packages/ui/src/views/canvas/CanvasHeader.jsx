import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef, useState } from 'react'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, ButtonBase, Typography, Stack, TextField } from '@mui/material'

// icons
import { IconSettings, IconChevronLeft, IconDeviceFloppy, IconPencil, IconCheck, IconX, IconCode } from '@tabler/icons'

import { VectorStorePopUp } from '@/views/vectorstore/VectorStorePopUp'

//Logo
// import logo from '@/assets/images/THub_logo_dark.png'
import logo from '@/assets/images/THub_Logo_resize.png'
import ColorfulLogo from '@/assets/images/THub_icon_colorful_logo.png'

// project imports
import Settings from '@/views/settings'
import SaveChatflowDialog from '@/ui-component/dialog/SaveChatflowDialog'
import APICodeDialog from '@/views/chatflows/APICodeDialog'
import ViewMessagesDialog from '@/ui-component/dialog/ViewMessagesDialog'
import ChatflowConfigurationDialog from '@/ui-component/dialog/ChatflowConfigurationDialog'

// API
import chatflowsApi from '@/api/chatflows'

// Hooks
import useApi from '@/hooks/useApi'

// utils
import { generateExportFlowData, getUpsertDetails } from '@/utils/genericHelper'
import { uiBaseURL } from '@/store/constant'
import { SET_CHATFLOW } from '@/store/actions'

// ==============================|| CANVAS HEADER ||============================== //

const CanvasHeader = ({ chatflow, handleSaveFlow, handleDeleteFlow, handleLoadFlow }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const flowNameRef = useRef()
    const settingsRef = useRef()
    console.log('customization', customization)
    const [isEditingFlowName, setEditingFlowName] = useState(null)
    const [flowName, setFlowName] = useState('')
    const [isSettingsOpen, setSettingsOpen] = useState(false)
    const [flowDialogOpen, setFlowDialogOpen] = useState(false)
    const [apiDialogOpen, setAPIDialogOpen] = useState(false)
    const [apiDialogProps, setAPIDialogProps] = useState({})
    const [viewMessagesDialogOpen, setViewMessagesDialogOpen] = useState(false)
    const [viewMessagesDialogProps, setViewMessagesDialogProps] = useState({})
    const [chatflowConfigurationDialogOpen, setChatflowConfigurationDialogOpen] = useState(false)
    const [chatflowConfigurationDialogProps, setChatflowConfigurationDialogProps] = useState({})

    const updateChatflowApi = useApi(chatflowsApi.updateChatflow)
    const canvas = useSelector((state) => state.canvas)
    const [canvasDataStore, setCanvasDataStore] = useState(canvas)
    const [isUpsertButtonEnabled, setIsUpsertButtonEnabled] = useState(false)

    const URLpath = document.location.pathname.toString().split('/')
    const chatflowId = URLpath[URLpath.length - 1] === 'canvas' ? '' : URLpath[URLpath.length - 1]

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
        } else if (setting === 'chatflowConfiguration') {
            setChatflowConfigurationDialogProps({
                title: 'Workflow Configuration',
                chatflow: chatflow
            })
            setChatflowConfigurationDialogOpen(true)
        } else if (setting === 'duplicateChatflow') {
            try {
                let flowData = chatflow.flowData
                const parsedFlowData = JSON.parse(flowData)
                flowData = JSON.stringify(parsedFlowData)
                localStorage.setItem('duplicatedFlowData', flowData)
                window.open(`${uiBaseURL}/${isAgentCanvas ? 'agentcanvas' : 'canvas'}`, '_blank')
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
            isSessionMemory
        })
        setAPIDialogOpen(true)
    }

    const onSaveChatflowClick = () => {
        if (chatflow.id) handleSaveFlow(flowName)
        else setFlowDialogOpen(true)
    }

    const onConfirmSaveName = (flowName) => {
        setFlowDialogOpen(false)
        handleSaveFlow(flowName)
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
                    title: 'Workflow Configuration',
                    chatflow
                })
            }
        }
    }, [chatflow, chatflowConfigurationDialogOpen])

    return (
        <>
            {/* <Box sx={{ mr: 2 }}>
                <ButtonBase title='Toggle' sx={{ borderRadius: '20%' }} onClick={()=>dispatch({ type: SHOW_MENU})}>
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
                    >
                        <IconMenu2 stroke={1.5} size='1.3rem' />
                    </Avatar>
                </ButtonBase>
            </Box> */}

            {/* <img src={ColorfulLogo} alt='THub_Logo' width={30} style={{  marginRight: customization.menu_open ? '190px' : '46px'}} />

            {customization.menu_open ? (
                <img src={logo} alt='THub_Logo' width={80} height={30} style={{ marginLeft: "6px" ,marginRight:"16px"}} />
            ) : (
                ""
            )} */}
            {/* <img src={ColorfulLogo} alt='THub_Logo' width={30} />

{customization.menu_open ? (
    <img src={logo} alt='THub_Logo' width={80} height={30}  />
) : (
    ""
)} */}

            {/* <img src={ColorfulLogo} alt='THub_Logo' width={customization.menu_open ? '40px' : '40px'  }/>

{customization.menu_open ? (
    <img src={newLogo} alt='THub_Logo' width={40} height={40} 
    />
) : (
    ""
)} */}

            <img src={ColorfulLogo} alt='THub_Logo' width={35} />

            {customization.menu_open ? <img src={logo} alt='THub_Logo' width={90} height={30} style={{}} /> : ''}
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
                        onClick={() =>
                            window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/', { replace: true })
                        }
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
                                    <IconPencil stroke={1.5} size='1.3rem' />
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
            <Box>
                <ButtonBase title='Vector Database' sx={{ borderRadius: '50%', mr: 2 }}>
                    {isUpsertButtonEnabled && <VectorStorePopUp chatflowid={chatflowId} />}
                </ButtonBase>
                {chatflow?.id && (
                    <ButtonBase title='API Endpoint' sx={{ borderRadius: '50%', mr: 2 }}>
                        <Avatar
                            variant='rounded'
                            sx={{
                                ...theme.typography.commonAvatar,
                                ...theme.typography.mediumAvatar,
                                transition: 'all .2s ease-in-out',
                                // background: theme.palette.canvasHeader.deployLight,
                                background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                // color: theme.palette.canvasHeader.deployDark,
                                color: '#fff',
                                '&:hover': {
                                    // background: theme.palette.canvasHeader.deployDark,
                                    background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                                    // color: theme.palette.canvasHeader.deployLight
                                    color: '#fff'
                                }
                            }}
                            color='inherit'
                            onClick={onAPIDialogClick}
                        >
                            <IconCode stroke={1.5} size='1.3rem' />
                        </Avatar>
                    </ButtonBase>
                )}
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
                <ButtonBase ref={settingsRef} title='Settings' sx={{ borderRadius: '50%' }}>
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
                        <IconSettings stroke={1.5} size='1.3rem' />
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
    handleLoadFlow: PropTypes.func
}

export default CanvasHeader
