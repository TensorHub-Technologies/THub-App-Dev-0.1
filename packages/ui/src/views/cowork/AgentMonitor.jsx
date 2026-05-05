import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Stack, Typography, Divider } from '@mui/material'
import { updateTaskStatus, addLiveEvent, updateSessionStatus } from '@/store/slices/coworkSlice'

// SSE event names — must match exactly what CoworkExecutor fires
const EVENT_COLORS = {
    'cowork.task.started': '#2563EB',
    'cowork.task.completed': '#16A34A',
    'cowork.task.failed': '#DC2626',
    'cowork.task.awaiting_approval': '#F59E0B',
    'cowork.session.started': '#7C3AED',
    'cowork.session.done': '#0F766E',
    'cowork.session.budget_exceeded': '#EA580C',
    'cowork.session.failed': '#B91C1C'
}

// Sprint 1: mock SSE simulator — fires events on a timer to test the UI
// Sprint 2: replace with real EventSource connection
const useMockSSE = (dispatch, tasks, sessionId) => {
    const timerRef = useRef(null)
    useEffect(() => {
        if (!tasks.length || !sessionId) return
        let step = 0
        const events = [
            { type: 'cowork.session.started', sessionId },
            { type: 'cowork.task.started', taskId: 't1', name: 'Research Competitor A' },
            { type: 'cowork.task.completed', taskId: 't1', name: 'Research Competitor A', tokens: 800 },
            { type: 'cowork.task.started', taskId: 't2', name: 'Research Competitor B' },
            {
                type: 'cowork.task.awaiting_approval',
                taskId: 't2',
                name: 'Research Competitor B',
                pendingAction: JSON.stringify({ type: 'shell_command', command: 'whoami' })
            },
            { type: 'cowork.task.completed', taskId: 't2', name: 'Research Competitor B', tokens: 1200 },
            { type: 'cowork.task.started', taskId: 't3', name: 'Research Competitor C' },
            { type: 'cowork.task.completed', taskId: 't3', name: 'Research Competitor C', tokens: 950 },
            { type: 'cowork.task.started', taskId: 't4', name: 'Write Comparison Report' },
            { type: 'cowork.task.completed', taskId: 't4', name: 'Write Comparison Report', tokens: 1500 },
            { type: 'cowork.session.budget_exceeded', sessionId },
            { type: 'cowork.session.done', status: 'partial', sessionId }
        ]
        timerRef.current = setInterval(() => {
            if (step >= events.length) {
                clearInterval(timerRef.current)
                return
            }
            const event = events[step++]
            dispatch(addLiveEvent({ ...event, timestamp: new Date().toISOString() }))

            if (event.taskId) {
                let status = 'running'
                if (event.type === 'cowork.task.completed') status = 'completed'
                if (event.type === 'cowork.task.failed') status = 'failed'
                if (event.type === 'cowork.task.awaiting_approval') status = 'awaiting_approval'

                dispatch(
                    updateTaskStatus({
                        taskId: event.taskId,
                        status,
                        output: event.type === 'cowork.task.completed' ? 'Mock output for ' + event.name : null,
                        pendingAction: event.pendingAction
                    })
                )
            }

            if (event.type === 'cowork.session.started') {
                dispatch(updateSessionStatus({ sessionId: event.sessionId, status: 'running' }))
            } else if (event.type === 'cowork.session.done') {
                dispatch(updateSessionStatus({ sessionId: event.sessionId, status: 'completed' }))
            } else if (event.type === 'cowork.session.budget_exceeded') {
                dispatch(updateSessionStatus({ sessionId: event.sessionId, status: 'partial' }))
            } else if (event.type === 'cowork.session.failed') {
                dispatch(updateSessionStatus({ sessionId: event.sessionId, status: 'failed' }))
            }
        }, 2000)
        return () => clearInterval(timerRef.current)
    }, [tasks.length, sessionId, dispatch])
}

const AgentMonitor = () => {
    const dispatch = useDispatch()
    const { liveEvents, currentTasks, currentSession } = useSelector((s) => s.cowork)
    const bottomRef = useRef(null)

    useMockSSE(dispatch, currentTasks, currentSession?.id)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [liveEvents.length])

    return (
        <Box sx={{ height: '100%', overflow: 'auto', p: 1.5 }}>
            <Typography variant='overline' color='textSecondary' display='block' mb={1}>
                Agent Monitor
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {liveEvents.length === 0 ? (
                <Typography variant='body2' color='textSecondary'>
                    Waiting for events...
                </Typography>
            ) : (
                <Stack gap={0.5}>
                    {liveEvents.map((event, i) => (
                        <Box key={i} sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                            <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                <Typography
                                    variant='caption'
                                    sx={{
                                        color: EVENT_COLORS[event.type] || '#374151',
                                        fontWeight: 600,
                                        fontFamily: 'monospace'
                                    }}
                                >
                                    {event.type?.split('.').slice(1).join('.')}
                                </Typography>
                                <Typography variant='caption' color='textSecondary'>
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                </Typography>
                            </Stack>
                            {event.name && (
                                <Typography variant='body2' noWrap>
                                    {event.name}
                                </Typography>
                            )}
                            {event.tokens && (
                                <Typography variant='caption' color='textSecondary'>
                                    {event.tokens.toLocaleString()} tokens
                                </Typography>
                            )}
                        </Box>
                    ))}
                    <div ref={bottomRef} />
                </Stack>
            )}
        </Box>
    )
}

export default AgentMonitor
