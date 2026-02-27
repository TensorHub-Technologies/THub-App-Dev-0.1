import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, Box, Typography, CircularProgress } from '@mui/material'
import { IconClock } from '@tabler/icons-react'

const LatencyMetricsCard = ({ executions, isLoading }) => {
    /* ---------------- HELPERS ---------------- */

    const percentile = (arr, p) => {
        if (!arr.length) return 0
        const sorted = [...arr].sort((a, b) => a - b)
        const index = Math.ceil((p / 100) * sorted.length) - 1
        return sorted[Math.max(index, 0)]
    }

    // Format milliseconds → "X min Y sec" / "Y sec" / "Z ms"
    const formatLatency = (ms) => {
        if (ms < 1000) {
            return `${ms} ms`
        }

        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60

        if (minutes > 0) {
            return `${minutes} min ${seconds} sec`
        }

        return `${seconds} sec`
    }

    /* ---------------- COMPUTE METRICS ---------------- */
    const latencyData = useMemo(() => {
        if (!executions.length) {
            return {
                avg: 0,
                p95: 0,
                p99: 0,
                topAgents: []
            }
        }

        const latencies = executions.map((e) => e.total_time).filter((t) => typeof t === 'number')

        const avg = latencies.reduce((sum, v) => sum + v, 0) / latencies.length

        const p95 = percentile(latencies, 95)
        const p99 = percentile(latencies, 99)

        const agentMap = {}

        executions.forEach((e) => {
            const agentName = e.agentflow?.name || 'Unknown Agent'
            const latency = e.total_time

            if (typeof latency !== 'number') return

            if (!agentMap[agentName]) {
                agentMap[agentName] = {
                    name: agentName,
                    total: 0,
                    count: 0
                }
            }

            agentMap[agentName].total += latency
            agentMap[agentName].count += 1
        })

        const topAgents = Object.values(agentMap)
            .map((a) => ({
                name: a.name,
                latency: Math.round(a.total / a.count)
            }))
            .sort((a, b) => b.latency - a.latency)
            .slice(0, 3)

        return {
            avg: Math.round(avg),
            p95,
            p99,
            topAgents
        }
    }, [executions])

    /* ---------------- UI ---------------- */
    return (
        <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <CardContent>
                <Box display='flex' alignItems='center' mb={2}>
                    <IconClock size={24} style={{ marginRight: 8 }} />
                    <Typography variant='h6'>Latency Metrics</Typography>
                </Box>

                {isLoading ? (
                    <Box display='flex' justifyContent='center' alignItems='center' py={4}>
                        <CircularProgress size={28} />
                    </Box>
                ) : (
                    <>
                        <Box display='flex' justifyContent='space-around' mb={3}>
                            <Box textAlign='center'>
                                <Typography variant='h4'>{formatLatency(latencyData.avg)}</Typography>
                                <Typography variant='caption' color='text.secondary'>
                                    Average
                                </Typography>
                            </Box>

                            <Box textAlign='center'>
                                <Typography variant='h4'>{formatLatency(latencyData.p95)}</Typography>
                                <Typography variant='caption' color='text.secondary'>
                                    P95
                                </Typography>
                            </Box>

                            <Box textAlign='center'>
                                <Typography variant='h4'>{formatLatency(latencyData.p99)}</Typography>
                                <Typography variant='caption' color='text.secondary'>
                                    P99
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant='subtitle2' mb={1}>
                            Top Agents
                        </Typography>

                        {latencyData.topAgents.map((agent) => (
                            <Box key={agent.name} display='flex' justifyContent='space-between' mb={1}>
                                <Typography variant='body2'>{agent.name}</Typography>
                                <Typography variant='body2' color='primary'>
                                    {formatLatency(agent.latency)}
                                </Typography>
                            </Box>
                        ))}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

/* ---------------- PROPS VALIDATION ---------------- */

LatencyMetricsCard.propTypes = {
    executions: PropTypes.arrayOf(
        PropTypes.shape({
            total_time: PropTypes.number,
            agentflow: PropTypes.shape({
                name: PropTypes.string
            })
        })
    ).isRequired,
    isLoading: PropTypes.bool
}

LatencyMetricsCard.defaultProps = {
    executions: [],
    isLoading: false
}

export default LatencyMetricsCard
