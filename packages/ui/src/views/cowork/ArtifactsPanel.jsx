import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Box, Stack, Typography, Divider } from '@mui/material'
import coworkApi from '@/api/cowork'

const PERSONA_COLOR = {
    coder: '#2563EB',
    researcher: '#7C3AED',
    analyst: '#0F766E',
    reviewer: '#B45309',
    architect: '#DC2626',
    writer: '#374151'
}

const ArtifactsPanel = ({ selectedTaskId }) => {
    const { id: sessionId } = useParams()
    const [tasks, setTasks] = useState([])

    useEffect(() => {
        if (!sessionId) return
        coworkApi
            .getArtifacts(sessionId)
            .then((res) => setTasks(res.data?.artifacts || res.data || []))
            .catch((err) => console.error('[artifacts]: Failed to load', err))
    }, [sessionId])

    let completed = tasks.filter((t) => t.status === 'completed' && t.outputArtifact)

    if (selectedTaskId) {
        completed = completed.filter((t) => t.id === selectedTaskId)
    }

    if (!completed.length)
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant='body2' color='textSecondary'>
                    No completed tasks yet
                </Typography>
            </Box>
        )

    return (
        <Box sx={{ height: '100%', overflow: 'auto', p: 1.5 }}>
            <Typography variant='overline' color='textSecondary' display='block' mb={1}>
                Artifacts
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Stack gap={2}>
                {completed.map((task) => {
                    let artifact = null
                    try {
                        artifact = JSON.parse(task.outputArtifact)
                    } catch (error) {
                        artifact = null
                    }
                    return (
                        <Box key={task.id}>
                            <Stack direction='row' gap={1} alignItems='center' mb={0.5}>
                                <Typography
                                    variant='caption'
                                    sx={{
                                        color: PERSONA_COLOR[task.agentPersona] || '#374151',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        fontSize: 10
                                    }}
                                >
                                    {task.agentPersona}
                                </Typography>
                                <Typography variant='body2' fontWeight={500}>
                                    {task.name}
                                </Typography>
                            </Stack>
                            <Box
                                sx={{
                                    p: 1.5,
                                    bgcolor: artifact?.type === 'code' ? '#0F172A' : 'action.hover',
                                    borderRadius: 1,
                                    maxHeight: 200,
                                    overflow: 'auto'
                                }}
                            >
                                <Typography
                                    variant='caption'
                                    sx={{
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        color: artifact?.type === 'code' ? '#93C5FD' : 'inherit'
                                    }}
                                >
                                    {artifact?.content || task.outputArtifact}
                                </Typography>
                            </Box>
                        </Box>
                    )
                })}
            </Stack>
        </Box>
    )
}

ArtifactsPanel.propTypes = {
    selectedTaskId: PropTypes.string
}

export default ArtifactsPanel
