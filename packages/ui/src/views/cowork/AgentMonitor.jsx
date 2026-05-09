import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Box, Stack, Typography, Divider } from '@mui/material'

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
const AgentMonitor = () => {
    const { liveEvents } = useSelector((s) => s.cowork)
    const bottomRef = useRef(null)

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
