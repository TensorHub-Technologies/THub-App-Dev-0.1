import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Stack, Typography, Divider } from '@mui/material'
import { updateTaskStatus, addLiveEvent } from '@/store/slices/coworkSlice'

// SSE event names — must match exactly what CoworkExecutor fires
const EVENT_COLORS = {
    'cowork.task.started': '#2563EB',
    'cowork.task.completed': '#16A34A',
    'cowork.task.failed': '#DC2626',
    'cowork.session.started': '#7C3AED',
    'cowork.session.done': '#0F766E'
}

// Sprint 1: mock SSE simulator — fires events on a timer to test the UI
// Sprint 2: replace with real EventSource connection
const useMockSSE = (dispatch, tasks) => {
    const timerRef = useRef(null)
    useEffect(() => {
        if (!tasks.length) return
        let step = 0
        const events = [
            { type: 'cowork.task.started', taskId: 't1', name: 'Research Competitor A' },
            { type: 'cowork.task.completed', taskId: 't1', name: 'Research Competitor A', tokens: 800 },
            { type: 'cowork.task.started', taskId: 't2', name: 'Research Competitor B' },
            { type: 'cowork.task.completed', taskId: 't2', name: 'Research Competitor B', tokens: 720 },
            { type: 'cowork.session.done', status: 'completed' }
        ]
        timerRef.current = setInterval(() => {
            if (step >= events.length) {
                clearInterval(timerRef.current)
                return
            }
            const event = events[step++]
            dispatch(addLiveEvent({ ...event, timestamp: new Date().toISOString() }))
            if (event.taskId) {
                const status =
                    event.type === 'cowork.task.completed' ? 'completed' : event.type === 'cowork.task.failed' ? 'failed' : 'running'
                dispatch(updateTaskStatus({ taskId: event.taskId, status }))
            }
        }, 2000)
        return () => clearInterval(timerRef.current)
    }, [tasks.length, dispatch])
}

const AgentMonitor = () => {
    const dispatch = useDispatch()
    const { liveEvents, currentTasks } = useSelector((s) => s.cowork)
    const bottomRef = useRef(null)

    useMockSSE(dispatch, currentTasks)

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
