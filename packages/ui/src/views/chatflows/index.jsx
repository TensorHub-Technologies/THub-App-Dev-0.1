// packages/ui/src/views/chatflows/index.jsx
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// material-ui
import {
    Box,
    Skeleton,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    FormControl,
    Select,
    MenuItem,
    CircularProgress,
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ItemCard from '@/ui-component/cards/ItemCard'
import { gridSpacing } from '@/store/constant'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import { FlowListTable } from '@/ui-component/table/FlowListTable'
import { StyledButton } from '@/ui-component/button/StyledButton'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'
import emptyImage from '../../assets/images/glass.svg'
import emptyImagelite from '../../assets/images/glass-lite.svg'

// API
import chatflowsApi from '@/api/chatflows'

// Hooks

// const
import { baseURL } from '@/store/constant'

// icons
import { IconPlus, IconLayoutGrid, IconList } from '@tabler/icons-react'
import { useSelector } from 'react-redux'
import useInfiniteScroll from './useInfiniteScroll'

// ==============================|| CHATFLOWS ||============================== //

const Chatflows = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const userData = useSelector((state) => state.user.userData)
    const tenantId = userData?.uid || localStorage.getItem('userId')

    // State for pagination and data
    const [chatflows, setChatflows] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    // Other state
    const [images, setImages] = useState({})
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('updated')
    const [loginDialogOpen, setLoginDialogOpen] = useState(false)
    const [loginDialogProps, setLoginDialogProps] = useState({})
    const [view, setView] = useState(localStorage.getItem('flowDisplayStyle') || 'card')

    // Process images for chatflows
    const processImages = useCallback((chatflowsData) => {
        const newImages = {}
        chatflowsData.forEach((chatflow) => {
            try {
                const flowDataStr = chatflow.flowData
                const flowData = JSON.parse(flowDataStr)
                const nodes = flowData.nodes || []
                newImages[chatflow.id] = []

                nodes.forEach((node) => {
                    const imageSrc = `${baseURL}/api/v1/node-icon/${node.data.name}`
                    if (!newImages[chatflow.id].includes(imageSrc)) {
                        newImages[chatflow.id].push(imageSrc)
                    }
                })
            } catch (e) {
                console.error('Error processing images for chatflow:', chatflow.id, e)
                newImages[chatflow.id] = []
            }
        })
        return newImages
    }, [])

    // Load chatflows function
    const loadChatflows = useCallback(
        async (page = 1, isAppend = false) => {
            try {
                if (page === 1) {
                    setIsLoading(true)
                } else {
                    setIsLoadingMore(true)
                }

                const response = await chatflowsApi.getAllChatflows(tenantId, page, 12)
                const { data, totalPages: newTotalPages, hasNextPage } = response.data

                if (isAppend) {
                    setChatflows((prev) => [...prev, ...data])
                    setImages((prev) => ({ ...prev, ...processImages(data) }))
                } else {
                    setChatflows(data)
                    setImages(processImages(data))
                }

                setTotalPages(newTotalPages)
                setHasMore(hasNextPage)
                setCurrentPage(page)
            } catch (error) {
                console.error('Error loading chatflows:', error)
                if (error?.response?.status === 401) {
                    setLoginDialogProps({
                        title: 'Login',
                        confirmButtonName: 'Login'
                    })
                    setLoginDialogOpen(true)
                } else {
                    setError(error)
                }
            } finally {
                setIsLoading(false)
                setIsLoadingMore(false)
            }
        },
        [tenantId, processImages]
    )

    // Load more function for infinite scroll
    const loadMore = useCallback(() => {
        if (hasMore && !isLoadingMore && !isLoading) {
            loadChatflows(currentPage + 1, true)
        }
    }, [hasMore, isLoadingMore, isLoading, currentPage, loadChatflows])

    // Infinite scroll hook
    const { lastElementRef } = useInfiniteScroll(loadMore, hasMore, isLoadingMore)

    // Filter and sort functions
    const filterFlows = useCallback(
        (data) => {
            // Ensure data is always an array
            const dataArray = Array.isArray(data) ? data : []
            const searchLower = search.toLowerCase()
            return dataArray.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchLower) ||
                    (item.category && item.category.toLowerCase().includes(searchLower)) ||
                    item.id.toLowerCase().includes(searchLower)
            )
        },
        [search]
    )

    const sortData = useCallback(
        (data) => {
            // Ensure data is always an array
            const dataArray = Array.isArray(data) ? data : []
            const sortedData = [...dataArray]
            switch (sortBy) {
                case 'name':
                    return sortedData.sort((a, b) => a.name.localeCompare(b.name))
                case 'created':
                    return sortedData.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))
                case 'updated':
                    return sortedData.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))
                default:
                    return sortedData
            }
        },
        [sortBy]
    )

    // Get processed data with filtering and sorting
    const processedData = useMemo(() => {
        // Ensure chatflows is always an array
        const chatflowsArray = Array.isArray(chatflows) ? chatflows : []
        const filtered = filterFlows(chatflowsArray)
        return sortData(filtered)
    }, [chatflows, filterFlows, sortData])

    // Event handlers
    const handleViewChange = (event, nextView) => {
        if (nextView === null) return
        localStorage.setItem('flowDisplayStyle', nextView)
        setView(nextView)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const onSortChange = (event) => {
        setSortBy(event.target.value)
    }

    const onLoginClick = (username, password) => {
        localStorage.setItem('username', username)
        localStorage.setItem('password', password)
        navigate(0)
    }

    const addNew = () => {
        navigate('/canvas')
    }

    const goToCanvas = (selectedChatflow) => {
        navigate(`/canvas/${selectedChatflow.id}`)
    }

    // Load initial data
    useEffect(() => {
        loadChatflows(1, false)
    }, [loadChatflows])

    // Reset and reload when search or sort changes
    useEffect(() => {
        if (search || sortBy !== 'updated') {
            // For search and sort, we work with existing data
            // No need to reload from server
            return
        }
    }, [search, sortBy])

    // Render loading skeletons
    const renderSkeletons = () => (
        <Box display='grid' gridTemplateColumns='repeat(3, 1fr)' gap={gridSpacing}>
            {[...Array(12)].map((_, index) => (
                <Skeleton key={index} variant='rounded' height={280} />
            ))}
        </Box>
    )

    // Render empty state
    const renderEmptyState = () => (
        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
            <Box sx={{ p: 2, height: 'auto' }}>
                <img
                    style={{ objectFit: 'cover', height: '30vh', width: 'auto' }}
                    src={customization.isDarkMode ? emptyImage : emptyImagelite}
                    alt='WorkflowEmptySVG'
                />
            </Box>
            <Typography variant='body1'>
                {search ? 'No chatflows found matching your search.' : 'No AI Apps workspaces have been created yet.'}
            </Typography>
        </Stack>
    )

    // // Render load more indicator
    const renderLoadMoreIndicator = () => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 2, gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant='body2' color='textSecondary'>
                Loading more...
            </Typography>
        </Box>
    )

    return (
        <MainCard>
            {error ? (
                <ErrorBoundary error={error} />
            ) : (
                <Stack flexDirection='column' sx={{ gap: 3, flexGrow: 1 }}>
                    <ViewHeader
                        onSearchChange={onSearchChange}
                        search={true}
                        searchPlaceholder='Search Name or Category'
                        title='AI Apps Workspace'
                    >
                        {/* Sort Dropdown */}
                        <FormControl
                            variant='standard'
                            sx={{
                                minWidth: 180,
                                height: 40,
                                marginRight: 4,
                                marginLeft: 8,
                                marginTop: '2px',
                                '& .MuiInput-underline:before': {
                                    borderBottomColor: customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
                                },
                                '& .MuiInput-underline:after': {
                                    borderBottomColor: customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
                                }
                            }}
                        >
                            <Select
                                labelId='standard'
                                value={sortBy}
                                label='Sort By'
                                onChange={onSortChange}
                                sx={{
                                    height: 40,
                                    borderRadius: 2,
                                    color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                                    '& .MuiSvgIcon-root': {
                                        color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
                                    }
                                }}
                            >
                                <MenuItem value='name'>Sort By Name</MenuItem>
                                <MenuItem value='created'>Sort By Created Date</MenuItem>
                                <MenuItem value='updated'>Sort By Updated Date</MenuItem>
                            </Select>
                        </FormControl>

                        <ToggleButtonGroup
                            sx={{ borderRadius: 2, maxHeight: 40 }}
                            value={view}
                            color='primary'
                            exclusive
                            onChange={handleViewChange}
                        >
                            <ToggleButton
                                sx={{
                                    borderColor: theme.palette.grey[900] + 25,
                                    borderRadius: 2,
                                    color: theme?.customization?.isDarkMode ? 'white' : 'inherit'
                                }}
                                variant='contained'
                                value='card'
                                title='Card View'
                            >
                                <IconLayoutGrid style={{ color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4' }} />
                            </ToggleButton>
                            <ToggleButton
                                sx={{
                                    borderColor: theme.palette.grey[900] + 25,
                                    borderRadius: 2,
                                    color: theme?.customization?.isDarkMode ? 'white' : 'inherit'
                                }}
                                variant='contained'
                                value='list'
                                title='List View'
                            >
                                <IconList style={{ color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4' }} />
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <StyledButton variant='contained' onClick={addNew} startIcon={<IconPlus />} sx={{ borderRadius: 2, height: 40 }}>
                            Create Workflow
                        </StyledButton>
                    </ViewHeader>

                    {/* Card View */}
                    {(!view || view === 'card') && (
                        <>
                            {isLoading ? (
                                renderSkeletons()
                            ) : processedData.length === 0 ? (
                                renderEmptyState()
                            ) : (
                                <>
                                    <Box display='grid' gridTemplateColumns='repeat(3, 1fr)' gap={gridSpacing}>
                                        {processedData.map((data, index) => (
                                            <div key={data.id} ref={index === processedData.length - 1 ? lastElementRef : null}>
                                                <ItemCard
                                                    onClick={() => goToCanvas(data)}
                                                    data={data}
                                                    images={images[data.id]}
                                                    updateFlowsApi={{ request: () => loadChatflows(1, false) }}
                                                />
                                            </div>
                                        ))}
                                    </Box>
                                    {isLoadingMore && renderLoadMoreIndicator()}
                                </>
                            )}
                        </>
                    )}

                    {/* List View */}
                    {view === 'list' && (
                        <FlowListTable
                            data={processedData}
                            images={images}
                            isLoading={isLoading}
                            filterFunction={filterFlows}
                            updateFlowsApi={{ request: () => loadChatflows(1, false) }}
                            setError={setError}
                            lastElementRef={lastElementRef}
                            isLoadingMore={isLoadingMore}
                            hasMore={hasMore}
                        />
                    )}

                    <ConfirmDialog />
                </Stack>
            )}
        </MainCard>
    )
}

export default Chatflows
