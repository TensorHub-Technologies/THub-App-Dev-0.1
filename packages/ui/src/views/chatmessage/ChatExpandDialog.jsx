import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { ChatMessage } from './ChatMessage'
import { IconX, IconEraser, IconMinus } from '@tabler/icons'
import { StyledFab } from '@/ui-component/button/StyledFab'

const ChatExpandDialog = ({
    show,
    dialogProps,
    isAgentCanvas,
    onClear,
    onCancel,
    previews,
    setPreviews,
    open,
    setOpen,
    setShowExpandDialog
}) => {
    const portalElement = document.getElementById('portal')
    const customization = useSelector((state) => state.customization)

    const component = show ? (
        <Dialog
            open={show}
            fullWidth
            maxWidth='3000px'
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            sx={{ overflow: 'visible' }}
        >
            <DialogTitle sx={{ fontSize: '1rem', p: 1.5, padding: '0px' }} id='alert-dialog-title'>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {dialogProps.title}
                    <div style={{ flex: 1 }}></div>
                    <StyledFab
                        sx={{
                            position: 'absolute',
                            right: 100,
                            top: 0,
                            background: 'transparent',
                            boxShadow: '0',
                            color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                        }}
                        variant='outlined'
                        title='Minimise'
                        onClick={() => {
                            {
                                setShowExpandDialog(false)
                                setOpen(true)
                            }
                        }}
                    >
                        <IconMinus />
                    </StyledFab>
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
                            onClear()
                            setShowExpandDialog(false)
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
                        onClick={() => setShowExpandDialog(false)}
                    >
                        <IconX />
                    </StyledFab>
                </div>
            </DialogTitle>
            <DialogContent
                className='cloud-dialog-wrapper'
                sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', p: 0 }}
            >
                <ChatMessage
                    isDialog={true}
                    show={show}
                    open={dialogProps.open}
                    isAgentCanvas={isAgentCanvas}
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
    isAgentCanvas: PropTypes.bool,
    onClear: PropTypes.func,
    onCancel: PropTypes.func,
    previews: PropTypes.array,
    setPreviews: PropTypes.func
}

export default ChatExpandDialog
