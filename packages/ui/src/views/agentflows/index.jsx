import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// material-ui
import { Box, Chip, Skeleton, Stack, ToggleButton, ToggleButtonGroup, CircularProgress, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ItemCard from '@/ui-component/cards/ItemCard'
import { gridSpacing } from '@/store/constant'
import AgentsEmptySVG from '@/assets/images/agents_empty.svg'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import { FlowListTable } from '@/ui-component/table/FlowListTable'
import { StyledButton } from '@/ui-component/button/StyledButton'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'

// API
import chatflowsApi from '@/api/chatflows'

// const
import { baseURL, AGENTFLOW_ICONS } from '@/store/constant'

// icons
import { IconPlus, IconLayoutGrid, IconList } from '@tabler/icons-react'
import { useSelector } from 'react-redux'
import useInfiniteScroll from '../chatflows/useInfiniteScroll'

// ==============================|| AGENTS ||============================== //

const Agentflows = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const userData = useSelector((state) => state.user.userData)
    const tenantId = userData?.uid || localStorage.getItem('userId')

    // State for pagination and data
    const [agentflows, setAgentflows] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    // Other state
    const [images, setImages] = useState({})
    const [icons, setIcons] = useState({})
    const [search, setSearch] = useState('')
    const [loginDialogOpen, setLoginDialogOpen] = useState(false)
    const [loginDialogProps, setLoginDialogProps] = useState({})

    const [view, setView] = useState(localStorage.getItem('flowDisplayStyle') || 'card')
    const [agentflowVersion, setAgentflowVersion] = useState(localStorage.getItem('agentFlowVersion') || 'v2')

    // Process images and icons for agentflows
    const processImagesAndIcons = useCallback((agentflowsData) => {
        const newImages = {}
        const newIcons = {}

        agentflowsData.forEach((agentflow) => {
            try {
                const flowDataStr = agentflow.flowData
                const flowData = JSON.parse(flowDataStr)
                const nodes = flowData.nodes || []
                newImages[agentflow.id] = []
                newIcons[agentflow.id] = []

                nodes.forEach((node) => {
                    const foundIcon = AGENTFLOW_ICONS.find((icon) => icon.name === node.data.name)
                    if (foundIcon) {
                        newIcons[agentflow.id].push(foundIcon)
                    } else {
                        const imageSrc = `${baseURL}/api/v1/node-icon/${node.data.name}`
                        if (!newImages[agentflow.id].includes(imageSrc)) {
                            newImages[agentflow.id].push(imageSrc)
                        }
                    }
                })
            } catch (e) {
                console.error('Error processing images for agentflow:', agentflow.id, e)
                newImages[agentflow.id] = []
                newIcons[agentflow.id] = []
            }
        })

        return { newImages, newIcons }
    }, [])

    // Load agentflows function
    const loadAgentflows = useCallback(
        async (page = 1, isAppend = false) => {
            try {
                if (page === 1) {
                    setIsLoading(true)
                } else {
                    setIsLoadingMore(true)
                }

                const type = agentflowVersion === 'v2' ? 'AGENTFLOW' : 'MULTIAGENT'
                const response = await chatflowsApi.getAllAgentflows(type, tenantId, page, 12)
                const { data, totalPages: newTotalPages, hasNextPage } = response.data

                const { newImages, newIcons } = processImagesAndIcons(data)

                if (isAppend) {
                    setAgentflows((prev) => [...prev, ...data])
                    setImages((prev) => ({ ...prev, ...newImages }))
                    setIcons((prev) => ({ ...prev, ...newIcons }))
                } else {
                    setAgentflows(data)
                    setImages(newImages)
                    setIcons(newIcons)
                }

                setTotalPages(newTotalPages)
                setHasMore(hasNextPage)
                setCurrentPage(page)
            } catch (error) {
                console.error('Error loading agentflows:', error)
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
        [tenantId, agentflowVersion, processImagesAndIcons]
    )

    // Load more function for infinite scroll
    const loadMore = useCallback(() => {
        if (hasMore && !isLoadingMore && !isLoading) {
            loadAgentflows(currentPage + 1, true)
        }
    }, [hasMore, isLoadingMore, isLoading, currentPage, loadAgentflows])

    // Infinite scroll hook
    const { lastElementRef } = useInfiniteScroll(loadMore, hasMore, isLoadingMore)

    // Filter function
    const filterFlows = useCallback(
        (data) => {
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

    // Get processed data with filtering
    const processedData = useMemo(() => {
        const agentflowsArray = Array.isArray(agentflows) ? agentflows : []
        return filterFlows(agentflowsArray)
    }, [agentflows, filterFlows])

    // Event handlers
    const handleChange = (event, nextView) => {
        if (nextView === null) return
        localStorage.setItem('flowDisplayStyle', nextView)
        setView(nextView)
    }

    const handleVersionChange = (event, nextView) => {
        if (nextView === null) return
        localStorage.setItem('agentFlowVersion', nextView)
        setAgentflowVersion(nextView)
        // Reset pagination state and reload data
        setCurrentPage(1)
        setHasMore(true)
        setAgentflows([])
        setImages({})
        setIcons({})
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const onLoginClick = (username, password) => {
        localStorage.setItem('username', username)
        localStorage.setItem('password', password)
        navigate(0)
    }

    const addNew = () => {
        if (agentflowVersion === 'v2') {
            navigate('/v2/agentcanvas')
        } else {
            navigate('/agentcanvas')
        }
    }

    const goToCanvas = (selectedAgentflow) => {
        if (selectedAgentflow.type === 'AGENTFLOW') {
            navigate(`/v2/agentcanvas/${selectedAgentflow.id}`)
        } else {
            navigate(`/agentcanvas/${selectedAgentflow.id}`)
        }
    }

    // Load initial data
    useEffect(() => {
        loadAgentflows(1, false)
    }, [loadAgentflows])

    // Reload data when version changes
    useEffect(() => {
        if (agentflowVersion) {
            loadAgentflows(1, false)
        }
    }, [agentflowVersion])

    // Render loading skeletons
    const renderSkeletons = () => (
        <Box display='grid' gridTemplateColumns='repeat(4, 1fr)' gap={gridSpacing}>
            {[...Array(12)].map((_, index) => (
                <Skeleton key={index} variant='rounded' height={280} />
            ))}
        </Box>
    )

    // Render empty state
    const renderEmptyState = () => (
        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
            <Box sx={{ p: 2, height: 'auto' }}>
                <img style={{ objectFit: 'cover', height: '12vh', width: 'auto' }} src={AgentsEmptySVG} alt='AgentsEmptySVG' />
            </Box>
            <Typography variant='body1'>{search ? 'No agents found matching your search.' : 'No Agents Yet'}</Typography>
        </Stack>
    )

    // Render load more indicator
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
                <Stack flexDirection='column' sx={{ gap: 3 }}>
                    <ViewHeader
                        onSearchChange={onSearchChange}
                        search={true}
                        searchPlaceholder='Search Name or Category'
                        title='Agent Studio'
                        description='Multi-agent systems, workflow orchestration'
                    >
                        <ToggleButtonGroup
                            sx={{ borderRadius: 2, maxHeight: 40 }}
                            value={agentflowVersion}
                            color='primary'
                            exclusive
                            onChange={handleVersionChange}
                        >
                            <ToggleButton
                                sx={{
                                    borderColor: theme.palette.grey[900] + 25,
                                    borderRadius: 2,
                                    color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
                                }}
                                variant='contained'
                                value='v2'
                                title='V2'
                            >
                                <Chip sx={{ mr: 1, color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4' }} label='NEW' size='small' />
                                V2
                            </ToggleButton>
                            <ToggleButton
                                sx={{
                                    borderColor: theme.palette.grey[900] + 25,
                                    borderRadius: 2,
                                    color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
                                }}
                                variant='contained'
                                value='v1'
                                title='V1'
                            >
                                V1
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <ToggleButtonGroup
                            sx={{ borderRadius: 2, maxHeight: 40 }}
                            value={view}
                            color='primary'
                            exclusive
                            onChange={handleChange}
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
                            Create
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
                                    <Box display='grid' gridTemplateColumns='repeat(4, 1fr)' gap={gridSpacing}>
                                        {processedData.map((data, index) => (
                                            <div key={data.id} ref={index === processedData.length - 1 ? lastElementRef : null}>
                                                <ItemCard
                                                    onClick={() => goToCanvas(data)}
                                                    data={data}
                                                    isAgentCanvas={true}
                                                    isAgentflowV2={agentflowVersion === 'v2'}
                                                    images={images[data.id]}
                                                    icons={icons[data.id]}
                                                    updateFlowsApi={{ request: () => loadAgentflows(1, false) }}
                                                    isLoading={isLoading}
                                                    setError={setError}
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
                            isAgentCanvas={true}
                            isAgentflowV2={agentflowVersion === 'v2'}
                            data={processedData}
                            images={images}
                            icons={icons}
                            isLoading={isLoading}
                            filterFunction={filterFlows}
                            updateFlowsApi={{ request: () => loadAgentflows(1, false) }}
                            setError={setError}
                            lastElementRef={lastElementRef}
                            isLoadingMore={isLoadingMore}
                            hasMore={hasMore}
                        />
                    )}
                </Stack>
            )}

            <ConfirmDialog />
        </MainCard>
    )
}

export default Agentflows
