import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Stack, Grid, Typography, Chip, Card, CardContent, CardActionArea, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { IconPlus, IconRobot } from '@tabler/icons-react'
import { setSessions, setLoading, setError } from '@/store/slices/coworkSlice'
import coworkApi from '@/api/cowork'
import SessionCreateDialog from './SessionCreateDialog'

const STATUS_COLOR = {
    pending: 'default',
    running: 'primary',
    completed: 'success',
    failed: 'error',
    partial: 'warning',
    cancelled: 'default'
}

const CoworkSessions = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { sessions, loading, error } = useSelector((s) => s.cowork)
    const theme = useTheme()
    const [createOpen, setCreateOpen] = useState(false)
    const [search, setSearch] = useState('')

    const fetchSessions = async () => {
        dispatch(setLoading(true))
        try {
            const res = await coworkApi.listSessions()
            dispatch(setSessions(res.data?.sessions || res.data || []))
        } catch (e) {
            dispatch(setError('Unable to load sessions — please try again'))
        } finally {
            dispatch(setLoading(false))
        }
    }

    useEffect(() => {
        fetchSessions()
    }, [])

    const filtered = sessions.filter((s) => s.goal.toLowerCase().includes(search.toLowerCase()))

    if (loading) {
        return (
            <MainCard>
                <Stack alignItems='center' py={8}>
                    <CircularProgress />
                </Stack>
            </MainCard>
        )
    }

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

                {error && (
                    <Typography color='error' variant='body2'>
                        {error}
                    </Typography>
                )}

                {filtered.length === 0 && !loading ? (
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
                                            <Stack direction='row' justifyContent='space-between' mb={1}>
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
                                                    {session.taskCount || 0} tasks
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
                    fetchSessions()
                    navigate(`/cowork/${session.id}`)
                }}
            />
        </MainCard>
    )
}
export default CoworkSessions
