import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Stack, Typography, Chip, Button, IconButton, Divider } from '@mui/material'
import { IconArrowLeft, IconPlayerPlay, IconX } from '@tabler/icons-react'
import MainCard from '@/ui-component/cards/MainCard'
import coworkApi from '@/api/cowork'
import {
    setCurrentSession,
    setCurrentTasks,
    clearCurrentSession,
    updateTaskStatus,
    updateSessionStatus,
    addLiveEvent
} from '@/store/slices/coworkSlice'
import CoworkCanvas from './CoworkCanvas'
import AgentMonitor from './AgentMonitor'
import ArtifactsPanel from './ArtifactsPanel'
import TaskList from './TaskList'
import BudgetBar from './BudgetBar'

const STATUS_COLOR = {
    pending: 'default',
    running: 'primary',
    completed: 'success',
    failed: 'error',
    partial: 'warning',
    cancelled: 'default'
}

const SessionDetail = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { currentSession, currentTasks } = useSelector((s) => s.cowork)
    const [activeTab, setActiveTab] = useState('tasks')
    const [selectedTaskId, setSelectedTaskId] = useState(null)

    useEffect(() => {
        let eventSource = null

        const initStream = async () => {
            try {
                // Initial load
                const res = await coworkApi.getSession(id)
                dispatch(setCurrentSession(res.data.session))
                dispatch(setCurrentTasks(res.data.tasks))

                // Connect to SSE with Auth
                const baseUrl = window.location.origin.replace('8080', '3000')
                const token = localStorage.getItem('authToken') || localStorage.getItem('userId')
                const streamUrl = `${baseUrl}/api/v1/cowork/sessions/${id}/stream?token=${token}`
                eventSource = new EventSource(streamUrl)

                eventSource.onmessage = (event) => {
                    const parsed = JSON.parse(event.data)
                    const data = parsed.data || parsed // Handle double-nested {event, data} from SSEStreamer
                    const { type, taskId, status, output } = data

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
                        case 'cowork.session.done':
                            dispatch(updateSessionStatus({ sessionId: id, status: data.status }))
                            break
                        case 'cowork.session.budget_exceeded':
                            dispatch(updateSessionStatus({ sessionId: id, status: 'partial' }))
                            break
                    }
                }

                eventSource.onerror = (e) => {
                    console.warn('[SSE]: Connection error — will auto-reconnect', e)
                }
            } catch (err) {
                console.error('Failed to initialize session stream', err)
            }
        }

        initStream()

        return () => {
            if (eventSource) eventSource.close()
            dispatch(clearCurrentSession())
        }
    }, [id, dispatch])

    const handleStart = async () => {
        try {
            await coworkApi.startSession(id)
            window.location.reload()
        } catch (e) {
            alert('Failed to start session: ' + (e?.response?.data?.message || e.message))
            console.error('Failed to start session', e)
        }
    }

    const handleCancel = async () => {
        try {
            if (window.confirm('Are you sure you want to cancel this session?')) {
                await coworkApi.cancelSession(id)
                navigate('/cowork')
            }
        } catch (e) {
            alert('Failed to cancel session: ' + (e?.response?.data?.message || e.message))
            console.error('Failed to cancel session', e)
        }
    }

    if (!currentSession) return null

    return (
        <MainCard>
            <Stack gap={2}>
                {/* Header */}
                <Stack direction='row' alignItems='center' gap={1}>
                    <IconButton onClick={() => navigate('/cowork')} size='small'>
                        <IconArrowLeft />
                    </IconButton>
                    <Stack flex={1}>
                        <Typography variant='h4' noWrap sx={{ maxWidth: 600 }}>
                            {currentSession.goal}
                        </Typography>
                        <Stack direction='row' gap={1.5} alignItems='center'>
                            <Chip
                                label={currentSession.status}
                                color={STATUS_COLOR[currentSession.status] || 'default'}
                                size='small'
                                sx={{ height: 20 }}
                            />
                            {currentSession.createdAt && (
                                <Typography variant='caption' color='textSecondary'>
                                    Created: {new Date(currentSession.createdAt).toLocaleDateString()}
                                </Typography>
                            )}
                            {currentSession.totalCost !== undefined && (
                                <Typography variant='caption' color='textSecondary'>
                                    Cost: ${currentSession.totalCost.toFixed(2)}
                                </Typography>
                            )}
                        </Stack>
                    </Stack>

                    {currentSession.maxTokenBudget > 0 && (
                        <Box sx={{ width: 200, mr: 2 }}>
                            <BudgetBar used={currentSession.totalTokensUsed} max={currentSession.maxTokenBudget} />
                        </Box>
                    )}

                    {currentSession.status === 'pending' && (
                        <Button variant='contained' startIcon={<IconPlayerPlay />} size='small' onClick={handleStart}>
                            Start
                        </Button>
                    )}
                    {['running', 'pending'].includes(currentSession.status) && (
                        <Button variant='outlined' color='error' startIcon={<IconX />} size='small' onClick={handleCancel}>
                            Cancel
                        </Button>
                    )}
                    {currentSession.status === 'cancelled' && (
                        <Typography variant='caption' sx={{ fontStyle: 'italic', color: 'text.secondary', mr: 2 }}>
                            This session was cancelled and cannot be restarted.
                        </Typography>
                    )}
                    {currentSession.status === 'completed' && (
                        <Typography variant='caption' sx={{ fontStyle: 'italic', color: 'success.main', mr: 2 }}>
                            Execution finished successfully.
                        </Typography>
                    )}
                </Stack>

                <Divider />

                {/* Main content: Canvas left, Monitor/Artifacts right */}
                <Stack direction='row' gap={2} sx={{ height: 'calc(100vh - 280px)', minHeight: 500 }}>
                    <Box flex={1} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        <CoworkCanvas tasks={currentTasks} />
                    </Box>
                    <Box sx={{ width: 360, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Stack direction='row' gap={1}>
                            {['tasks', 'monitor', 'artifacts'].map((tab) => (
                                <Button
                                    key={tab}
                                    size='small'
                                    variant={activeTab === tab ? 'contained' : 'outlined'}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Button>
                            ))}
                        </Stack>
                        <Box flex={1} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                            {activeTab === 'tasks' && (
                                <TaskList
                                    tasks={currentTasks}
                                    selectedTaskId={selectedTaskId}
                                    onTaskSelect={(task) => {
                                        setSelectedTaskId(task.id)
                                        setActiveTab('artifacts')
                                    }}
                                    onRetry={(_taskId) => {
                                        // TODO: retry task taskId
                                    }}
                                />
                            )}
                            {activeTab === 'monitor' && <AgentMonitor />}
                            {activeTab === 'artifacts' && <ArtifactsPanel tasks={currentTasks} selectedTaskId={selectedTaskId} />}
                        </Box>
                    </Box>
                </Stack>
            </Stack>
        </MainCard>
    )
}

export default SessionDetail
