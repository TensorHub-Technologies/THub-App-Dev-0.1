import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Box, Stack, Typography, Divider } from '@mui/material'
import { updateTaskStatus, updateSessionStatus, addLiveEvent } from '@/store/slices/coworkSlice'

const EVENT_COLORS = {
    'cowork.task.started': '#2563EB',
    'cowork.task.completed': '#16A34A',
    'cowork.task.failed': '#DC2626',
    'cowork.task.awaiting_approval': '#F59E0B',
    'cowork.session.started': '#7C3AED',
    'cowork.session.done': '#0F766E',
    'cowork.session.budget_exceeded': '#DC2626'
}

// Real SSE connection — replaces the mock timer from Sprint 1
const useSSE = (sessionId, dispatch) => {
    const esRef = useRef(null)

    useEffect(() => {
        if (!sessionId) return
        const token = localStorage.getItem('authToken') || localStorage.getItem('userId')
        const url = `${import.meta.env.VITE_API_URL || ''}/api/v1/cowork/sessions/${sessionId}/stream`

        esRef.current = new EventSource(url)

        esRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                const { type, taskId, status, output, sessionId: sid } = data

                dispatch(addLiveEvent({ ...data, timestamp: new Date().toISOString() }))

                switch (type) {
                    case 'cowork.task.started':
                        dispatch(updateTaskStatus({ taskId, status: 'running' }))
                        break
                    case 'cowork.task.completed':
                        dispatch(updateTaskStatus({ taskId, status: 'completed', output }))
                        break
                    case 'cowork.task.failed':
                        dispatch(updateTaskStatus({ taskId, status: 'failed' }))
                        break
                    case 'cowork.task.awaiting_approval':
                        dispatch(updateTaskStatus({ taskId, status: 'awaiting_approval', pendingAction: data.pendingAction }))
                        break
                    case 'cowork.session.done':
                        dispatch(updateSessionStatus({ sessionId: sid, status: data.status }))
                        break
                    case 'cowork.session.budget_exceeded':
                        dispatch(updateSessionStatus({ sessionId: sid, status: 'partial' }))
                        break
                    default:
                        break
                }
            } catch (e) {
                console.error('[SSE]: Failed to parse event', e)
            }
        }

        esRef.current.onerror = () => {
            console.warn('[SSE]: Connection error — will auto-reconnect')
        }

        // Cleanup on unmount — prevents memory leak
        return () => {
            if (esRef.current) {
                esRef.current.close()
                esRef.current = null
            }
        }
    }, [sessionId])
}

const AgentMonitor = () => {
    const { id: sessionId } = useParams()
    const dispatch = useDispatch()
    const { liveEvents } = useSelector((s) => s.cowork)
    const bottomRef = useRef(null)

    useSSE(sessionId, dispatch)

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
                    {[...liveEvents].reverse().map((event, i) => (
                        <Box key={i} sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                            <Stack direction='row' justifyContent='space-between'>
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
