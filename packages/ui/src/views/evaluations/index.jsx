import { useEffect, useState, useCallback } from 'react'
import * as PropTypes from 'prop-types'
import moment from 'moment/moment'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// material-ui
import {
    Checkbox,
    Skeleton,
    Box,
    Button,
    Chip,
    Collapse,
    IconButton,
    Stack,
    ToggleButton,
    Typography,
    Tooltip,
    useTheme
} from '@mui/material'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'

// API
import evaluationApi from '@/api/evaluations'
import useApi from '@/hooks/useApi'

// Hooks
import useConfirm from '@/hooks/useConfirm'
import useNotifier from '@/utils/useNotifier'

// project
import MainCard from '@/ui-component/cards/MainCard'
import { BackdropLoader } from '@/ui-component/loading/BackdropLoader'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import CreateEvaluationDialog from '@/views/evaluations/CreateEvaluationDialog'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { DEFAULT_ITEMS_PER_PAGE } from '@/ui-component/pagination/TablePagination'

// icons
import {
    IconChartHistogram,
    IconPlus,
    IconChartBar,
    IconRefresh,
    IconTrash,
    IconX,
    IconChevronsUp,
    IconChevronsDown,
    IconPlayerPlay,
    IconPlayerPause
} from '@tabler/icons-react'
import InfiniteScrollTable from '@/ui-component/pagination/InfiniteScrollTable'

// ─── Column layout ─────────────────────────────────────────────────────────────
// Matches screenshot: Checkbox | Status | Name | Version | Metrics | Date | Dataset | Flow | Actions
const GRID_COLS = '48px 56px 160px 80px 1fr 200px 180px 160px 56px'
const CHILD_GRID_COLS = '48px 80px 200px 1fr 120px 56px'

// ─── Shared style helpers ──────────────────────────────────────────────────────

const glassCard = (isDark, extra = {}) => ({
    position: 'relative',
    border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    borderRadius: '12px',
    backdropFilter: 'blur(16px)',
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
    boxShadow: isDark ? '0 4px 24px -4px rgba(0,0,0,0.5)' : '0 4px 24px -4px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    ...extra
})

const headerCard = (isDark) => ({
    ...glassCard(isDark),
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(248,250,252,0.95)',
    borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'
})

const colHeader = (isDark) => ({
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontFamily: 'Cambria Math'
})

const bodyText = (isDark) => ({
    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
    fontSize: '0.875rem',
    fontWeight: 500
})

const subtleText = (isDark) => ({
    color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
    fontSize: '0.75rem'
})

const checkboxSx = (isDark) => ({
    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
    '&.Mui-checked': { color: isDark ? '#90CAF9' : '#1976D2' },
    padding: '4px'
})

// ─── Status dot ───────────────────────────────────────────────────────────────

const STATUS_DOT_COLOR = {
    completed: '#52b69a',
    error: '#f44336',
    pending: '#ffc107',
    default: '#bcbcbc'
}

const StatusDot = ({ status, title }) => (
    <Tooltip title={title || status} placement='top' arrow>
        <Box
            sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: STATUS_DOT_COLOR[status] ?? STATUS_DOT_COLOR.default,
                flexShrink: 0,
                boxShadow: `0 0 6px 1px ${STATUS_DOT_COLOR[status] ?? STATUS_DOT_COLOR.default}55`
            }}
        />
    </Tooltip>
)
StatusDot.propTypes = { status: PropTypes.string, title: PropTypes.string }

const getPassRateColor = (p) => (p > 90 ? '#52b69a' : p >= 50 ? '#f48c06' : '#f44336')

// ─── Skeleton row ──────────────────────────────────────────────────────────────

const SkeletonRow = ({ isDark }) => (
    <Box sx={{ ...glassCard(isDark), minHeight: '64px', display: 'flex', alignItems: 'center', px: 3, py: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: 2, alignItems: 'center', width: '100%' }}>
            <Skeleton variant='rectangular' width={18} height={18} sx={{ borderRadius: '4px' }} />
            <Skeleton variant='circular' width={14} height={14} />
            <Skeleton variant='text' width={110} height={20} />
            <Skeleton variant='text' width={30} height={20} />
            <Stack direction='row' gap={1}>
                <Skeleton variant='rectangular' width={110} height={24} sx={{ borderRadius: '16px' }} />
                <Skeleton variant='rectangular' width={130} height={24} sx={{ borderRadius: '16px' }} />
            </Stack>
            <Skeleton variant='text' width={160} height={20} />
            <Skeleton variant='rectangular' width={140} height={28} sx={{ borderRadius: '25px' }} />
            <Skeleton variant='text' width={80} height={20} />
            <Skeleton variant='circular' width={28} height={28} />
        </Box>
    </Box>
)
SkeletonRow.propTypes = { isDark: PropTypes.bool }

