import { useState } from 'react'
import PropTypes from 'prop-types'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, CircularProgress, Alert } from '@mui/material'
import coworkApi from '@/api/cowork'

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

    const [model, setModel] = useState(MODEL_OPTIONS[0].value)

    const handleCreate = async () => {
        if (!goal.trim()) {
            setError('Goal is required')
            return
        }
        setLoading(true)
        setError('')
        try {
            // Step 1: create session (decomposes goal into tasks)
            const createRes = await coworkApi.createSession({
                goal: goal.trim(),
                selectedChatModel: model,
                ...(budget ? { maxTokenBudget: parseInt(budget) } : {})
            })
            const session = createRes.data

            // Step 2: start session (queues ready tasks into BullMQ)
            await coworkApi.startSession(session.id)

            onCreated(session)
            setGoal('')
            setBudget('')
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to create session. Please try again.')
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
