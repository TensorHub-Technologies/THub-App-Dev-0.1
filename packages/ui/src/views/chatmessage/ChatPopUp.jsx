import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { ClickAwayListener, Paper, Popper, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconMessage, IconX, IconEraser, IconArrowsMaximize } from '@tabler/icons'

// project import
import { StyledFab } from '@/ui-component/button/StyledFab'
import MainCard from '@/ui-component/cards/MainCard'
import Transitions from '@/ui-component/extended/Transitions'
import { ChatMessage } from './ChatMessage'
import ChatExpandDialog from './ChatExpandDialog'

// api
import chatmessageApi from '@/api/chatmessage'

// Hooks
import useConfirm from '@/hooks/useConfirm'
import useNotifier from '@/utils/useNotifier'

// Const
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'

// Utils
import { getLocalStorageChatflow, removeLocalStorageChatHistory } from '@/utils/genericHelper'

export const ChatPopUp = ({ chatflowid, isAgentCanvas }) => {
    const theme = useTheme()
    const { confirm } = useConfirm()
    const dispatch = useDispatch()

    useNotifier()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [open, setOpen] = useState(false)
    const [showExpandDialog, setShowExpandDialog] = useState(false)
    const [expandDialogProps, setExpandDialogProps] = useState({})
    const [previews, setPreviews] = useState([])

    const anchorRef = useRef(null)
    const prevOpen = useRef(open)
    const paperRef = useRef(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [dragging, setDragging] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    const handleMouseDown = (e) => {
        setDragging(true)
        const { left, top, right } = paperRef.current.getBoundingClientRect()

        // Calculate the initial values relative to the viewport width and height
        const initialRight = window.innerWidth - right

        setPosition({
            x: e.clientX,
            y: e.clientY,
            right: initialRight > 0 ? initialRight : 0,
            top: 0
        })
    }

    const handleMouseMove = (e) => {
        if (dragging) {
            const deltaX = e.clientX - position.x
            const deltaY = e.clientY - position.y

            const newRight = Math.max(0, position.right - deltaX)
            const newTop = position.top + deltaY

            paperRef.current.style.right = `${newRight}px`
            paperRef.current.style.top = `${newTop}px`
        }
    }

    const handleMouseUp = () => {
        setDragging(false)
    }

    const handleClose = (event) => {
        if (dragging || isDragging) {
            return
        }
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return
        }
        if (event && event.target.closest('.clear-chat')) {
            return
        }

        setOpen(false)
    }

    const customization = useSelector((state) => state.customization)
    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen)
    }

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        } else {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [dragging])

    const expandChat = () => {
        const props = {
            open: true,
            chatflowid: chatflowid
        }
        setExpandDialogProps(props)
        setShowExpandDialog(true)
    }

    const resetChatDialog = () => {
        const props = {
            ...expandDialogProps,
            open: false
        }
        setExpandDialogProps(props)
        setTimeout(() => {
            const resetProps = {
                ...expandDialogProps,
                open: true
            }
            setExpandDialogProps(resetProps)
        }, 500)
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
                resetChatDialog()
                enqueueSnackbar({
                    message: 'Succesfully cleared all chat history',
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

    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus()
        }
        prevOpen.current = open

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, chatflowid])

    return (
        <>
            <StyledFab
                sx={{
                    position: 'absolute',
                    right: 20,
                    top: 20,
                    boxShadow: '0',
                    color: customization.isDarkMode ? 'white' : 'black',
                    backgroundColor: open ? (customization?.isDarkMode ? 'transparent' : 'transparent') : '',

                    '&:hover': {
                        backgroundColor: open
                            ? customization?.isDarkMode
                                ? '000'
                                : '#fff'
                            : customization.isDarkMode
                            ? '#e22a90'
                            : '#3c5ba4'
                    }
                }}
                ref={anchorRef}
                size='small'
                color='secondary'
                aria-label='chat'
                title='Chat'
                onClick={handleToggle}
            >
                {open ? (
                    <IconX
                        style={{
                            display: customization?.isDarkMode ? 'none' : 'none',
                            backgroundColor: customization.isDarkMode ? '' : ''
                        }}
                    />
                ) : (
                    <IconMessage style={{ color: customization?.isDarkMode ? '#fff' : '#fff' }} />
                )}
            </StyledFab>

            <Popper
                placement='bottom-end'
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [40, 14]
                            }
                        }
                    ]
                }}
                sx={{ zIndex: 1000 }}
            >
                {({ TransitionProps }) => (
                    <Transitions in={open} {...TransitionProps}>
                        <Paper
                            ref={paperRef}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseDown={handleMouseDown}
                            sx={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column', // Arrange items vertically
                                gap: '8px' // Space between items
                            }}
                        >
                            {/* Icons are placed at the top-right corner */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '-57px' }}>
                                <StyledFab
                                    sx={{
                                        background: 'transparent',
                                        boxShadow: '0',
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    }}
                                    onClick={expandChat}
                                    size='small'
                                    color='primary'
                                    aria-label='expand'
                                    title='Expand Chat'
                                >
                                    <IconArrowsMaximize />
                                </StyledFab>
                                <StyledFab
                                    className='clear-chat'
                                    sx={{
                                        background: 'transparent',
                                        boxShadow: '0',
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    }}
                                    onClick={clearChat}
                                    size='small'
                                    color='error'
                                    aria-label='clear'
                                    title='Clear Chat History'
                                >
                                    <IconEraser />
                                </StyledFab>

                                <StyledFab
                                    sx={{
                                        background: 'transparent',
                                        boxShadow: '0',
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    }}
                                    onClick={handleToggle}
                                    size='small'
                                    aria-label='close'
                                    title='Close Chat'
                                >
                                    <IconX />
                                </StyledFab>
                            </div>

                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard
                                    border={false}
                                    className='cloud-wrapper'
                                    elevation={16}
                                    content={false}
                                    boxShadow
                                    shadow={theme.shadows[16]}
                                >
                                    <ChatMessage
                                        show={showExpandDialog}
                                        isAgentCanvas={isAgentCanvas}
                                        chatflowid={chatflowid}
                                        open={open}
                                        previews={previews}
                                        setPreviews={setPreviews}
                                    />
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
            <ChatExpandDialog
                show={showExpandDialog}
                dialogProps={expandDialogProps}
                isAgentCanvas={isAgentCanvas}
                onClear={clearChat}
                onCancel={() => setShowExpandDialog(false)}
                previews={previews}
                setPreviews={setPreviews}
                open={open}
                setOpen={setOpen}
                setShowExpandDialog={setShowExpandDialog}
            ></ChatExpandDialog>
        </>
    )
}

ChatPopUp.propTypes = { chatflowid: PropTypes.string, isAgentCanvas: PropTypes.bool }
