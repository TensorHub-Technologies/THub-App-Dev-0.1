import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// material-ui
import {
    Box,
    Stack,
    Toolbar,
    ToggleButton,
    Skeleton,
    ButtonGroup,
    InputAdornment,
    TextField,
    MenuItem,
    Select,
    FormControl
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ItemCard from '@/ui-component/cards/ItemCard'
import { gridSpacing } from '@/store/constant'
// import LoginDialog from '@/ui-component/dialog/LoginDialog'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import emptyImage from '../../assets/images/glass.svg'
import emptyImagelite from '../../assets/images/glass-lite.svg'

// API
import chatflowsApi from '@/api/chatflows'

// Hooks
import useApi from '@/hooks/useApi'

// const
import { baseURL } from '@/store/constant'

// icons
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import AddLinkOutlinedIcon from '@mui/icons-material/AddLinkOutlined'
import * as React from 'react'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { FlowListTable } from '@/ui-component/table/FlowListTable'
import { StyledButton } from '@/ui-component/button/StyledButton'
import UserInfo from '@/ui-component/userform/UserInfo'
import AgentCounter from './AgentCounter'

// ==============================|| CHATFLOWS ||============================== //

const Chatflows = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const [isLoading, setLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [images, setImages] = useState({})
    const [search, setSearch] = useState('')
    const [loginDialogOpen, setLoginDialogOpen] = useState(false)
    const [loginDialogProps, setLoginDialogProps] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [open, setOpen] = useState(false)
    const [showAgentsPopup, setShowshowAgentsPopup] = useState(false)
    const [sortBy, setSortBy] = useState('name')
    const userData = useSelector((state) => state?.user.userData)
    const tenantId = userData?.uid
    const workspaceUid = userData?.workspaceUid

    // Infinite scroll state
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(12)
    const [totalItems, setTotalItems] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [allChatflows, setAllChatflows] = useState([])
    const observer = useRef()
    const lastElementRef = useRef(null)

    // Determine which API to use based on workspaceUid
    const apiToUse = workspaceUid ? chatflowsApi.getAllChatflowsWpPaginated : chatflowsApi.getAllChatflowsPaginated

    const chatFlowsApi = useApi(apiToUse) || []

    const [view, setView] = React.useState(localStorage.getItem('flowDisplayStyle') || 'card')

    const handleChange = (event, nextView) => {
        if (nextView === null) return
        localStorage.setItem('flowDisplayStyle', nextView)
        setView(nextView)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
        // Reset data and start fresh when search changes
        setPage(1)
        setAllChatflows([])
        setHasMore(true)
    }

    // Last element callback for infinite scrolling
    const lastItemRef = useCallback(
        (node) => {
            if (isLoadingMore) return
            if (observer.current) observer.current.disconnect()

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMoreData()
                }
            })

            if (node) observer.current.observe(node)
        },
        [isLoadingMore, hasMore]
    )

    // Load more data function
    const loadMoreData = () => {
        if (!hasMore || isLoadingMore) return

        setIsLoadingMore(true)
        const nextPage = page + 1
        setPage(nextPage)

        if (workspaceUid) {
            chatFlowsApi.request(workspaceUid, nextPage, limit)
        } else if (tenantId) {
            chatFlowsApi.request(tenantId, nextPage, limit)
        }
    }

    function filterFlows(data) {
        return (
            data.name.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            (data.category && data.category.toLowerCase().indexOf(search.toLowerCase()) > -1)
        )
    }

    const sortData = (data) => {
        // Client-side sorting for displayed data
        switch (sortBy) {
            case 'name':
                return [...data].sort((a, b) => a.name.localeCompare(b.name))
            case 'created':
                return [...data].sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))
            case 'updated':
                return [...data].sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))
            default:
                return data
        }
    }

    const onLoginClick = (username, password) => {
        localStorage.setItem('username', username)
        localStorage.setItem('password', password)
        navigate(0)
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const addNew = async () => {
        const chatflows = allChatflows
        let subscriptionType = userData?.subscription_type
        if (!subscriptionType) {
            subscriptionType = 'free'
        }
        if (subscriptionType === 'free') {
            if (chatflows.length > 3) {
                // TODO: Add banner to show free tier limit reached
                console.log('maximum workspace apps reached! upgrade plan to continue')
            } else {
                navigate('/canvas')
            }
        } else if (userData?.subscription_type === 'pro') {
            let chatflowCount
            //getusers with email and check number of users and number of workspace
            chatflowCount = totalItems // Use the total count from the API
            console.log(chatflowCount, 'chatflowCount')
            const userDomain = userData?.workspace || userData?.email.split('@')[1].split('.')[0]
            if (totalItems > 25) {
                handleOpen()
                // TODO: Add banner to show pro tier limit reached
                console.log('maximum workspace apps reached! upgrade plan to continue')
            } else {
                navigate('/canvas')
            }
        } else {
            navigate('/canvas')
        }
    }

    const goToCanvas = (selectedChatflow) => {
        navigate(`/canvas/${selectedChatflow.id}`)
    }

    useEffect(() => {
        const modalShown = sessionStorage.getItem('modalShown')
        if ((userData?.company === '' || userData?.company === null) && !modalShown) {
            setShowModal(true)
        }
    }, [tenantId])

    // Initial data load
    useEffect(() => {
        setLoading(true)
        setAllChatflows([])
        setPage(1)

        if (workspaceUid) {
            chatFlowsApi.request(workspaceUid, 1, limit)
        } else if (tenantId) {
            chatFlowsApi.request(tenantId, 1, limit)
        } else {
            console.log('tenantId not found')
            setLoading(false)
        }
    }, [tenantId, workspaceUid, search, sortBy, limit])

    useEffect(() => {
        if (chatFlowsApi.error) {
            if (chatFlowsApi.error?.response?.status === 401) {
                setLoginDialogProps({
                    title: 'Login',
                    confirmButtonName: 'Login'
                })
                setLoginDialogOpen(true)
            }
            setIsLoadingMore(false)
        }
    }, [chatFlowsApi.error])

    useEffect(() => {
        if (page === 1) {
            setLoading(chatFlowsApi.loading)
        } else {
            setIsLoadingMore(chatFlowsApi.loading)
        }
    }, [chatFlowsApi.loading])

    useEffect(() => {
        if (chatFlowsApi.data) {
            try {
                const newChatflows = chatFlowsApi.data.items || []

                // Update pagination info
                setTotalItems(chatFlowsApi.data.total || 0)
                setHasMore(page * limit < (chatFlowsApi.data.total || 0))

                // Update chatflows list
                if (page === 1) {
                    setAllChatflows(newChatflows)
                } else {
                    setAllChatflows((prev) => [...prev, ...newChatflows])
                }

                // Process images
                const newImages = { ...images }
                for (let i = 0; i < newChatflows.length; i += 1) {
                    const flowDataStr = newChatflows[i].flowData
                    const flowData = JSON.parse(flowDataStr)
                    const nodes = flowData.nodes || []
                    newImages[newChatflows[i].id] = []
                    for (let j = 0; j < nodes.length; j += 1) {
                        const imageSrc = `${baseURL}/api/v1/node-icon/${nodes[j].data.name}`
                        if (!newImages[newChatflows[i].id].includes(imageSrc)) {
                            newImages[newChatflows[i].id].push(imageSrc)
                        }
                    }
                }
                setImages(newImages)
                setIsLoadingMore(false)
            } catch (e) {
                console.error(e)
                setIsLoadingMore(false)
            }
        }
    }, [chatFlowsApi.data])

    // Filter and sort the displayed chatflows
    const displayedChatflows = sortData(allChatflows.filter(filterFlows))

    return (
        <>
            {showModal && <UserInfo showModal={showModal} setShowModal={setShowModal} />}
            <AgentCounter open={open} handleClose={handleClose} />
            <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : `#f5faff` }}>
                <Stack flexDirection='column' gap={2}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Toolbar
                            disableGutters={true}
                            style={{
                                margin: 1,
                                padding: 1,
                                paddingBottom: 10,
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%'
                            }}
                        >
                            <h1
                                style={{
                                    background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    fontSize: '24px',
                                    lineHeight: '1.3',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                AI Apps Workspace
                            </h1>

                            <TextField
                                size='small'
                                sx={{
                                    display: { xs: 'none', sm: 'block' },
                                    ml: 3,
                                    minWidth: 200,
                                    maxWidth: 'none',
                                    flexGrow: 1,
                                    transition: 'all .2s ease-in-out',
                                    '& input': {
                                        color: customization.isDarkMode ? '#fff' : '#000',
                                        '::placeholder': {
                                            color: customization.isDarkMode ? '#fff' : '#000',
                                            opacity: 1
                                        }
                                    },
                                    '& label.Mui-focused': { color: customization.isDarkMode ? '#E22A90' : '#3C5BA4' },
                                    '& .MuiInput-underline:after': { borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4' },
                                    '& .MuiInput-underline:before': { borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4' },
                                    '&:hover': {
                                        '& .MuiInput-underline:before': {
                                            borderBottomColor: customization.isDarkMode ? '#e22a90 !important' : '#3c5ba4 !important'
                                        }
                                    }
                                }}
                                variant='standard'
                                placeholder='Search name or category'
                                onChange={onSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <SearchOutlinedIcon
                                                sx={{
                                                    cursor: 'default',
                                                    color: customization?.isDarkMode ? '#fff' : '#000',
                                                    background: 'transparent !important',
                                                    borderRadius: '20%',
                                                    mb: 1
                                                }}
                                            />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <FormControl
                                variant='standard'
                                sx={{
                                    ml: 5,
                                    width: '130px'
                                }}
                            >
                                <Select
                                    size='small'
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    sx={{
                                        width: '130px',
                                        '&::before': {
                                            borderBottom: customization?.isDarkMode ? '1px solid #e22a90' : '1px solid #3C5BA4'
                                        },
                                        '&::after': {
                                            borderBottom: customization?.isDarkMode ? '2px solid #e22a90' : '2px solid #3C5BA4'
                                        },
                                        '& .MuiSelect-icon': {
                                            background: customization?.isDarkMode ? '#e22a90' : '#3C5BA4',
                                            color: '#ffff'
                                        }
                                    }}
                                >
                                    <MenuItem value='name'>Sort by Name</MenuItem>
                                    <MenuItem value='created'>Sort by Created Date</MenuItem>
                                    <MenuItem value='updated'>Sort by Updated Date</MenuItem>
                                </Select>
                            </FormControl>

                            <Box sx={{ flexGrow: 1 }} />

                            <ButtonGroup
                                sx={{ maxHeight: 40 }}
                                disableElevation
                                variant='contained'
                                aria-label='outlined primary button group'
                            >
                                <ButtonGroup disableElevation variant='contained' aria-label='outlined primary button group'>
                                    <ToggleButtonGroup
                                        sx={{
                                            marginLeft: '200px',
                                            maxHeight: 40,
                                            borderRadius: 20 // Set rounded corners
                                        }}
                                        value={view}
                                        exclusive
                                        onChange={handleChange}
                                    >
                                        <ToggleButton
                                            sx={{
                                                color: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                                borderRadius: '20px 0 0 20px',
                                                '&.Mui-selected': {
                                                    color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
                                                }
                                            }}
                                            variant='contained'
                                            value='card'
                                            title='Card View'
                                        >
                                            <GridViewOutlinedIcon
                                                sx={{
                                                    color: 'inherit',
                                                    background: 'transparent !important'
                                                }}
                                            />
                                        </ToggleButton>

                                        <ToggleButton
                                            sx={{
                                                color: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                                borderRadius: '0 20px 20px 0',
                                                '&.Mui-selected': {
                                                    color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
                                                }
                                            }}
                                            variant='contained'
                                            value='list'
                                            title='List View'
                                        >
                                            <MenuRoundedIcon
                                                sx={{
                                                    color: 'inherit',
                                                    background: 'transparent !important'
                                                }}
                                            />
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </ButtonGroup>

                                <Box sx={{ width: 5 }} />

                                <ButtonGroup disableElevation aria-label='outlined primary button group'>
                                    <StyledButton
                                        variant='contained'
                                        onClick={addNew}
                                        endIcon={
                                            <AddLinkOutlinedIcon
                                                sx={{
                                                    background: 'transparent !important',
                                                    fontSize: '1.5vw'
                                                }}
                                            />
                                        }
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '200px',
                                            fontSize: {
                                                xs: '0.9rem',
                                                sm: '1rem',
                                                md: '1rem'
                                            },
                                            padding: '0.5rem 1rem'
                                        }}
                                    >
                                        Create GenAI App
                                    </StyledButton>
                                </ButtonGroup>
                            </ButtonGroup>
                            <Box sx={{ flexGrow: 1 }} />
                        </Toolbar>
                    </Box>

                    {isLoading && (
                        <Box
                            display='grid'
                            sx={{
                                gridTemplateColumns: {
                                    xs: 'repeat(1, 1fr)',
                                    sm: 'repeat(2, 1fr)',
                                    md: 'repeat(3, 1fr)',
                                    lg: 'repeat(4, 1fr)'
                                },
                                gap: gridSpacing
                            }}
                        >
                            {[...Array(8)].map((_, index) => (
                                <Skeleton key={index} variant='rounded' width='100%' height={280} />
                            ))}
                        </Box>
                    )}

                    {!isLoading && (!view || view === 'card') && displayedChatflows && (
                        <Box
                            display='grid'
                            sx={{
                                gridTemplateColumns: {
                                    xs: 'repeat(1, 1fr)',
                                    sm: 'repeat(2, 1fr)',
                                    md: 'repeat(3, 1fr)',
                                    lg: 'repeat(4, 1fr)'
                                },
                                gap: gridSpacing
                            }}
                        >
                            {displayedChatflows.map((data, index) => {
                                // Check if this is the last item
                                const isLastItem = index === displayedChatflows.length - 1

                                return (
                                    <Box key={index} ref={isLastItem && hasMore ? lastItemRef : null}>
                                        <ItemCard
                                            onClick={() => goToCanvas(data)}
                                            updateFlowsApi={chatFlowsApi}
                                            data={data}
                                            images={images[data.id]}
                                        />
                                    </Box>
                                )
                            })}
                        </Box>
                    )}

                    {!isLoading && view === 'list' && displayedChatflows && (
                        <div>
                            <FlowListTable
                                sx={{ mt: 20 }}
                                data={displayedChatflows}
                                images={images}
                                filterFunction={() => true} // No need to filter here, already filtered above
                                updateFlowsApi={chatFlowsApi}
                                lastItemRef={lastItemRef}
                            />
                        </div>
                    )}

                    {/* Loading indicator for infinite scroll */}
                    {isLoadingMore && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <Skeleton variant='rounded' width='100%' height={60} />
                        </Box>
                    )}

                    {!isLoading && (!displayedChatflows || displayedChatflows.length === 0) && (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                            <Box sx={{ p: 2, height: 'auto' }}>
                                <img
                                    style={{ objectFit: 'cover', height: '30vh', width: 'auto' }}
                                    src={customization.isDarkMode ? emptyImage : emptyImagelite}
                                    alt='WorkflowEmptySVG'
                                />
                            </Box>

                            <div>No AI Apps workspaces have been created yet.</div>
                        </Stack>
                    )}

                    {/* <LoginDialog show={loginDialogOpen} dialogProps={loginDialogProps} onConfirm={onLoginClick} /> */}
                    <ConfirmDialog />
                </Stack>
            </MainCard>
        </>
    )
}

export default Chatflows
