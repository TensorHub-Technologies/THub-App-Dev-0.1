import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { Button, Dialog, DialogActions, DialogContent, OutlinedInput, DialogTitle } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'

const SaveChatflowDialog = ({ show, dialogProps, onCancel, onConfirm }) => {
    const portalElement = document.getElementById('portal')

    const [chatflowName, setChatflowName] = useState('')
    const [isReadyToSave, setIsReadyToSave] = useState(false)

    const [chatflowDescription, setChatflowDescription] = useState('')

    useEffect(() => {
        if (chatflowName) setIsReadyToSave(true)
        else setIsReadyToSave(false)
    }, [chatflowName])

    const handleConfirm = () => {
        onConfirm(chatflowName, chatflowDescription)
        console.log('Workflow Name:', chatflowName)
        console.log('Workflow Description:', chatflowDescription)
    }

    const component = show ? (
        <Dialog
            open={show}
            fullWidth
            maxWidth='xs'
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            disableRestoreFocus // needed due to StrictMode
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                {dialogProps.title}
            </DialogTitle>

            <DialogContent>
                <OutlinedInput
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    sx={{ mt: 1 }}
                    id='chatflow-name'
                    type='text'
                    fullWidth
                    placeholder='My New Workflow'
                    value={chatflowName}
                    onChange={(e) => setChatflowName(e.target.value)}
                />
                <OutlinedInput
                    sx={{ mt: 2 }}
                    id='chatflow-description'
                    type='text'
                    fullWidth
                    placeholder='Add a description'
                    value={chatflowDescription}
                    onChange={(e) => setChatflowDescription(e.target.value)}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onCancel}>{dialogProps.cancelButtonName}</Button>
                <StyledButton disabled={!isReadyToSave} variant='contained' onClick={handleConfirm}>
                    {dialogProps.confirmButtonName}
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

SaveChatflowDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func
}

export default SaveChatflowDialog
