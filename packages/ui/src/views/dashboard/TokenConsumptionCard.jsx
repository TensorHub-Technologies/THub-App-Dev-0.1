import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, Box, Typography, LinearProgress, Button, CircularProgress, Grid, Chip } from '@mui/material'
import { IconChartBar, IconHistory } from '@tabler/icons-react'
import LatencyMetricsCard from './LatencyMetricsCard'

const EXECUTIONS_PAGE_SIZE = 4
const MODELS_PER_PAGE = 4

/* ---------------- HELPERS ---------------- */

const formatTimeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin} min ago`

    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr} hr ago`

    const diffDay = Math.floor(diffHr / 24)
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
}

const getStatusColor = (state) => {
    switch (state) {
        case 'FINISHED':
            return 'success'
        case 'RUNNING':
            return 'warning'
        case 'FAILED':
        case 'ERROR':
            return 'error'
        default:
            return 'default'
    }
}

const TokenConsumptionCard = ({ tenantId, executionsApi, useApi }) => {
    const getAllExecutions = useApi(executionsApi.getAllExecutions)

    const [executionsSnapshot, setExecutionsSnapshot] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [isFetchingAll, setIsFetchingAll] = useState(true)
    const [visibleModels, setVisibleModels] = useState(MODELS_PER_PAGE)
    const [hasShownInitial, setHasShownInitial] = useState(false)

    /* 🔹 Fake loading progress for bars */
    const [loadingProgress, setLoadingProgress] = useState(40)

    /* ---------------- INITIAL API CALL ---------------- */
    useEffect(() => {
        if (!tenantId) return

        setExecutionsSnapshot([])
        setCurrentPage(1)
        setIsFetchingAll(true)
        setHasShownInitial(false)
        setLoadingProgress(40)

        getAllExecutions.request({
            page: 1,
            limit: EXECUTIONS_PAGE_SIZE,
            tenantId
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId])

    /* ---------------- FETCH ALL EXECUTIONS ---------------- */
    useEffect(() => {
        if (!getAllExecutions.data || !isFetchingAll) return

        const { data, total } = getAllExecutions.data
        if (!Array.isArray(data)) return

        setExecutionsSnapshot((prev) => {
            const merged = [...prev, ...data]

            if (!hasShownInitial) {
                setHasShownInitial(true)
            }

            if (merged.length < total) {
                const nextPage = currentPage + 1
                setCurrentPage(nextPage)

                getAllExecutions.request({
                    page: nextPage,
                    limit: EXECUTIONS_PAGE_SIZE,
                    tenantId
                })
            } else {
                setIsFetchingAll(false)
            }

            return merged
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getAllExecutions.data])

    /* ---------------- ANIMATE PROGRESS BAR ---------------- */
    useEffect(() => {
        if (!hasShownInitial) return

        if (!isFetchingAll) {
            setLoadingProgress(100)
            return
        }

        const interval = setInterval(() => {
            setLoadingProgress((prev) => {
                if (prev >= 90) return prev
                return prev + Math.floor(Math.random() * 8) + 3
            })
        }, 800)

        return () => clearInterval(interval)
    }, [hasShownInitial, isFetchingAll])

    /* ---------------- AGGREGATE TOKENS ---------------- */
    const tokenData = useMemo(() => {
        const modelMap = {}

        executionsSnapshot.forEach((execution) => {
            execution.agentTokens?.forEach((agent) => {
                agent.models?.forEach((model) => {
                    const key = model.modelName

                    if (!modelMap[key]) {
                        modelMap[key] = {
                            modelName: model.modelName,
                            agentModel: agent.agentModel,
                            tokens: 0
                        }
                    }

                    modelMap[key].tokens += model.tokens
                })
            })
        })

        return Object.values(modelMap)
    }, [executionsSnapshot])

    const visibleTokenData = useMemo(() => tokenData.slice(0, visibleModels), [tokenData, visibleModels])

    const handleShowMoreModels = () => {
        setVisibleModels((prev) => prev + MODELS_PER_PAGE)
    }

    /* ---------------- UI ---------------- */
    return (
        <Grid container spacing={3}>
            {/* LEFT — Token Consumption */}
            <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <CardContent>
                        <Box display='flex' alignItems='center' mb={2}>
                            <IconChartBar size={24} style={{ marginRight: 8 }} />
                            <Typography variant='h6'>Token Consumption</Typography>
                        </Box>

                        {!hasShownInitial && (
                            <Box display='flex' justifyContent='center' py={4}>
                                <CircularProgress size={28} />
                            </Box>
                        )}

                        {hasShownInitial &&
                            visibleTokenData.map((item) => (
                                <Box key={item.modelName} mb={3}>
                                    <Box display='flex' justifyContent='space-between' mb={1}>
                                        <Typography variant='body2'>{item.modelName}</Typography>
                                        <Typography variant='body2'>{item.tokens.toLocaleString()} tokens</Typography>
                                    </Box>

                                    <LinearProgress
                                        variant='determinate'
                                        value={isFetchingAll ? loadingProgress : 100}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: '#e0e0e0',
                                            transition: 'all 0.6s ease',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: item.agentModel === 'chatGoogleGenerativeAI' ? '#FF9800' : '#4CAF50'
                                            }
                                        }}
                                    />

                                    {isFetchingAll && (
                                        <Typography variant='caption' color='text.secondary' mt={0.5} display='block'>
                                            Calculating usage…
                                        </Typography>
                                    )}
                                </Box>
                            ))}

                        {hasShownInitial && tokenData.length > visibleModels && (
                            <Button variant='outlined' size='small' fullWidth onClick={handleShowMoreModels}>
                                Show More
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* RIGHT — Latency Metrics */}
            <Grid item xs={12} md={6}>
                <LatencyMetricsCard executions={executionsSnapshot} isLoading={!hasShownInitial} />
            </Grid>

            {/* RIGHT — Last Agent Executions */}
            <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <CardContent>
                        <Box display='flex' alignItems='center' mb={2}>
                            <IconHistory size={24} style={{ marginRight: 8 }} />
                            <Typography variant='h6'>Last Agent Executions</Typography>
                        </Box>

                        {!hasShownInitial ? (
                            <Box display='flex' justifyContent='center' py={4}>
                                <CircularProgress size={28} />
                            </Box>
                        ) : executionsSnapshot.length === 0 ? (
                            <Typography variant='body2' color='text.secondary'>
                                No executions found
                            </Typography>
                        ) : (
                            executionsSnapshot.slice(0, 4).map((exec) => (
                                <Box key={exec.id} display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                                    <Box>
                                        <Typography variant='body2' fontWeight='bold'>
                                            {exec.agentflow?.name || 'Unknown Agent'}
                                        </Typography>
                                        <Typography variant='caption' color='text.secondary'>
                                            {formatTimeAgo(exec.createdDate)}
                                        </Typography>
                                    </Box>

                                    <Chip label={exec.state} size='small' color={getStatusColor(exec.state)} />
                                </Box>
                            ))
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

/* ---------------- PROPS VALIDATION ---------------- */

TokenConsumptionCard.propTypes = {
    tenantId: PropTypes.string.isRequired,
    executionsApi: PropTypes.shape({
        getAllExecutions: PropTypes.func.isRequired
    }).isRequired,
    useApi: PropTypes.func.isRequired
}

TokenConsumptionCard.defaultProps = {}

export default TokenConsumptionCard
