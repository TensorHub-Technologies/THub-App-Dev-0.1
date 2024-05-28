import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { Dialog, DialogContent, DialogTitle, Button } from '@mui/material'
import { ChatMessage } from './ChatMessage'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { IconX, IconEraser, IconMinus } from '@tabler/icons'
import { StyledFab } from '@/ui-component/button/StyledFab'

const ChatExpandDialog = ({ show, dialogProps, onClear, onCancel, previews, setPreviews, open, setShowExpandDialog }) => {
    const portalElement = document.getElementById('portal')
    const customization = useSelector((state) => state.customization)
    const component = show ? (
        <Dialog
            open={show}
            fullWidth
            maxWidth='md'
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            sx={{ overflow: 'visible' }}
        >
            <DialogTitle sx={{ fontSize: '1rem', p: 1.5 }} id='alert-dialog-title'>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {dialogProps.title}
                    <div style={{ flex: 1 }}></div>
                    {open && customization.isDarkMode && (
                        <StyledButton
                            variant='outlined'
                            color='error'
                            title='Clear Conversation'
                            onClick={onClear}
                            startIcon={<IconEraser />}
                        >
                            Clear Chat
                        </StyledButton>
                    )}
                    <StyledFab
                        sx={{
                            position: 'absolute',
                            right: 70,
                            top: 20,
                            background: 'transparent',
                            boxShadow: '0',
                            color: customization.isDarkMode ? 'white' : 'black'
                        }}
                        variant='outlined'
                        title='Minimise'
                        onClick={() => setShowExpandDialog(false)}
                    >
                        <IconMinus />
                    </StyledFab>
                    <StyledFab
                        sx={{
                            position: 'absolute',
                            right: 40,
                            top: 20,
                            background: 'transparent',
                            boxShadow: '0',
                            color: customization.isDarkMode ? 'white' : 'black'
                        }}
                        variant='outlined'
                        title='Erase'
                        onClick={() => {
                            onClear()
                            setShowExpandDialog(false)
                        }}
                    >
                        <IconEraser />
                    </StyledFab>
                    <StyledFab
                        sx={{
                            position: 'absolute',
                            right: 10,
                            top: 20,
                            background: 'transparent',
                            boxShadow: '0',
                            color: customization.isDarkMode ? 'white' : 'black'
                        }}
                        variant='outlined'
                        title='Close'
                        onClick={() => setShowExpandDialog(false)}
                    >
                        <IconX />
                    </StyledFab>
                    {open && !customization.isDarkMode && (
                        <Button variant='outlined' color='error' title='Clear Conversation' onClick={onClear} startIcon={<IconEraser />}>
                            Clear Chat
                        </Button>
                    )}
                </div>
            </DialogTitle>
            <DialogContent
                className='cloud-dialog-wrapper'
                sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', p: 0 }}
            >
                <ChatMessage
                    isDialog={true}
                    open={dialogProps.open}
                    chatflowid={dialogProps.chatflowid}
                    previews={previews}
                    setPreviews={setPreviews}
                />
            </DialogContent>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

ChatExpandDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onClear: PropTypes.func,
    onCancel: PropTypes.func,
    previews: PropTypes.array,
    setPreviews: PropTypes.func
}

export default ChatExpandDialog
