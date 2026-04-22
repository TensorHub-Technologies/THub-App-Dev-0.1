import { useState } from 'react'
import PropTypes from 'prop-types'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, CircularProgress, Alert } from '@mui/material'

const MODEL_OPTIONS = [
    { label: 'Claude 3.5 Sonnet', value: { provider: 'anthropic', modelName: 'claude-3-5-sonnet-20241022' } },
    { label: 'GPT-4o', value: { provider: 'openai', modelName: 'gpt-4o' } },
    { label: 'GPT-4o Mini', value: { provider: 'openai', modelName: 'gpt-4o-mini' } },
    { label: 'Gemini 1.5 Flash', value: { provider: 'google', modelName: 'gemini-1.5-flash' } }
]

const SessionCreateDialog = ({ open, onClose, onCreated }) => {
    const [goal, setGoal] = useState('')
    const [budget, setBudget] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleCreate = async () => {
        if (!goal.trim()) {
            setError('Goal is required')
            return
        }
        setLoading(true)
        setError('')
        try {
            // Sprint 1: mock — Sprint 2 replace with: await coworkApi.createSession(...)
            const mockSession = { id: Date.now().toString(), goal: goal.trim(), status: 'pending' }
            onCreated(mockSession)
            setGoal('')
            setBudget('')
        } catch (e) {
            setError('Failed to create session. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>New CoWork Session</DialogTitle>
            <DialogContent>
                <Stack gap={2} pt={1}>
                    {error && <Alert severity='error'>{error}</Alert>}
                    <TextField
                        label='Goal'
                        placeholder='What do you want to accomplish?'
                        multiline
                        rows={3}
                        value={goal}
                        onChange={(e) => {
                            setGoal(e.target.value)
                            setError('')
                        }}
                        required
                        fullWidth
                        helperText='CoWork will break this into tasks and execute them automatically'
                    />
                    <TextField
                        label='Token Budget (optional)'
                        type='number'
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        fullWidth
                        helperText='Leave empty for no limit'
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant='contained' onClick={handleCreate} disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : 'Create Session'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
SessionCreateDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onCreated: PropTypes.func
}

export default SessionCreateDialog
