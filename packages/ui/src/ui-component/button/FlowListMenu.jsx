import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { styled, alpha } from '@mui/material/styles'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import EditIcon from '@mui/icons-material/Edit'
import Divider from '@mui/material/Divider'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import FileDownloadIcon from '@mui/icons-material/Downloading'
import FileDeleteIcon from '@mui/icons-material/Delete'
import FileCategoryIcon from '@mui/icons-material/Category'
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt'
import ThumbsUpDownOutlinedIcon from '@mui/icons-material/ThumbsUpDownOutlined'
import VpnLockOutlinedIcon from '@mui/icons-material/VpnLockOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import ExportTemplateOutlinedIcon from '@mui/icons-material/BookmarksOutlined'
import Button from '@mui/material/Button'
import { IconX } from '@tabler/icons'
import { IconDeviceAnalytics } from '@tabler/icons'
import { IconAdjustmentsAlt } from '@tabler/icons'

import chatflowsApi from '@/api/chatflows'

import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'
import { uiBaseURL } from '@/store/constant'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

import SaveChatflowDialog from '@/ui-component/dialog/SaveChatflowDialog'
import TagDialog from '@/ui-component/dialog/TagDialog'
import StarterPromptsDialog from '@/ui-component/dialog/StarterPromptsDialog'

import { generateExportFlowData } from '@/utils/genericHelper'
import useNotifier from '@/utils/useNotifier'
import ChatFeedbackDialog from '../dialog/ChatFeedbackDialog'
import AllowedDomainsDialog from '../dialog/AllowedDomainsDialog'
import SpeechToTextDialog from '../dialog/SpeechToTextDialog'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import { MoreHoriz } from '@mui/icons-material'
import RateLimitDailog from '../dialog/RateLimitDailog'
import AnalyseWorkflowDailog from '../dialog/AnalyseWorkflowDialog'

const useCustomization = () => {
    return useSelector((state) => state.customization)
}

const StyledMenu = styled((props) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0'
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                // color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
                color: useCustomization().isDarkMode ? '#E22A90' : '#3C5BA4',
                background: 'transparent'
            },
            '&:active': {
                backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity)
            }
        }
    }
}))

