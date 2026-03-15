import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment/moment'
import { useNavigate } from 'react-router-dom'

// material-ui
import { Stack, IconButton, Button, Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import AddEditDatasetDialog from './AddEditDatasetDialog'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { DEFAULT_ITEMS_PER_PAGE } from '@/ui-component/pagination/TablePagination'

// API
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import useConfirm from '@/hooks/useConfirm'
import datasetsApi from '@/api/dataset'

// Hooks
import useApi from '@/hooks/useApi'
import useNotifier from '@/utils/useNotifier'

// icons
import { IconTrash, IconEdit, IconPlus, IconX } from '@tabler/icons-react'

// Utils
import { truncateString } from '@/utils/genericHelper'
import InfiniteScrollTable from '@/ui-component/pagination/InfiniteScrollTable'

// ==============================|| Datasets ||============================== //

const EvalDatasets = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const { confirm } = useConfirm()

    const customization = useSelector((state) => state.customization)

    useNotifier()
    const dispatch = useDispatch()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [search, setSearch] = useState('')
    const [isLoading, setLoading] = useState(true)
    const [datasets, setDatasets] = useState([])
    const [showDatasetDialog, setShowDatasetDialog] = useState(false)
    const [datasetDialogProps, setDatasetDialogProps] = useState({})
    const getAllDatasets = useApi(datasetsApi.getAllDatasets)

    /* Table Pagination */
    const [currentPage, setCurrentPage] = useState(1)
    const [pageLimit, setPageLimit] = useState(DEFAULT_ITEMS_PER_PAGE)
    const [total, setTotal] = useState(0)
    const onChange = (page, pageLimit) => {
        if (isLoading) return
        if (datasets.length >= total) return

        setCurrentPage(page)
        setPageLimit(pageLimit)
        refresh(page, pageLimit)
    }

    const refresh = (page, limit) => {
        setLoading(true)

        const params = {
            page: page ?? currentPage,
            limit: limit ?? pageLimit
        }

        getAllDatasets.request(params)
    }
    const goToRows = (selectedDataset) => {
        navigate(`/dataset_rows/${selectedDataset.id}?page=1&limit=10`)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const addNew = () => {
        const dialogProp = {
            type: 'ADD',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Add',
            data: {}
        }
        setDatasetDialogProps(dialogProp)
        setShowDatasetDialog(true)
    }

    const edit = (dataset) => {
        const dialogProp = {
            type: 'EDIT',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Save',
            data: dataset
        }
        setDatasetDialogProps(dialogProp)
        setShowDatasetDialog(true)
    }

    const deleteDataset = async (dataset) => {
        const confirmPayload = {
            title: `Delete`,
            description: `Delete dataset ${dataset.name}?`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const deleteResp = await datasetsApi.deleteDataset(dataset.id)
                if (deleteResp.data) {
                    enqueueSnackbar({
                        message: 'Dataset deleted',
                        options: {
                            key: new Date().getTime() + Math.random(),
                            variant: 'success',
                            action: (key) => (
                                <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                    <IconX />
                                </Button>
                            )
                        }
                    })
                    onConfirm()
                }
            } catch (error) {
                enqueueSnackbar({
                    message: `Failed to delete dataset: ${
                        typeof error.response.data === 'object' ? error.response.data.message : error.response.data
                    }`,
                    options: {
                        key: new Date().getTime() + Math.random(),
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
    }

    const onConfirm = () => {
        setShowDatasetDialog(false)
        refresh()
    }

    function filterDatasets(data) {
        return data.name.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    useEffect(() => {
        refresh(currentPage, pageLimit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (getAllDatasets.data) {
            const newData = getAllDatasets.data

            setDatasets((prev) => {
                if (currentPage === 1) {
                    return newData?.data
                }

                return [...prev, ...(newData?.data || [])]
            })

            setTotal(newData?.total)
        }
    }, [getAllDatasets.data])

    useEffect(() => {
        setLoading(getAllDatasets.loading)
    }, [getAllDatasets.loading])

    return (
        <>
            <MainCard>
                <Stack flexDirection='column' sx={{ gap: 3 }}>
                    <ViewHeader
                        isBackButton={false}
                        isEditButton={false}
                        onSearchChange={onSearchChange}
                        search={true}
                        title='Datasets'
                        description=''
                    >
                        <StyledButton
                            permissionId={'datasets:create'}
                            variant='contained'
                            sx={{ borderRadius: 2, height: '100%' }}
                            onClick={addNew}
                            startIcon={<IconPlus />}
                        >
                            Add New
                        </StyledButton>
                    </ViewHeader>
                    {!isLoading && datasets?.length <= 0 ? (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                            {/* <Box sx={{ p: 2, height: 'auto' }}>
                                <img
                                    style={{ objectFit: 'cover', height: '20vh', width: 'auto' }}
                                    src={empty_datasetSVG}
                                    alt='empty_datasetSVG'
                                />
                            </Box> */}
                            <div>No Datasets Yet</div>
                        </Stack>
                    ) : (
                        <>
                            {/* Glass Card List UI */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                {datasets.filter(filterDatasets).map((ds, index) => (
                                    <Box
                                        key={ds.id}
                                        sx={{
                                            position: 'relative',
                                            transition: 'all 0.4s ease-in-out',
                                            animation: 'float 6s ease-in-out infinite',
                                            animationDelay: `${index * 0.1}s`,
                                            '@keyframes float': {
                                                '0%,100%': { transform: 'translateY(0px)' },
                                                '50%': { transform: 'translateY(-5px)' }
                                            },
                                            '&:hover': {
                                                transform: 'translateY(-4px)'
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                border: '1px solid',
                                                borderColor: 'rgba(255,255,255,0.3)',
                                                borderRadius: '12px',
                                                backdropFilter: 'blur(16px)',
                                                backgroundColor: customization.isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.1)',
                                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                                px: 3,
                                                py: 2,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&:hover .glow-effect': {
                                                    opacity: 1
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '2fr 3fr 1fr 1.5fr 120px',
                                                    gap: 3,
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {/* NAME */}
                                                <Box onClick={() => goToRows(ds)} sx={{ cursor: 'pointer' }}>
                                                    <Typography
                                                        variant='caption'
                                                        sx={{ opacity: 0.6, textTransform: 'uppercase', fontSize: '0.75rem' }}
                                                    >
                                                        Name
                                                    </Typography>
                                                    <Typography
                                                        variant='h6'
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            fontFamily: 'Cambria Math',
                                                            color: customization.isDarkMode ? 'white' : 'black'
                                                        }}
                                                    >
                                                        {ds.name}
                                                    </Typography>
                                                </Box>

                                                {/* DESCRIPTION */}
                                                <Box onClick={() => goToRows(ds)} sx={{ cursor: 'pointer' }}>
                                                    <Typography
                                                        variant='caption'
                                                        sx={{ opacity: 0.6, textTransform: 'uppercase', fontSize: '0.75rem' }}
                                                    >
                                                        Description
                                                    </Typography>
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: customization.isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {truncateString(ds?.description, 120)}
                                                    </Typography>
                                                </Box>

                                                {/* ROWS */}
                                                <Box>
                                                    <Typography
                                                        variant='caption'
                                                        sx={{ opacity: 0.6, textTransform: 'uppercase', fontSize: '0.75rem' }}
                                                    >
                                                        Rows
                                                    </Typography>
                                                    <Typography
                                                        variant='h6'
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: customization.isDarkMode ? 'white' : 'black'
                                                        }}
                                                    >
                                                        {ds.rowCount}
                                                    </Typography>
                                                </Box>

                                                {/* LAST UPDATED */}
                                                <Box>
                                                    <Typography
                                                        variant='caption'
                                                        sx={{ opacity: 0.6, textTransform: 'uppercase', fontSize: '0.75rem' }}
                                                    >
                                                        Last Updated
                                                    </Typography>
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: customization.isDarkMode ? 'white' : 'black'
                                                        }}
                                                    >
                                                        {moment(ds.updatedDate).format('MMM Do, YYYY')}
                                                    </Typography>
                                                </Box>

                                                {/* ACTIONS */}
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <IconButton
                                                        onClick={() => edit(ds)}
                                                        sx={{
                                                            color: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                                            backgroundColor: customization.isDarkMode
                                                                ? 'rgba(226,42,144,0.1)'
                                                                : 'rgba(60,91,164,0.1)',
                                                            '&:hover': {
                                                                backgroundColor: customization.isDarkMode
                                                                    ? 'rgba(226,42,144,0.2)'
                                                                    : 'rgba(60,91,164,0.2)'
                                                            }
                                                        }}
                                                    >
                                                        <IconEdit size={18} />
                                                    </IconButton>

                                                    <IconButton
                                                        onClick={() => deleteDataset(ds)}
                                                        sx={{
                                                            backgroundColor: 'rgba(211,47,47,0.1)',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(211,47,47,0.2)'
                                                            }
                                                        }}
                                                    >
                                                        <IconTrash size={18} color='#d32f2f' />
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {/* Glow */}
                                            <Box
                                                className='glow-effect'
                                                sx={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(to right, rgba(60,91,164,0.3), rgba(226,42,144,0.3))',
                                                    opacity: 0,
                                                    transition: 'opacity 0.3s ease-in-out',
                                                    filter: 'blur(8px)',
                                                    zIndex: -1
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            {/* Pagination and Page Size Controls */}
                            <InfiniteScrollTable limit={pageLimit} total={total} onLoadMore={onChange} />{' '}
                        </>
                    )}
                </Stack>
            </MainCard>
            <AddEditDatasetDialog
                show={showDatasetDialog}
                dialogProps={datasetDialogProps}
                onCancel={() => setShowDatasetDialog(false)}
                onConfirm={onConfirm}
            ></AddEditDatasetDialog>
            <ConfirmDialog />
        </>
    )
}

export default EvalDatasets