// ─── EvaluationRunRow ──────────────────────────────────────────────────────────

function EvaluationRunRow({ rows, item, selected, customization, onRefresh, handleSelect }) {
    const dispatch = useDispatch()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [open, setOpen] = useState(false)
    const [childSelected, setChildSelected] = useState([])

    const navigate = useNavigate()
    const { confirm } = useConfirm()
    const isDark = customization.isDarkMode

    const showResults = (row) => navigate(`/evaluation_results/${row.id}`)
    const goToDataset = (id) => window.open(`/dataset_rows/${id}`, '_blank')

    const onSelectAllChildClick = (event) => {
        setChildSelected(event.target.checked ? (rows || []).map((n) => n.id) : [])
    }

    const handleSelectChild = (event, id) => {
        const idx = childSelected.indexOf(id)
        let next = []
        if (idx === -1) next = [...childSelected, id]
        else if (idx === 0) next = childSelected.slice(1)
        else if (idx === childSelected.length - 1) next = childSelected.slice(0, -1)
        else next = [...childSelected.slice(0, idx), ...childSelected.slice(idx + 1)]
        setChildSelected(next)
    }

    const deleteChildEvaluations = async () => {
        const isConfirmed = await confirm({
            title: 'Delete',
            description: `Delete ${childSelected.length} ${childSelected.length > 1 ? 'evaluations' : 'evaluation'}?`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        })
        if (!isConfirmed) return
        try {
            const res = await evaluationApi.deleteEvaluations(childSelected)
            if (res.data) {
                enqueueSnackbar({
                    message: `${childSelected.length} evaluations deleted.`,
                    options: {
                        key: Date.now() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                setChildSelected([])
                onRefresh()
            }
        } catch (error) {
            enqueueSnackbar({
                message: `Failed to delete: ${
                    typeof error.response?.data === 'object' ? error.response.data.message : error.response?.data
                }`,
                options: {
                    key: Date.now() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
        }
    }

    const isItemSelected = selected.indexOf(item.id) !== -1
    const hasVersions = item.version > 0

    return (
        <>
            {/* ── Parent row card ───────────────────────────────────────── */}
            <Box
                sx={{
                    ...glassCard(isDark),
                    minHeight: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.25s ease',
                    animation: 'evalFloat 7s ease-in-out infinite',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isDark ? '0 12px 36px -8px rgba(0,0,0,0.7)' : '0 12px 36px -8px rgba(0,0,0,0.15)',
                        borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.15)',
                        '& .row-glow': { opacity: 1 }
                    }
                }}
            >
                {/* Hover glow */}
                <Box
                    className='row-glow'
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '12px',
                        zIndex: 0,
                        background: 'linear-gradient(135deg, rgba(60,91,164,0.15), rgba(226,42,144,0.15))',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none'
                    }}
                />

                <Box sx={{ position: 'relative', zIndex: 1, px: 3, py: 2, width: '100%' }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: 2, alignItems: 'center' }}>
                        {/* Checkbox */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Checkbox
                                color='primary'
                                checked={isItemSelected}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleSelect(e, item.id)
                                }}
                                sx={checkboxSx(isDark)}
                            />
                        </Box>

                        {/* Status dot */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <StatusDot status={item.status} title={item.status === 'error' ? item.average_metrics?.error : item.status} />
                        </Box>

                        {/* Name */}
                        <Tooltip title={item.name} placement='top' arrow>
                            <Typography
                                sx={{
                                    ...bodyText(isDark),
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {item.name}
                            </Typography>
                        </Tooltip>

                        {/* Version + expand */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={bodyText(isDark)}>{item.version}</Typography>
                            {hasVersions && (
                                <IconButton
                                    size='small'
                                    onClick={() => setOpen(!open)}
                                    sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', padding: '2px' }}
                                >
                                    {open ? <IconChevronsUp size={16} /> : <IconChevronsDown size={16} />}
                                </IconButton>
                            )}
                        </Box>

                        {/* Metrics chips */}
                        <Stack direction='row' sx={{ gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Chip
                                variant='outlined'
                                size='small'
                                color='info'
                                label={
                                    item.average_metrics?.totalRuns != null
                                        ? `Total Runs: ${item.average_metrics.totalRuns}`
                                        : 'Total Runs: N/A'
                                }
                            />
                            {item.average_metrics?.averageCost && (
                                <Chip variant='outlined' size='small' color='info' label={item.average_metrics.averageCost} />
                            )}
                            <Chip
                                variant='outlined'
                                size='small'
                                color='info'
                                label={
                                    item.average_metrics?.averageLatency != null
                                        ? `Avg Latency: ${item.average_metrics.averageLatency}ms`
                                        : 'Avg Latency: N/A'
                                }
                            />
                            {item.average_metrics?.passPcnt >= 0 && (
                                <Chip
                                    size='small'
                                    sx={{ color: 'white', backgroundColor: getPassRateColor(item.average_metrics.passPcnt) }}
                                    label={
                                        item.average_metrics.passPcnt != null
                                            ? `Pass Rate: ${item.average_metrics.passPcnt}%`
                                            : 'Pass Rate: N/A'
                                    }
                                />
                            )}
                        </Stack>

                        {/* Last Evaluated date */}
                        <Typography sx={bodyText(isDark)}>{moment(item.runDate).format('DD-MMM-YYYY, hh:mm:ss A')}</Typography>

                        {/* Dataset */}
                        <Box>
                            <Chip
                                clickable
                                size='small'
                                variant='outlined'
                                label={item.datasetName}
                                onClick={() => goToDataset(item.datasetId)}
                                sx={{
                                    borderRadius: '25px',
                                    maxWidth: '100%',
                                    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(32,40,45,0.1)'
                                }}
                            />
                        </Box>

                        {/* Flow(s) */}
                        <Box sx={{ overflow: 'hidden' }}>
                            {(item.usedFlows || []).map((flow, i) => (
                                <Typography
                                    key={i}
                                    sx={{ ...bodyText(isDark), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                    {flow}
                                </Typography>
                            ))}
                        </Box>

                        {/* View results */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title={item.status === 'pending' ? 'Results not ready yet' : 'View Results'} placement='top' arrow>
                                <span>
                                    <IconButton
                                        color='primary'
                                        size='small'
                                        disabled={item.status === 'pending'}
                                        onClick={() => showResults(item)}
                                    >
                                        <IconChartHistogram size={18} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* ── Child version rows (collapsible) ─────────────────────── */}
            <Collapse in={open} timeout='auto' unmountOnExit>
                <Box sx={{ pl: 3, display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1, mb: 0.5 }}>
                    {/* Child bulk delete */}
                    {childSelected.length > 0 && (
                        <Box>
                            <StyledButton
                                sx={{ width: 'max-content' }}
                                variant='outlined'
                                onClick={deleteChildEvaluations}
                                color='error'
                                startIcon={<IconTrash />}
                            >
                                Delete {childSelected.length} {childSelected.length === 1 ? 'evaluation' : 'evaluations'}
                            </StyledButton>
                        </Box>
                    )}

                    {/* Child header */}
                    <Box sx={{ ...headerCard(isDark), px: 3, py: 1.5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: CHILD_GRID_COLS, gap: 2, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Checkbox
                                    color='primary'
                                    size='small'
                                    indeterminate={childSelected.length > 0 && childSelected.length < (rows || []).length}
                                    checked={(rows || []).length > 0 && childSelected.length === (rows || []).length}
                                    onChange={onSelectAllChildClick}
                                    sx={checkboxSx(isDark)}
                                />
                            </Box>
                            {['Version', 'Last Run', 'Metrics', 'Status', ''].map((h) => (
                                <Typography key={h} sx={colHeader(isDark)}>
                                    {h}
                                </Typography>
                            ))}
                        </Box>
                    </Box>

                    {/* Child data rows */}
                    {(rows || []).map((child, ci) => (
                        <Box
                            key={ci}
                            sx={{
                                ...glassCard(isDark),
                                px: 3,
                                py: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: isDark ? '0 8px 24px -6px rgba(0,0,0,0.6)' : '0 8px 24px -6px rgba(0,0,0,0.12)'
                                }
                            }}
                        >
                            <Box
                                sx={{ display: 'grid', gridTemplateColumns: CHILD_GRID_COLS, gap: 2, alignItems: 'center', width: '100%' }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Checkbox
                                        color='primary'
                                        size='small'
                                        checked={childSelected.indexOf(child.id) !== -1}
                                        onChange={(e) => handleSelectChild(e, child.id)}
                                        sx={checkboxSx(isDark)}
                                    />
                                </Box>
                                <Typography sx={bodyText(isDark)}>v{child.version}</Typography>
                                <Typography sx={{ ...subtleText(isDark), fontSize: '0.8rem' }}>
                                    {moment(child.runDate).format('DD-MMM-YYYY, hh:mm A')}
                                </Typography>
                                <Stack direction='row' sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                                    <Chip
                                        variant='outlined'
                                        size='small'
                                        color='info'
                                        label={
                                            child.average_metrics?.totalRuns != null
                                                ? `Total Runs: ${child.average_metrics.totalRuns}`
                                                : 'Total Runs: N/A'
                                        }
                                    />
                                    {child.average_metrics?.averageCost && (
                                        <Chip variant='outlined' size='small' color='info' label={child.average_metrics.averageCost} />
                                    )}
                                    <Chip
                                        variant='outlined'
                                        size='small'
                                        color='info'
                                        label={
                                            child.average_metrics?.averageLatency != null
                                                ? `Avg Latency: ${child.average_metrics.averageLatency}ms`
                                                : 'Avg Latency: N/A'
                                        }
                                    />
                                    {child.average_metrics?.passPcnt >= 0 && (
                                        <Chip
                                            size='small'
                                            sx={{ color: 'white', backgroundColor: getPassRateColor(child.average_metrics.passPcnt) }}
                                            label={
                                                child.average_metrics.passPcnt != null
                                                    ? `Pass Rate: ${child.average_metrics.passPcnt}%`
                                                    : 'Pass Rate: N/A'
                                            }
                                        />
                                    )}
                                </Stack>
                                <Tooltip title={child.status === 'error' ? child.average_metrics?.error || '' : ''} placement='top' arrow>
                                    <Chip
                                        size='small'
                                        variant='outlined'
                                        label={child.status}
                                        sx={{
                                            borderRadius: '25px',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            width: 'fit-content',
                                            color: STATUS_DOT_COLOR[child.status] ?? STATUS_DOT_COLOR.default,
                                            borderColor: STATUS_DOT_COLOR[child.status] ?? STATUS_DOT_COLOR.default
                                        }}
                                    />
                                </Tooltip>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Tooltip title='View Results' placement='top' arrow>
                                        <span>
                                            <IconButton
                                                size='small'
                                                color='primary'
                                                disabled={child.status === 'pending'}
                                                onClick={() => showResults(child)}
                                            >
                                                <IconChartBar size={16} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Collapse>
        </>
    )
}

EvaluationRunRow.propTypes = {
    item: PropTypes.object,
    selected: PropTypes.array,
    rows: PropTypes.arrayOf(PropTypes.object),
    customization: PropTypes.object,
    onRefresh: PropTypes.func,
    handleSelect: PropTypes.func
}

// ─── EvalsEvaluation (main page) ──────────────────────────────────────────────

const EvalsEvaluation = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const isDark = customization.isDarkMode
    const { confirm } = useConfirm()
    const dispatch = useDispatch()
    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const createNewEvaluation = useApi(evaluationApi.createEvaluation)
    const getAllEvaluations = useApi(evaluationApi.getAllEvaluations)

    const [showNewEvaluationDialog, setShowNewEvaluationDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(false)
    const [isTableLoading, setTableLoading] = useState(false)
    const [selected, setSelected] = useState([])
    const [autoRefresh, setAutoRefresh] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageLimit, setPageLimit] = useState(DEFAULT_ITEMS_PER_PAGE)
    const [total, setTotal] = useState(0)

    const onChange = (page, limit) => {
        if (isTableLoading) return
        if (rows.length >= total) return

        setCurrentPage(page)
        setPageLimit(limit)
        refresh(page, limit)
    }

    const refresh = (page, limit) => {
        getAllEvaluations.request({
            page: page ?? currentPage,
            limit: limit ?? pageLimit
        })
    }

    const latestRows = rows.filter((item) => item?.latestEval)

    const onSelectAllClick = (event) => {
        setSelected(event.target.checked ? latestRows.map((n) => n.id) : [])
    }

    const handleSelect = (event, id) => {
        const idx = selected.indexOf(id)
        let next = []
        if (idx === -1) next = [...selected, id]
        else if (idx === 0) next = selected.slice(1)
        else if (idx === selected.length - 1) next = selected.slice(0, -1)
        else next = [...selected.slice(0, idx), ...selected.slice(idx + 1)]
        setSelected(next)
    }

    const createEvaluation = () => {
        setDialogProps({ type: 'ADD', cancelButtonName: 'Cancel', confirmButtonName: 'Start New Evaluation', data: {} })
        setShowNewEvaluationDialog(true)
    }

    const deleteEvaluationsAllVersions = async () => {
        const isConfirmed = await confirm({
            title: 'Delete',
            description: `Delete ${selected.length} ${selected.length > 1 ? 'evaluations' : 'evaluation'}? This will delete all versions.`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        })
        if (!isConfirmed) return
        try {
            const res = await evaluationApi.deleteEvaluations(selected, true)
            if (res.data) {
                enqueueSnackbar({
                    message: `${selected.length} ${selected.length > 1 ? 'evaluations' : 'evaluation'} deleted`,
                    options: {
                        key: Date.now() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                onRefresh()
            }
        } catch (error) {
            enqueueSnackbar({
                message: `Failed to delete: ${
                    typeof error.response?.data === 'object' ? error.response.data.message : error.response?.data
                }`,
                options: {
                    key: Date.now() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
        }
        setSelected([])
    }

    const processEvalRows = (evalRows) =>
        evalRows.map((evalRow) => ({
            ...evalRow,
            average_metrics:
                typeof evalRow.average_metrics === 'object' ? evalRow.average_metrics : JSON.parse(evalRow.average_metrics || '{}'),
            usedFlows: typeof evalRow.chatflowName === 'object' ? evalRow.chatflowName : JSON.parse(evalRow.chatflowName || '[]'),
            chatIds: typeof evalRow.chatflowId === 'object' ? evalRow.chatflowId : JSON.parse(evalRow.chatflowId || '[]')
        }))

    useEffect(() => {
        refresh(currentPage, pageLimit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (getAllEvaluations.data) {
            const newData = getAllEvaluations.data
            const evalRows = newData.data

            setTotal(newData.total)

            if (evalRows) {
                const processed = processEvalRows(evalRows)

                setRows((prev) => {
                    if (currentPage === 1) {
                        return processed
                    }
                    return [...prev, ...processed]
                })
            }
        }
    }, [getAllEvaluations.data])

    useEffect(() => {
        if (createNewEvaluation.data) setRows(processEvalRows(createNewEvaluation.data))
        setLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createNewEvaluation.data])

    const onConfirm = (evaluationData) => {
        setShowNewEvaluationDialog(false)
        setLoading(true)
        createNewEvaluation.request(evaluationData)
    }

    useEffect(() => {
        if (createNewEvaluation.error) {
            enqueueSnackbar({
                message: `Failed to create evaluation: ${
                    typeof createNewEvaluation.error.response?.data === 'object'
                        ? createNewEvaluation.error.response.data.message
                        : createNewEvaluation.error.response?.data || createNewEvaluation.error.message || 'Unknown error'
                }`,
                options: {
                    key: Date.now() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createNewEvaluation.error])

    const onRefresh = useCallback(() => {
        refresh(currentPage, pageLimit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getAllEvaluations])

    useEffect(() => {
        setTableLoading(getAllEvaluations.loading)
    }, [getAllEvaluations.loading])

    useEffect(() => {
        let id = null
        if (autoRefresh) id = setInterval(onRefresh, 5000)
        return () => {
            if (id) clearInterval(id)
        }
    }, [autoRefresh, onRefresh])

    return (
        <>
            <MainCard>
                <Stack flexDirection='column' sx={{ gap: 3 }}>
                    <ViewHeader isBackButton={false} isEditButton={false} search={false} title='Evaluations' description=''>
                        <ToggleButton
                            value='auto-refresh'
                            selected={autoRefresh}
                            onChange={() => setAutoRefresh(!autoRefresh)}
                            size='small'
                            title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh (every 5s)'}
                            sx={{
                                borderRadius: 2,
                                height: '100%',
                                backgroundColor: 'transparent',
                                color: autoRefresh ? '#ff9800' : '#4caf50',
                                border: '1px solid transparent',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid transparent' },
                                '&.Mui-selected': { backgroundColor: 'transparent', color: '#ff9800', border: '1px solid transparent' }
                            }}
                        >
                            {autoRefresh ? <IconPlayerPause /> : <IconPlayerPlay />}
                        </ToggleButton>
                        <IconButton
                            onClick={onRefresh}
                            title='Refresh'
                            sx={{
                                borderRadius: 2,
                                height: '100%',
                                color: theme.palette.secondary.main,
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: theme.palette.secondary.dark }
                            }}
                        >
                            <IconRefresh />
                        </IconButton>
                        <StyledButton
                            permissionId='evaluations:create'
                            sx={{ borderRadius: 2, height: '100%' }}
                            onClick={createEvaluation}
                            startIcon={<IconPlus />}
                        >
                            New Evaluation
                        </StyledButton>
                    </ViewHeader>

                    {selected.length > 0 && (
                        <StyledButton
                            permissionId='evaluations:delete'
                            sx={{ mt: 1, mb: 1, width: 'max-content' }}
                            variant='outlined'
                            onClick={deleteEvaluationsAllVersions}
                            color='error'
                            startIcon={<IconTrash />}
                        >
                            Delete {selected.length} {selected.length === 1 ? 'evaluation' : 'evaluations'}
                        </StyledButton>
                    )}

                    {!isTableLoading && latestRows.length === 0 ? (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 8 }}>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', fontSize: '0.95rem' }}>
                                No Evaluations Yet
                            </Typography>
                        </Stack>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {/* ── Header ──────────────────────────────────── */}
                                <Box sx={{ ...headerCard(isDark), px: 3, py: 2 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: 2, alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Checkbox
                                                color='primary'
                                                indeterminate={selected.length > 0 && selected.length < latestRows.length}
                                                checked={latestRows.length > 0 && selected.length === latestRows.length}
                                                onChange={onSelectAllClick}
                                                sx={checkboxSx(isDark)}
                                            />
                                        </Box>
                                        {['Status', 'Name', 'Ver.', 'Average Metrics', 'Last Evaluated', 'Dataset', 'Flow(s)', ''].map(
                                            (h) => (
                                                <Typography key={h} sx={colHeader(isDark)}>
                                                    {h}
                                                </Typography>
                                            )
                                        )}
                                    </Box>
                                </Box>

                                {/* ── Rows ────────────────────────────────────── */}
                                {isTableLoading
                                    ? [...Array(4)].map((_, i) => <SkeletonRow key={i} isDark={isDark} />)
                                    : latestRows.map((item, index) => (
                                          <EvaluationRunRow
                                              key={index}
                                              rows={rows.filter((row) => row.name === item.name)}
                                              item={item}
                                              selected={selected}
                                              customization={customization}
                                              onRefresh={onRefresh}
                                              handleSelect={handleSelect}
                                          />
                                      ))}
                            </Box>
                            <InfiniteScrollTable limit={pageLimit} total={total} onLoadMore={onChange} />{' '}
                        </>
                    )}
                </Stack>
            </MainCard>

            {showNewEvaluationDialog && (
                <CreateEvaluationDialog
                    show={showNewEvaluationDialog}
                    dialogProps={dialogProps}
                    onCancel={() => setShowNewEvaluationDialog(false)}
                    onConfirm={onConfirm}
                />
            )}
            <ConfirmDialog />
            {loading && <BackdropLoader open={loading} />}

            <style>{`
                @keyframes evalFloat {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-3px); }
                }
            `}</style>
        </>
    )
}

export default EvalsEvaluation
