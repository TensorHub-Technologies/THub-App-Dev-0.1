import PropTypes from 'prop-types'
import { Box, Stack, Typography, Chip, IconButton, Tooltip, Divider } from '@mui/material'
import { IconRefresh } from '@tabler/icons-react'

const STATUS_COLOR = {
    pending: 'default',
    ready: 'warning',
    running: 'primary',
    completed: 'success',
    failed: 'error',
    skipped: 'default'
}
const PERSONA_LABEL = {
    coder: 'Coder',
    researcher: 'Researcher',
    analyst: 'Analyst',
    reviewer: 'Reviewer',
    architect: 'Architect',
    writer: 'Writer'
}

const TaskList = ({ tasks = [], onTaskSelect, selectedTaskId, onRetry }) => {
    return (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant='overline' color='textSecondary' sx={{ px: 1.5, pt: 1.5, display: 'block' }}>
                Tasks ({tasks.length})
            </Typography>
            <Divider sx={{ mb: 0.5 }} />
            {tasks.map((task, index) => (
                <Box
                    key={task.id}
                    onClick={() => onTaskSelect?.(task)}
                    sx={{
                        px: 1.5,
                        py: 1,
                        cursor: 'pointer',
                        bgcolor: selectedTaskId === task.id ? 'action.selected' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                        <Stack flex={1} gap={0.25}>
                            <Stack direction='row' gap={0.75} alignItems='center'>
                                <Typography variant='caption' color='textSecondary' sx={{ minWidth: 20 }}>
                                    {index + 1}.
                                </Typography>
                                <Typography
                                    variant='body2'
                                    fontWeight={500}
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: 180
                                    }}
                                >
                                    {task.name}
                                </Typography>
                            </Stack>
                            <Stack direction='row' gap={0.5} alignItems='center' pl={2.5}>
                                <Chip
                                    label={task.status}
                                    color={STATUS_COLOR[task.status] || 'default'}
                                    size='small'
                                    sx={{ height: 18, fontSize: 10 }}
                                />
                                <Typography variant='caption' color='textSecondary'>
                                    {PERSONA_LABEL[task.agentPersona] || task.agentPersona}
                                </Typography>
                                {task.tokensUsed > 0 && (
                                    <Typography variant='caption' color='textSecondary'>
                                        · {task.tokensUsed.toLocaleString()}t
                                    </Typography>
                                )}
                                {task.latencyMs > 0 && (
                                    <Typography variant='caption' color='textSecondary'>
                                        · {(task.latencyMs / 1000).toFixed(1)}s
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                        {task.status === 'failed' && (
                            <Tooltip title='Retry task'>
                                <IconButton
                                    size='small'
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onRetry?.(task.id)
                                    }}
                                >
                                    <IconRefresh size={16} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                    {task.status === 'failed' && task.errorMessage && (
                        <Typography variant='caption' color='error' sx={{ pl: 2.5, display: 'block', mt: 0.25 }}>
                            {task.errorMessage.slice(0, 80)}
                            {task.errorMessage.length > 80 ? '…' : ''}
                        </Typography>
                    )}
                </Box>
            ))}
        </Box>
    )
}

TaskList.propTypes = {
    tasks: PropTypes.array,
    onTaskSelect: PropTypes.func,
    selectedTaskId: PropTypes.string,
    onRetry: PropTypes.func
}

export default TaskList
