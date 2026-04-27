import PropTypes from 'prop-types'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert, TextField, Stack } from '@mui/material'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useState } from 'react'

// Sprint 1: modal renders but approve/reject are no-ops (no live API yet)
// Sprint 2: approve calls coworkApi.approveTask, reject calls coworkApi.rejectTask

const ApprovalModal = ({ open, task, onApprove, onReject, onClose }) => {
    const [reason, setReason] = useState('')
    if (!task) return null

    let pendingAction = null
    try {
        pendingAction = JSON.parse(task.pendingAction)
    } catch (e) {
        // ignore
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconAlertTriangle color='#F59E0B' size={22} />
                Approval Required
            </DialogTitle>
            <DialogContent>
                <Stack gap={2}>
                    <Alert severity='warning'>
                        Task <strong>{task.name}</strong> requires your approval before proceeding.
                    </Alert>
                    {pendingAction && (
                        <Box>
                            <Typography variant='caption' color='textSecondary' display='block' mb={0.5}>
                                Action type: {pendingAction.type}
                            </Typography>
                            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 13 }}>
                                {JSON.stringify(pendingAction, null, 2)}
                            </Box>
                        </Box>
                    )}
                    <TextField
                        label='Rejection reason (optional)'
                        multiline
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        fullWidth
                        size='small'
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button color='error' onClick={() => onReject?.(reason)}>
                    Reject
                </Button>
                <Button variant='contained' color='success' onClick={() => onApprove?.()}>
                    Approve
                </Button>
            </DialogActions>
        </Dialog>
    )
}

ApprovalModal.propTypes = {
    open: PropTypes.bool,
    task: PropTypes.shape({
        name: PropTypes.string,
        pendingAction: PropTypes.string
    }),
    onApprove: PropTypes.func,
    onReject: PropTypes.func,
    onClose: PropTypes.func
}

export default ApprovalModal
