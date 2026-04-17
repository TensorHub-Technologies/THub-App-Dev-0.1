import { useEffect, useState, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// material-ui
import {
    Box,
    Stack,
    TextField,
    MenuItem,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
    useTheme,
    CircularProgress
} from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ErrorBoundary from '@/ErrorBoundary'
import ViewHeader from '@/layout/MainLayout/ViewHeader'

// API
import useApi from '@/hooks/useApi'
import executionsApi from '@/api/executions'
import { useSelector } from 'react-redux'

// icons
import { IconTrash } from '@tabler/icons-react'

// const
import { ExecutionsListTable } from '@/ui-component/table/ExecutionsListTable'
import { ExecutionDetails } from './ExecutionDetails'
import { omit } from 'lodash'

// ==============================|| AGENT EXECUTIONS ||============================== //

const ITEMS_PER_PAGE = 10

const getExecutionTimestamp = (value) => {
    const parsed = new Date(value).getTime()
    return Number.isNaN(parsed) ? 0 : parsed
}

const sortExecutionsByDate = (items = []) => {
    return [...items].sort((a, b) => {
        const updatedDiff = getExecutionTimestamp(b?.updatedDate) - getExecutionTimestamp(a?.updatedDate)
        if (updatedDiff !== 0) return updatedDiff

        const createdDiff = getExecutionTimestamp(b?.createdDate) - getExecutionTimestamp(a?.createdDate)
        if (createdDiff !== 0) return createdDiff

        return (b?.id || '').localeCompare(a?.id || '')
    })
}

const mergeExecutionsById = (previous = [], incoming = []) => {
    const mergedById = new Map()
    ;[...previous, ...incoming].forEach((execution) => {
        if (execution?.id) mergedById.set(execution.id, execution)
    })
    return sortExecutionsByDate(Array.from(mergedById.values()))
}

const AgentExecutions = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const borderColor = theme.palette.grey[900] + 25
    const userData = useSelector((state) => state.user.userData)
    const tenantId = userData?.uid || localStorage.getItem('userId')

    const getAllExecutions = useApi(executionsApi.getAllExecutions)
    const deleteExecutionsApi = useApi(executionsApi.deleteExecutions)
    const getExecutionByIdApi = useApi(executionsApi.getExecutionById)

    const [error, setError] = useState(null)
    const [isLoading, setLoading] = useState(true)
    const [isLoadingMore, setLoadingMore] = useState(false)
    const [executions, setExecutions] = useState([])
    const [openDrawer, setOpenDrawer] = useState(false)
    const [selectedExecutionData, setSelectedExecutionData] = useState([])
    const [selectedMetadata, setSelectedMetadata] = useState({})
    const [selectedExecutionIds, setSelectedExecutionIds] = useState([])
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState({
        state: '',
        startDate: null,
        endDate: null,
        agentflowId: '',
        sessionId: ''
    })

    const handleFilterChange = (field, value) => {
        setFilters({
            ...filters,
            [field]: value
        })
    }

    const onDateChange = (field, date) => {
        const updatedDate = new Date(date)
        updatedDate.setHours(0, 0, 0, 0)

        setFilters({
            ...filters,
            [field]: updatedDate
        })
    }

    const buildRequestParams = (page) => {
        const params = {
            page,
            limit: ITEMS_PER_PAGE,
            tenantId
        }

        if (filters.state) params.state = filters.state

        // Create date strings that preserve the exact date values
        if (filters.startDate) {
            const date = new Date(filters.startDate)
            // Format date as YYYY-MM-DD and set to start of day in UTC
            // This ensures the server sees the same date we've selected regardless of timezone
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            params.startDate = `${year}-${month}-${day}T00:00:00.000Z`
        }

        if (filters.endDate) {
            const date = new Date(filters.endDate)
            // Format date as YYYY-MM-DD and set to end of day in UTC
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            params.endDate = `${year}-${month}-${day}T23:59:59.999Z`
        }

        if (filters.agentflowId) params.agentflowId = filters.agentflowId
        if (filters.sessionId) params.sessionId = filters.sessionId

        return params
    }

    const applyFilters = (isNewSearch = false) => {
        // Reset pagination for new search/filter
        setCurrentPage(1)
        setExecutions([])
        setHasMore(true)
        setLoading(true)

        const params = buildRequestParams(1)
        getAllExecutions.request(params)
    }

    const loadMore = useCallback(() => {
        if (!isLoading && !isLoadingMore && hasMore) {
            const nextPage = currentPage + 1
            setCurrentPage(nextPage)
            setLoadingMore(true)

            const params = buildRequestParams(nextPage)
            getAllExecutions.request(params)
        }
    }, [currentPage, hasMore, isLoading, isLoadingMore, filters])

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
            loadMore()
        }
    }, [loadMore])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    const resetFilters = () => {
        setFilters({
            state: '',
            startDate: null,
            endDate: null,
            agentflowId: '',
            sessionId: ''
        })
        // Reset pagination and load fresh data
        setCurrentPage(1)
        setExecutions([])
        setHasMore(true)
        setLoading(true)
        getAllExecutions.request({ page: 1, limit: ITEMS_PER_PAGE, tenantId })
    }

    const handleExecutionSelectionChange = (selectedIds) => {
        setSelectedExecutionIds(selectedIds)
    }

    const handleDeleteDialogOpen = () => {
        if (selectedExecutionIds.length > 0) {
            setOpenDeleteDialog(true)
        }
    }

    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false)
    }

    const handleDeleteExecutions = () => {
        deleteExecutionsApi.request(selectedExecutionIds)
        setOpenDeleteDialog(false)
    }

    useEffect(() => {
        // Initial load
        getAllExecutions.request({ page: 1, limit: ITEMS_PER_PAGE, tenantId })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (getAllExecutions.data) {
            try {
                const { data, total: totalCount } = getAllExecutions.data
                if (!Array.isArray(data)) return

                if (currentPage === 1) {
                    setExecutions(mergeExecutionsById([], data))
                } else {
                    setExecutions((prevExecutions) => mergeExecutionsById(prevExecutions, data))
                }

                setTotal(totalCount)
            } catch (e) {
                console.error(e)
            }
        }
    }, [getAllExecutions.data, currentPage])

    useEffect(() => {
        setHasMore(executions.length < total)
    }, [executions.length, total])

    useEffect(() => {
        if (currentPage === 1) {
            setLoading(getAllExecutions.loading)
        } else {
            setLoadingMore(getAllExecutions.loading)
        }
    }, [getAllExecutions.loading, currentPage])

    useEffect(() => {
        setError(getAllExecutions.error)
    }, [getAllExecutions.error])

    useEffect(() => {
        if (deleteExecutionsApi.data) {
            // Refresh the executions list - reset to first page
            setCurrentPage(1)
            setExecutions([])
            setHasMore(true)
            const params = buildRequestParams(1)
            getAllExecutions.request(params)
            setSelectedExecutionIds([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deleteExecutionsApi.data])

    useEffect(() => {
        if (getExecutionByIdApi.data) {
            const execution = getExecutionByIdApi.data
            const executionDetails =
                typeof execution.executionData === 'string' ? JSON.parse(execution.executionData) : execution.executionData
            setSelectedExecutionData(executionDetails)
            setSelectedMetadata(omit(execution, ['executionData']))
        }
    }, [getExecutionByIdApi.data])

    const hasExecutions = executions && executions.length > 0

    console.log('getAllExecutions', getAllExecutions)

    return (
        <MainCard>
            {error ? (
                <ErrorBoundary error={error} />
            ) : (
                <Stack flexDirection='column' sx={{ gap: 3 }}>
                    <ViewHeader title='Agent Executions' description='Monitor and manage agentflows executions' />

                    {/* Filter Section */}
                    <Box sx={{ mb: 2, width: '100%' }}>
                        <Grid container spacing={2} alignItems='center'>
                            <Grid item xs={12} md={2.5}>
                                <FormControl
                                    variant='standard'
                                    sx={{
                                        minWidth: 180,
                                        height: 40,

                                        '& .MuiInput-underline:before': {
                                            borderBottom: '2px solid black',
                                            borderBottomColor: customization?.isDarkMode ? 'white' : 'black'
                                        },
                                        '& .MuiInput-underline:after': {
                                            borderBottomColor: customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
                                        }
                                    }}
                                >
                                    <InputLabel id='state-select-label'>State</InputLabel>
                                    <Select
                                        labelId='standard'
                                        value={filters.state}
                                        label='State'
                                        onChange={(e) => handleFilterChange('state', e.target.value)}
                                        size='small'
                                        sx={{
                                            height: 40,
                                            borderRadius: 2,
                                            color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                                            '& .MuiSvgIcon-root': {
                                                color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
                                            }
                                        }}
                                    >
                                        <MenuItem value=''>All</MenuItem>
                                        <MenuItem value='INPROGRESS'>In Progress</MenuItem>
                                        <MenuItem value='FINISHED'>Finished</MenuItem>
                                        <MenuItem value='ERROR'>Error</MenuItem>
                                        <MenuItem value='TERMINATED'>Terminated</MenuItem>
                                        <MenuItem value='TIMEOUT'>Timeout</MenuItem>
                                        <MenuItem value='STOPPED'>Stopped</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <DatePicker
                                    selected={filters.startDate}
                                    onChange={(date) => onDateChange('startDate', date)}
                                    selectsStart
                                    startDate={filters.startDate}
                                    className='form-control'
                                    wrapperClassName='datePicker'
                                    maxDate={new Date()}
                                    customInput={
                                        <TextField
                                            id='standard-basic'
                                            variant='standard'
                                            size='small'
                                            label='Start date'
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: borderColor
                                                }
                                            }}
                                            InputProps={{
                                                disableUnderline: true,
                                                sx: {
                                                    borderBottom: customization.isDarkMode ? '2px solid #fff' : '2px solid #000',
                                                    '&:hover': {
                                                        borderBottom: customization.isDarkMode ? '2px solid #e22a90' : '2px solid #3c5ba4'
                                                    }
                                                }
                                            }}
                                        />
                                    }
                                />
                            </Grid>
                            <Grid sx={{ ml: -1 }} item xs={12} md={2.5}>
                                <DatePicker
                                    selected={filters.endDate}
                                    onChange={(date) => onDateChange('endDate', date)}
                                    selectsEnd
                                    endDate={filters.endDate}
                                    className='form-control'
                                    wrapperClassName='datePicker'
                                    minDate={filters.startDate}
                                    maxDate={new Date()}
                                    customInput={
                                        <TextField
                                            id='standard-basic'
                                            variant='standard'
                                            size='small'
                                            label='End date'
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: borderColor
                                                }
                                            }}
                                            InputProps={{
                                                disableUnderline: true,
                                                sx: {
                                                    borderBottom: customization.isDarkMode ? '2px solid #fff' : '2px solid #000',
                                                    '&:hover': {
                                                        borderBottom: customization.isDarkMode ? '2px solid #e22a90' : '2px solid #3c5ba4'
                                                    }
                                                }
                                            }}
                                        />
                                    }
                                />
                            </Grid>
                            <Grid sx={{ ml: -1 }} item xs={12} md={2.5}>
                                <TextField
                                    fullWidth
                                    id='standard-basic'
                                    variant='standard'
                                    label='Session ID'
                                    value={filters.sessionId}
                                    onChange={(e) => handleFilterChange('sessionId', e.target.value)}
                                    size='small'
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: borderColor
                                        }
                                    }}
                                    InputProps={{
                                        disableUnderline: true,
                                        sx: {
                                            borderBottom: customization.isDarkMode ? '2px solid #fff' : '2px solid #000',
                                            '&:hover': {
                                                borderBottom: customization.isDarkMode ? '2px solid #e22a90' : '2px solid #3c5ba4'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Stack direction='row' spacing={1}>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        sx={{ bgcolor: customization?.isDarkMode ? '#E22A90' : '#3C5BA4' }}
                                        onClick={() => applyFilters(true)}
                                        size='medium'
                                    >
                                        Apply
                                    </Button>
                                    <Button
                                        variant='outlined'
                                        onClick={resetFilters}
                                        size='medium'
                                        sx={{
                                            color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                                            borderColor: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                                            '&:hover': {
                                                borderColor: customization?.isDarkMode ? '#c21875' : '#2c437f',
                                                backgroundColor: 'transparent' // optional: prevents gray hover bg
                                            }
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <Tooltip title='Delete selected executions'>
                                        <span>
                                            <IconButton
                                                sx={{ height: 40, width: 40 }}
                                                size='small'
                                                color='error'
                                                onClick={handleDeleteDialogOpen}
                                                edge='end'
                                                disabled={selectedExecutionIds.length === 0}
                                            >
                                                <IconTrash />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>

                    <ExecutionsListTable
                        data={executions}
                        isLoading={isLoading}
                        onSelectionChange={handleExecutionSelectionChange}
                        onExecutionRowClick={(execution) => {
                            setOpenDrawer(true)
                            // Clear previous execution data while loading the new one
                            setSelectedExecutionData(null)
                            setSelectedMetadata(omit(execution, ['executionData']))
                            getExecutionByIdApi.request(execution.id)
                        }}
                    />

                    {/* Loading indicators */}
                    {isLoading && (
                        <Box display='flex' justifyContent='center' sx={{ mt: 2 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {isLoadingMore && (
                        <Box display='flex' justifyContent='center' sx={{ mt: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {!hasMore && hasExecutions && (
                        <Box display='flex' justifyContent='center' sx={{ mt: 2, color: 'text.secondary' }}>
                            No more executions to load
                        </Box>
                    )}

                    <ExecutionDetails
                        open={openDrawer}
                        isLoading={getExecutionByIdApi.loading}
                        execution={selectedExecutionData}
                        metadata={selectedMetadata}
                        onClose={() => setOpenDrawer(false)}
                        onProceedSuccess={() => {
                            setOpenDrawer(false)
                            // Reset and reload data
                            setCurrentPage(1)
                            setExecutions([])
                            setHasMore(true)
                            const params = buildRequestParams(1)
                            getAllExecutions.request(params)
                        }}
                        onUpdateSharing={() => {
                            // Reset and reload data
                            setCurrentPage(1)
                            setExecutions([])
                            setHasMore(true)
                            const params = buildRequestParams(1)
                            getAllExecutions.request(params)
                        }}
                        onRefresh={(executionId) => {
                            // Reset and reload data
                            setCurrentPage(1)
                            setExecutions([])
                            setHasMore(true)
                            const params = buildRequestParams(1)
                            getAllExecutions.request(params)
                            getExecutionByIdApi.request(executionId)
                        }}
                    />

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        open={openDeleteDialog}
                        onClose={handleDeleteDialogClose}
                        aria-labelledby='alert-dialog-title'
                        aria-describedby='alert-dialog-description'
                    >
                        <DialogTitle id='alert-dialog-title'>Confirm Deletion</DialogTitle>
                        <DialogContent>
                            <DialogContentText id='alert-dialog-description'>
                                Are you sure you want to delete {selectedExecutionIds.length} execution
                                {selectedExecutionIds.length !== 1 ? 's' : ''}? This action cannot be undone.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDeleteDialogClose} color='primary'>
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteExecutions} color='error'>
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {!isLoading && !hasExecutions && (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                            <Box sx={{ p: 2, height: 'auto' }}>
                                {/* <img
                                    style={{ objectFit: 'cover', height: '20vh', width: 'auto' }}
                                    src={execution_empty}
                                    alt='execution_empty'
                                /> */}
                            </Box>
                            <div>No Executions Yet</div>
                        </Stack>
                    )}
                </Stack>
            )}
        </MainCard>
    )
}

export default AgentExecutions
