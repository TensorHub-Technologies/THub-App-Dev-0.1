import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// material-ui
import { Box, Stack, ToggleButton, ToggleButtonGroup, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import ErrorBoundary from '@/ErrorBoundary'
import MainCard from '@/ui-component/cards/MainCard'
import DocumentStoreCard from '@/ui-component/cards/DocumentStoreCard'
import { StyledButton } from '@/ui-component/button/StyledButton'
import AddDocStoreDialog from '@/views/docstore/AddDocStoreDialog'
import ViewHeader from '@/layout/MainLayout/ViewHeader'

// API
import useApi from '@/hooks/useApi'
import documentsApi from '@/api/documentstore'

// icons
import { IconPlus, IconLayoutGrid, IconList } from '@tabler/icons-react'

// const
import { baseURL, gridSpacing } from '@/store/constant'
import { DocumentStoreTable } from '@/ui-component/table/DocumentStoreTable'
import { useSelector } from 'react-redux'

// ==============================|| DOCUMENTS ||============================== //

const ITEMS_PER_PAGE = 9

const Documents = () => {
    const theme = useTheme()

    const userData = useSelector((state) => state.user.userData)
    const tenantId = userData?.uid || localStorage.getItem('userId')

    const navigate = useNavigate()
    const getAllDocumentStores = useApi(documentsApi.getAllDocumentStores)

    const [error, setError] = useState(null)
    const [isLoading, setLoading] = useState(true)
    const [isLoadingMore, setLoadingMore] = useState(false)
    const [images, setImages] = useState({})
    const [search, setSearch] = useState('')
    const [showDialog, setShowDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [docStores, setDocStores] = useState([])
    const [view, setView] = useState(localStorage.getItem('docStoreDisplayStyle') || 'card')
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [total, setTotal] = useState(0)

    const handleChange = (event, nextView) => {
        if (nextView === null) return
        localStorage.setItem('docStoreDisplayStyle', nextView)
        setView(nextView)
    }

    function filterDocStores(data) {
        return (
            data.name.toLowerCase().indexOf(search.toLowerCase()) > -1 || data.description.toLowerCase().indexOf(search.toLowerCase()) > -1
        )
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
        // Reset pagination when search changes
        setCurrentPage(1)
        setDocStores([])
        setHasMore(true)
        applyFilters(1, ITEMS_PER_PAGE, true)
    }

    const goToDocumentStore = (id) => {
        navigate('/document-stores/' + id)
    }

    const addNew = () => {
        const dialogProp = {
            title: 'Add New Document Store',
            type: 'ADD',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Add'
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const onConfirm = () => {
        setShowDialog(false)
        // Reset and reload data
        setCurrentPage(1)
        setDocStores([])
        setHasMore(true)
        applyFilters(1, ITEMS_PER_PAGE, true)
    }

    const applyFilters = (page, limit, isNewSearch = false) => {
        if (page === 1 || isNewSearch) {
            setLoading(true)
        } else {
            setLoadingMore(true)
        }

        const params = {
            tenantId,
            page,
            limit
        }
        getAllDocumentStores.request(params)
    }

    const loadMore = useCallback(() => {
        if (!isLoading && !isLoadingMore && hasMore) {
            const nextPage = currentPage + 1
            setCurrentPage(nextPage)
            applyFilters(nextPage, ITEMS_PER_PAGE)
        }
    }, [currentPage, hasMore, isLoading, isLoadingMore])

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

    useEffect(() => {
        applyFilters(1, ITEMS_PER_PAGE, true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (getAllDocumentStores.data) {
            try {
                const { data, total: totalCount } = getAllDocumentStores.data
                if (!Array.isArray(data)) return

                const loaderImages = { ...images }

                for (let i = 0; i < data.length; i += 1) {
                    const loaders = data[i].loaders ?? []

                    let totalChunks = 0
                    let totalChars = 0
                    loaderImages[data[i].id] = []

                    for (let j = 0; j < loaders.length; j += 1) {
                        const imageSrc = `${baseURL}/api/v1/node-icon/${loaders[j].loaderId}`
                        if (!loaderImages[data[i].id].includes(imageSrc)) {
                            loaderImages[data[i].id].push(imageSrc)
                        }
                        totalChunks += loaders[j]?.totalChunks ?? 0
                        totalChars += loaders[j]?.totalChars ?? 0
                    }
                    data[i].totalDocs = loaders?.length ?? 0
                    data[i].totalChunks = totalChunks
                    data[i].totalChars = totalChars
                }

                // If it's the first page or a new search, replace the data
                if (currentPage === 1) {
                    setDocStores(data)
                } else {
                    // Append new data for infinite scroll
                    setDocStores((prevStores) => [...prevStores, ...data])
                }

                setTotal(totalCount)
                setImages(loaderImages)

                // Check if there are more items to load
                const loadedItems = currentPage === 1 ? data.length : docStores.length + data.length
                setHasMore(loadedItems < totalCount)
            } catch (e) {
                console.error(e)
            }
        }
    }, [getAllDocumentStores.data, currentPage])

    useEffect(() => {
        if (currentPage === 1) {
            setLoading(getAllDocumentStores.loading)
        } else {
            setLoadingMore(getAllDocumentStores.loading)
        }
    }, [getAllDocumentStores.loading, currentPage])

    useEffect(() => {
        setError(getAllDocumentStores.error)
    }, [getAllDocumentStores.error])

    const filteredDocStores = docStores?.filter(filterDocStores) || []
    const hasDocStores = docStores && docStores.length > 0

    return (
        <MainCard>
            {error ? (
                <ErrorBoundary error={error} />
            ) : (
                <Stack flexDirection='column' sx={{ gap: 3 }}>
                    <ViewHeader
                        onSearchChange={onSearchChange}
                        //hasDocStores became False after search so changes to true (was not showing anything in search bar)
                        search={true}
                        searchPlaceholder='Search Name'
                        title='Document Store'
                        description='Store and upsert documents for LLM retrieval (RAG)'
                    >
                        {hasDocStores && (
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
                                    <IconLayoutGrid />
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
                                    <IconList />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        )}
                        <StyledButton
                            variant='contained'
                            sx={{ borderRadius: 2, height: '100%' }}
                            onClick={addNew}
                            startIcon={<IconPlus />}
                            id='btn_createVariable'
                        >
                            Add New
                        </StyledButton>
                    </ViewHeader>

                    {!hasDocStores && !isLoading ? (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                            <Box sx={{ p: 2, height: 'auto' }}>
                                {/* <img
                                    style={{ objectFit: 'cover', height: '20vh', width: 'auto' }}
                                    src={doc_store_empty}
                                    alt='doc_store_empty'
                                /> */}
                            </Box>
                            <div>No Document Stores Created Yet</div>
                        </Stack>
                    ) : (
                        <React.Fragment>
                            {!view || view === 'card' ? (
                                <Box display='grid' gridTemplateColumns='repeat(3, 1fr)' gap={gridSpacing}>
                                    {filteredDocStores.map((data, index) => (
                                        <DocumentStoreCard
                                            key={`${data.id}-${index}`}
                                            images={images[data.id]}
                                            data={data}
                                            onClick={() => goToDocumentStore(data.id)}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <DocumentStoreTable
                                    isLoading={isLoading}
                                    data={filteredDocStores}
                                    images={images}
                                    onRowClick={(row) => goToDocumentStore(row.id)}
                                />
                            )}

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

                            {!hasMore && hasDocStores && (
                                <Box display='flex' justifyContent='center' sx={{ mt: 2, color: 'text.secondary' }}>
                                    No more items to load
                                </Box>
                            )}
                        </React.Fragment>
                    )}
                </Stack>
            )}
            {showDialog && (
                <AddDocStoreDialog
                    dialogProps={dialogProps}
                    show={showDialog}
                    onCancel={() => setShowDialog(false)}
                    onConfirm={onConfirm}
                />
            )}
        </MainCard>
    )
}

export default Documents
