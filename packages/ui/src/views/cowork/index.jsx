import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Grid, Typography, Chip, Card, CardContent, CardActionArea } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { IconPlus, IconRobot } from '@tabler/icons-react'
import SessionCreateDialog from './SessionCreateDialog'

const STATUS_COLOR = {
    pending: 'default',
    running: 'primary',
    completed: 'success',
    failed: 'error',
    partial: 'warning',
    cancelled: 'default'
}

// Sprint 1: mock data. Sprint 2: replace with useDispatch + coworkApi.listSessions()
const MOCK_SESSIONS = [
    {
        id: '1',
        goal: 'Research top 3 AI competitors and write a comparison report',
        status: 'completed',
        createdDate: new Date().toISOString(),
        totalTokensUsed: 4200,
        taskCount: 4
    },
    {
        id: '2',
        goal: 'Build a REST API for user authentication with JWT',
        status: 'running',
        createdDate: new Date().toISOString(),
        totalTokensUsed: 1800,
        taskCount: 3
    },
    {
        id: '3',
        goal: 'Analyse Q3 sales data and identify growth opportunities',
        status: 'pending',
        createdDate: new Date().toISOString(),
        totalTokensUsed: 0,
        taskCount: 0
    }
]

const CoworkSessions = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const [createOpen, setCreateOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filtered = MOCK_SESSIONS.filter((s) => s.goal.toLowerCase().includes(search.toLowerCase()))

    return (
        <MainCard>
            <Stack flexDirection='column' gap={2}>
                <ViewHeader
                    title='CoWork'
                    description='AI-powered multi-agent task execution'
                    onSearchChange={(e) => setSearch(e.target.value)}
                    search
                    searchPlaceholder='Search sessions...'
                >
                    <StyledButton variant='contained' onClick={() => setCreateOpen(true)} startIcon={<IconPlus />}>
                        New Session
                    </StyledButton>
                </ViewHeader>

                {filtered.length === 0 ? (
                    <Stack alignItems='center' justifyContent='center' py={8}>
                        <IconRobot size={64} stroke={1} color={theme.palette.grey[400]} />
                        <Typography variant='h5' color='textSecondary' mt={2}>
                            No sessions yet
                        </Typography>
                        <Typography variant='body2' color='textSecondary'>
                            Create your first CoWork session to get started
                        </Typography>
                    </Stack>
                ) : (
                    <Grid container spacing={2}>
                        {filtered.map((session) => (
                            <Grid item xs={12} sm={6} md={4} key={session.id}>
                                <Card variant='outlined'>
                                    <CardActionArea onClick={() => navigate(`/cowork/${session.id}`)}>
                                        <CardContent>
                                            <Stack direction='row' justifyContent='space-between' alignItems='flex-start' mb={1}>
                                                <Chip
                                                    label={session.status}
                                                    color={STATUS_COLOR[session.status] || 'default'}
                                                    size='small'
                                                />
                                                <Typography variant='caption' color='textSecondary'>
                                                    {new Date(session.createdDate).toLocaleDateString()}
                                                </Typography>
                                            </Stack>
                                            <Typography
                                                variant='body2'
                                                sx={{
                                                    mb: 1,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {session.goal}
                                            </Typography>
                                            <Stack direction='row' gap={1}>
                                                <Typography variant='caption' color='textSecondary'>
                                                    {session.taskCount} tasks
                                                </Typography>
                                                {session.totalTokensUsed > 0 && (
                                                    <Typography variant='caption' color='textSecondary'>
                                                        · {session.totalTokensUsed.toLocaleString()} tokens
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Stack>

            <SessionCreateDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={(session) => {
                    setCreateOpen(false)
                    navigate(`/cowork/${session.id}`)
                }}
            />
        </MainCard>
    )
}

export default CoworkSessions
