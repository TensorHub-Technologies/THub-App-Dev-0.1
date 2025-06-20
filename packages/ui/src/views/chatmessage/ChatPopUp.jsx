import { memo, useState, useRef, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { Button, Drawer } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconMessage, IconX, IconEraser } from '@tabler/icons-react'

// project import
import { StyledFab } from '@/ui-component/button/StyledFab'
import MainCard from '@/ui-component/cards/MainCard'
import ChatMessage from './ChatMessage'

// api
import chatmessageApi from '@/api/chatmessage'

// Hooks
import useConfirm from '@/hooks/useConfirm'
import useNotifier from '@/utils/useNotifier'
import { flowContext } from '@/store/context/ReactFlowContext'

// Const
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'

// Utils
import { getLocalStorageChatflow, removeLocalStorageChatHistory } from '@/utils/genericHelper'
import robotPNG from '@/assets/images/THub_icon_colorful_logo.png'

const ChatPopUp = ({ chatflowid, isAgentCanvas, onOpenChange }) => {
    const theme = useTheme()
    const { confirm } = useConfirm()
    const dispatch = useDispatch()
    const { clearAgentflowNodeStatus } = useContext(flowContext)

    const customization = useSelector((state) => state.customization)

    useNotifier()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [open, setOpen] = useState(false)
    const [previews, setPreviews] = useState([])

    const anchorRef = useRef(null)

    const handleClose = () => {
        setOpen(false)
        if (onOpenChange) onOpenChange(false)
    }

    const handleToggle = () => {
        const newOpenState = !open
        setOpen(newOpenState)
        if (onOpenChange) onOpenChange(newOpenState)
    }

    const resetChat = () => {
        clearAgentflowNodeStatus()
        // Force re-render of ChatMessage component
        setOpen(false)
        setTimeout(() => {
            setOpen(true)
        }, 100)
    }

    const clearChat = async () => {
        const confirmPayload = {
            title: `Clear Chat History`,
            description: `Are you sure you want to clear all chat history?`,
            confirmButtonName: 'Clear',
            cancelButtonName: 'Cancel'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const objChatDetails = getLocalStorageChatflow(chatflowid)
                if (!objChatDetails.chatId) return
                await chatmessageApi.deleteChatmessage(chatflowid, { chatId: objChatDetails.chatId, chatType: 'INTERNAL' })
                removeLocalStorageChatHistory(chatflowid)
                resetChat()
                enqueueSnackbar({
                    message: 'Successfully cleared all chat history',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
            } catch (error) {
                enqueueSnackbar({
                    message: typeof error.response.data === 'object' ? error.response.data.message : error.response.data,
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

    return (
        <>
            <StyledFab
                sx={{
                    position: 'absolute',
                    right: 20,
                    top: 20,
                    bgcolor: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                    '&:hover': {
                        background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                        color: 'white'
                    }
                }}
                ref={anchorRef}
                size='small'
                aria-label='chat'
                title='Chat'
                onClick={handleToggle}
            >
                {open ? <IconX /> : <IconMessage />}
            </StyledFab>

            <Drawer
                anchor='right'
                open={open}
                onClose={handleClose}
                variant='temporary'
                sx={{
                    zIndex: 1300,
                    '& .MuiDrawer-paper': {
                        width: '50vw', // half of the screen width
                        height: '100vh',
                        top: 0,
                        right: 0,
                        position: 'fixed'
                    }
                }}
                ModalProps={{
                    keepMounted: true,
                    disablePortal: false,
                    BackdropProps: {
                        invisible: true
                    }
                }}
            >
                <div
                    style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}
                >
                    {/* Fixed Header */}
                    <div
                        style={{
                            padding: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: customization?.isDarkMode ? '#23262D' : '#ffff',
                            minHeight: '64px'
                        }}
                    >
                        <img src={robotPNG} alt='AI' width='26' height='26' style={{ marginLeft: '8px' }} />

                        <StyledFab
                            sx={{
                                position: 'absolute',
                                right: 60,
                                top: 0,
                                background: 'transparent',
                                boxShadow: '0',
                                color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                            }}
                            variant='outlined'
                            title='Erase'
                            onClick={() => {
                                clearChat()
                            }}
                        >
                            <IconEraser />
                        </StyledFab>
                        <StyledFab
                            sx={{
                                position: 'absolute',
                                right: 20,
                                top: 0,
                                background: 'transparent',
                                boxShadow: '0',
                                color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                            }}
                            variant='outlined'
                            title='Close'
                            onClick={() => handleClose()}
                        >
                            <IconX />
                        </StyledFab>
                    </div>

                    {/* Chat content */}
                    <div
                        style={{
                            flex: 1,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <MainCard
                            border={false}
                            className='cloud-wrapper'
                            elevation={0}
                            content={false}
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '& .MuiCardContent-root': {
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }
                            }}
                        >
                            <ChatMessage
                                isAgentCanvas={isAgentCanvas}
                                chatflowid={chatflowid}
                                open={open}
                                previews={previews}
                                setPreviews={setPreviews}
                                isDialog={true}
                            />
                        </MainCard>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

ChatPopUp.propTypes = {
    chatflowid: PropTypes.string,
    isAgentCanvas: PropTypes.bool,
    onOpenChange: PropTypes.func
}

export default memo(ChatPopUp)
