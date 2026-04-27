import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Stack, Typography, Chip, Button, IconButton, Divider, Alert } from '@mui/material'
import { IconArrowLeft, IconPlayerPlay, IconX } from '@tabler/icons-react'
import MainCard from '@/ui-component/cards/MainCard'
import { setCurrentSession, setCurrentTasks, clearCurrentSession } from '@/store/slices/coworkSlice'
import CoworkCanvas from './CoworkCanvas'
import AgentMonitor from './AgentMonitor'
import ArtifactsPanel from './ArtifactsPanel'
import TaskList from './TaskList'
import BudgetBar from './BudgetBar'
import BudgetBanner from './BudgetBanner'
import ApprovalModal from './ApprovalModal'

// Sprint 1 — mock session data. Sprint 2 — replace with coworkApi.getSession(id)
const MOCK_SESSION = {
    id: '1',
    goal: 'Research top 3 AI competitors and write a comparison report',
    status: 'running',
    totalTokensUsed: 1800,
    maxTokenBudget: 5000,
    createdAt: '2023-10-27T10:00:00Z',
    totalCost: 0.05
}
const MOCK_TASKS = [
    { id: 't1', name: 'Research Competitor A', agentPersona: 'researcher', status: 'pending', dependencies: [] },
    { id: 't2', name: 'Research Competitor B', agentPersona: 'researcher', status: 'pending', dependencies: [] },
    { id: 't3', name: 'Research Competitor C', agentPersona: 'researcher', status: 'pending', dependencies: [] },
    { id: 't4', name: 'Write Comparison Report', agentPersona: 'writer', status: 'pending', dependencies: ['t1', 't2', 't3'] }
]

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
    const [approvalOpen, setApprovalOpen] = useState(false)
    const [selectedTaskForApproval, setSelectedTaskForApproval] = useState(null)

    useEffect(() => {
        // Sprint 1: load mock data
        // Sprint 2: dispatch(fetchSession(id)) and open SSE stream
        dispatch(setCurrentSession(MOCK_SESSION))
        dispatch(setCurrentTasks(MOCK_TASKS))
        return () => {
            dispatch(clearCurrentSession())
        }
    }, [id, dispatch])

    useEffect(() => {
        // Check for tasks requiring approval (Sprint 2 will trigger this from SSE)
        const pendingApprovalTask = currentTasks.find((t) => t.status === 'awaiting_approval')
        if (pendingApprovalTask) {
            setSelectedTaskForApproval(pendingApprovalTask)
            setApprovalOpen(true)
        }
    }, [currentTasks])

    if (!currentSession) return null

    return (
        <MainCard>
            <Stack gap={2}>
                {/* Budget Banner */}
                <BudgetBanner show={currentSession.status === 'partial'} />

                {/* Error Banner */}
                {currentSession.status === 'failed' && (
                    <Alert severity='error' sx={{ mb: 1 }}>
                        {currentSession.errorMessage || 'Session failed due to an unexpected error.'}
                    </Alert>
                )}

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
                        <Button variant='contained' startIcon={<IconPlayerPlay />} size='small'>
                            Start
                        </Button>
                    )}
                    {['running', 'pending'].includes(currentSession.status) && (
                        <Button variant='outlined' color='error' startIcon={<IconX />} size='small'>
                            Cancel
                        </Button>
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

            <ApprovalModal
                open={approvalOpen}
                task={selectedTaskForApproval}
                onClose={() => setApprovalOpen(false)}
                onApprove={() => {
                    setApprovalOpen(false)
                    // Sprint 1 Mock: Update task to completed to resume flow
                    dispatch(updateTaskStatus({ taskId: selectedTaskForApproval.id, status: 'completed' }))
                }}
                onReject={(reason) => {
                    setApprovalOpen(false)
                    // Sprint 1 Mock: Update task to failed
                    dispatch(updateTaskStatus({ taskId: selectedTaskForApproval.id, status: 'failed' }))
                    dispatch(
                        updateSessionStatus({
                            sessionId: currentSession.id,
                            status: 'failed',
                            errorMessage: 'Task rejected by user: ' + reason
                        })
                    )
                }}
            />
        </MainCard>
    )
}

export default SessionDetail