export default function FlowListMenu({ chatflow, updateFlowsApi }) {
    const { confirm } = useConfirm()
    const dispatch = useDispatch()
    const updateChatflowApi = useApi(chatflowsApi.updateChatflow)

    useNotifier()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [flowDialogOpen, setFlowDialogOpen] = useState(false)
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [categoryDialogProps, setCategoryDialogProps] = useState({})
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)
    const [conversationStartersDialogOpen, setConversationStartersDialogOpen] = useState(false)
    const [conversationStartersDialogProps, setConversationStartersDialogProps] = useState({})
    const [chatFeedbackDialogOpen, setChatFeedbackDialogOpen] = useState(false)
    const [chatFeedbackDialogProps, setChatFeedbackDialogProps] = useState({})
    const [allowedDomainsDialogOpen, setAllowedDomainsDialogOpen] = useState(false)
    const [allowedDomainsDialogProps, setAllowedDomainsDialogProps] = useState({})
    const [speechToTextDialogOpen, setSpeechToTextDialogOpen] = useState(false)
    const [rateLimitDialogOpen, setRateLimitDialogOpen] = useState(false)
    const [rateLimitDialogProps, setRateLimitDialogProps] = useState(false)

    const [AnalyseWorkFlowDialogOpen, setWorkFlowDialogOpen] = useState(false)
    const [AnalyseWorkFlowDialogProps, setWorkFlowDialogProps] = useState(false)

    const [speechToTextDialogProps, setSpeechToTextDialogProps] = useState({})

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleFlowRename = () => {
        setAnchorEl(null)
        setFlowDialogOpen(true)
    }

    const handleFlowStarterPrompts = () => {
        setAnchorEl(null)
        setConversationStartersDialogProps({
            title: 'Starter Prompts - ' + chatflow.name,
            chatflow: chatflow
        })
        setConversationStartersDialogOpen(true)
    }

    const handleFlowChatFeedback = () => {
        setAnchorEl(null)
        setChatFeedbackDialogProps({
            title: 'Chat Feedback - ' + chatflow.name,
            chatflow: chatflow
        })
        setChatFeedbackDialogOpen(true)
    }

    const handleAllowedDomains = () => {
        setAnchorEl(null)
        setAllowedDomainsDialogProps({
            title: 'Allowed Domains - ' + chatflow.name,
            chatflow: chatflow
        })
        setAllowedDomainsDialogOpen(true)
    }

    const handleSpeechToText = () => {
        setAnchorEl(null)
        setSpeechToTextDialogProps({
            title: 'Speech To Text - ' + chatflow.name,
            chatflow: chatflow
        })
        setSpeechToTextDialogOpen(true)
    }

    const handleRateLimit = () => {
        setAnchorEl(null)
        setRateLimitDialogProps({
            title: 'Rate Limiting - ' + chatflow.name,
            chatflow: chatflow
        })
        setRateLimitDialogOpen(true)
    }
    const handleAnalyse = () => {
        setAnchorEl(null)
        setWorkFlowDialogProps({
            title: 'Analyse Workflow - ' + chatflow.name,
            chatflow: chatflow
        })
        setWorkFlowDialogOpen(true)
    }

    const saveFlowRename = async (chatflowName) => {
        const updateBody = {
            name: chatflowName,
            chatflow: chatflow
        }
        try {
            await updateChatflowApi.request(chatflow.id, updateBody)
            await updateFlowsApi.request()
        } catch (error) {
            if (setError) setError(error)
            const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`
            enqueueSnackbar({
                message: errorData,
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
        }
    }

    const handleFlowCategory = () => {
        setAnchorEl(null)
        if (chatflow.category) {
            setCategoryDialogProps({
                category: chatflow.category.split(';')
            })
        }
        setCategoryDialogOpen(true)
    }

    const handleExportTemplate = () => {
        setAnchorEl(null)
        setExportTemplateDialogProps({
            chatflow: chatflow
        })
        setExportTemplateDialogOpen(true)
    }

    const saveFlowCategory = async (categories) => {
        setCategoryDialogOpen(false)
        // save categories as string
        const categoryTags = categories.join(';')
        const updateBody = {
            category: categoryTags,
            chatflow: chatflow
        }
        try {
            await updateChatflowApi.request(chatflow.id, updateBody)
            await updateFlowsApi.request()
        } catch (error) {
            if (setError) setError(error)
            const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`
            enqueueSnackbar({
                message: errorData,
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
        }
    }

    const handleDelete = async () => {
        setAnchorEl(null)
        const confirmPayload = {
            title: `Delete`,
            description: `Delete Workspace ${chatflow.name}?`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                await chatflowsApi.deleteChatflow(chatflow.id)
                await updateFlowsApi.request()
                window.location.reload()
            } catch (error) {
                if (setError) setError(error)
                const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`
                enqueueSnackbar({
                    message: errorData,
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
            }
        }
    }

    const handleDuplicate = () => {
        setAnchorEl(null)
        try {
            localStorage.setItem('duplicatedFlowData', chatflow.flowData)
            window.open(`${uiBaseURL}/canvas`, '_self')
        } catch (e) {
            console.error(e)
        }
    }

    const handleExport = () => {
        setAnchorEl(null)
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
    const customization = useSelector((state) => state.customization)
    return (
        <div>
            {localStorage.getItem('flowDisplayStyle') === 'list' ? (
                <IconButton
                    id='demo-customized-button'
                    aria-controls={open ? 'demo-customized-menu' : undefined}
                    aria-haspopup='true'
                    aria-expanded={open ? 'true' : undefined}
                    disableElevation
                    onClick={handleClick}
                >
                    <MoreHoriz sx={{ p: 0, background: 'transparent' }} />
                </IconButton>
            ) : (
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 5,
                        zIndex: 1
                    }}
                    id='demo-customized-button'
                    aria-controls={open ? 'demo-customized-menu' : undefined}
                    aria-haspopup='true'
                    aria-expanded={open ? 'true' : undefined}
                    disableElevation
                    onClick={handleClick}
                >
                    <MoreVertIcon sx={{ p: 0, background: 'transparent' }} />
                </IconButton>
            )}

            <StyledMenu
                id='demo-customized-menu'
                MenuListProps={{
                    'aria-labelledby': 'demo-customized-button'
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleFlowRename} disableRipple>
                    <EditIcon />
                    Rename
                </MenuItem>
                <MenuItem onClick={handleDuplicate} disableRipple>
                    <FileCopyIcon />
                    Duplicate
                </MenuItem>
                <MenuItem onClick={handleExport} disableRipple>
                    <FileDownloadIcon />
                    Export
                </MenuItem>
                <MenuItem onClick={handleExportTemplate} disableRipple>
                    <ExportTemplateOutlinedIcon />
                    Save As Template1
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleRateLimit} disableRipple>
                    <IconAdjustmentsAlt
                        style={{ width: '20px', marginRight: '10px', color: customization.isDarkMode ? '#e22a90' : '#3c5ba4' }}
                    />
                    Rate Limiting
                </MenuItem>

                <MenuItem onClick={handleFlowStarterPrompts} disableRipple>
                    <PictureInPictureAltIcon />
                    Starter Prompts
                </MenuItem>
                <MenuItem onClick={handleFlowChatFeedback} disableRipple>
                    <ThumbsUpDownOutlinedIcon />
                    Chat Feedback
                </MenuItem>
                <MenuItem onClick={handleAllowedDomains} disableRipple>
                    <VpnLockOutlinedIcon />
                    Allowed Domains
                </MenuItem>
                <MenuItem onClick={handleSpeechToText} disableRipple>
                    <MicNoneOutlinedIcon />
                    Speech To Text
                </MenuItem>
                <MenuItem onClick={handleAnalyse} disableRipple>
                    <IconDeviceAnalytics
                        style={{ width: '20px', marginRight: '10px', color: customization.isDarkMode ? '#e22a90' : '#3c5ba4' }}
                    />
                    Analyse WorkFlow
                </MenuItem>
                <MenuItem onClick={handleFlowCategory} disableRipple>
                    <FileCategoryIcon />
                    Update Category
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleDelete} disableRipple>
                    <FileDeleteIcon />
                    Delete
                </MenuItem>
            </StyledMenu>
            <SaveChatflowDialog
                show={flowDialogOpen}
                dialogProps={{
                    title: `Rename Workflow`,
                    confirmButtonName: 'Rename',
                    cancelButtonName: 'Cancel'
                }}
                onCancel={() => setFlowDialogOpen(false)}
                onConfirm={saveFlowRename}
            />
            <TagDialog
                isOpen={categoryDialogOpen}
                dialogProps={categoryDialogProps}
                onClose={() => setCategoryDialogOpen(false)}
                onSubmit={saveFlowCategory}
            />
            <StarterPromptsDialog
                show={conversationStartersDialogOpen}
                dialogProps={conversationStartersDialogProps}
                onCancel={() => setConversationStartersDialogOpen(false)}
            />
            <ChatFeedbackDialog
                show={chatFeedbackDialogOpen}
                dialogProps={chatFeedbackDialogProps}
                onCancel={() => setChatFeedbackDialogOpen(false)}
            />
            <AllowedDomainsDialog
                show={allowedDomainsDialogOpen}
                dialogProps={allowedDomainsDialogProps}
                onCancel={() => setAllowedDomainsDialogOpen(false)}
            />
            <SpeechToTextDialog
                show={speechToTextDialogOpen}
                dialogProps={speechToTextDialogProps}
                onCancel={() => setSpeechToTextDialogOpen(false)}
            />
            <RateLimitDailog show={rateLimitDialogOpen} dialogProps={rateLimitDialogProps} onCancel={() => setRateLimitDialogOpen(false)} />
            <AnalyseWorkflowDailog
                show={AnalyseWorkFlowDialogOpen}
                dialogProps={AnalyseWorkFlowDialogProps}
                onCancel={() => setWorkFlowDialogOpen(false)}
            />
        </div>
    )
}

FlowListMenu.propTypes = {
    chatflow: PropTypes.object,
    updateFlowsApi: PropTypes.object,
    setError: PropTypes.func
}
