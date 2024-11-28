import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useSelector } from 'react-redux'

// material-ui

import { Box, Stack, Toolbar, ToggleButton, Skeleton, ButtonGroup, InputAdornment, TextField, MenuItem, Select } from '@mui/material'

import { useTheme } from '@mui/material/styles'

// project imports

import MainCard from '@/ui-component/cards/MainCard'

import ItemCard from '@/ui-component/cards/ItemCard'

import { gridSpacing } from '@/store/constant'

import LoginDialog from '@/ui-component/dialog/LoginDialog'

import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'

import emptyImage from '../../assets/images/glass.svg'

import emptyImagelite from '../../assets/images/glass-lite.svg'
import axios from 'axios'
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

// ==============================|| CHATFLOWS ||============================== //

const Chatflows = () => {
    const navigate = useNavigate()

    const theme = useTheme()

    const customization = useSelector((state) => state.customization)

    const [isLoading, setLoading] = useState(true)

    const [images, setImages] = useState({})

    const [search, setSearch] = useState('')

    const [loginDialogOpen, setLoginDialogOpen] = useState(false)

    const [loginDialogProps, setLoginDialogProps] = useState({})

    const [showModal, setShowModal] = useState(false)

    const [sortBy, setSortBy] = useState('name')

    const userData = useSelector((state) => state.user.userData)
    localStorage.setItem('subscription_type', userData?.subscription_type)
    const subscription = localStorage.getItem('subscription_type')

    const tenantId = userData?.uid

    const getAllChatflowsApi = useApi(chatflowsApi.getAllChatflows)

    const [view, setView] = React.useState(localStorage.getItem('flowDisplayStyle') || 'card')

    const handleChange = (event, nextView) => {
        if (nextView === null) return

        localStorage.setItem('flowDisplayStyle', nextView)

        setView(nextView)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    function filterFlows(data) {
        return (
            data.name.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            (data.category && data.category.toLowerCase().indexOf(search.toLowerCase()) > -1)
        )
    }

    const sortData = (data) => {
        switch (sortBy) {
            case 'name':
                return data.sort((a, b) => a.name.localeCompare(b.name))

            case 'created':
                return data.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))

            case 'updated':
                return data.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))

            default:
                return data
        }
    }

    const onLoginClick = (username, password) => {
        localStorage.setItem('username', username)

        localStorage.setItem('password', password)

        navigate(0)
    }

    const addNew = async () => {
        const chatflows = getAllChatflowsApi.data || []
        console.log('userData: ', userData?.subscription_type)

        console.log('chatflows: ', chatflows.length)

        userData.subscription_type === null ? (userData.subscription_type = 'free') : userData.subscription_type

        console.log(userData.subscription_type, 'Subscription type')

        if (userData?.subscription_type === 'free' || localStorage.getItem('subscription_type') === 'free') {
            if (chatflows.length > 4) {
                navigate('/subscription')
                // TODO: Add banner to show free tier limit reached
                console.log('maximum workspace apps reached! upgrade plan to continue')
            } else {
                navigate('/canvas')
            }
        } else if (userData?.subscription_type === 'pro') {
            let workspace_count = 0
            //getusers with email and check number of users and number of workspace
            console.log('userData for pro plan users: ', userData.email)

            const userDomain = userData?.email.split('@')[1].split('.')[0]

            if (userDomain !== 'gmail' && userDomain !== 'github' && userDomain !== 'yahoo') {
                const apiUrl =
                    window.location.hostname === 'localhost'
                        ? 'http://localhost:2000/proUsers'
                        : 'https://thub-web-server-2-0-378678297066.us-central1.run.app/proUsers'

                try {
                    const response = await axios.post(apiUrl, { userDomain })
                    console.log('response: ', response)
                    if (response.status === 200) {
                        workspace_count += response?.data
                    } else {
                        console.error('Error:', response.statusText)
                    }
                } catch (error) {
                    console.error('Error:', error)
                }
            } else {
                workspace_count = chatflows.length
            }
            if (workspace_count >= 25) {
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

    useEffect(() => {
        if (tenantId) {
            getAllChatflowsApi.request(tenantId)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId])

    useEffect(() => {
        if (getAllChatflowsApi.error) {
            if (getAllChatflowsApi.error?.response?.status === 401) {
                setLoginDialogProps({
                    title: 'Login',

                    confirmButtonName: 'Login'
                })

                setLoginDialogOpen(true)
            }
        }
    }, [getAllChatflowsApi.error])

    useEffect(() => {
        setLoading(getAllChatflowsApi.loading)
    }, [getAllChatflowsApi.loading])

    useEffect(() => {
        if (getAllChatflowsApi.data) {
            try {
                const chatflows = getAllChatflowsApi.data

                const images = {}

                for (let i = 0; i < chatflows.length; i += 1) {
                    const flowDataStr = chatflows[i].flowData

                    const flowData = JSON.parse(flowDataStr)

                    const nodes = flowData.nodes || []

                    images[chatflows[i].id] = []

                    for (let j = 0; j < nodes.length; j += 1) {
                        const imageSrc = `${baseURL}/api/v1/node-icon/${nodes[j].data.name}`

                        if (!images[chatflows[i].id].includes(imageSrc)) {
                            images[chatflows[i].id].push(imageSrc)
                        }
                    }
                }

                setImages(images)
            } catch (e) {
                console.error(e)
            }
        }
    }, [getAllChatflowsApi.data])

    return (
        <>
            {showModal && <UserInfo showModal={showModal} setShowModal={setShowModal} />}

            <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : `#f5faff` }}>
                <Stack flexDirection='column' gap={10}>
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

                                                    // padding: '2px',

                                                    mb: 1
                                                }}
                                            />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <TextField
                                style={{ marginLeft: '40px' }}
                                size='small'
                                sx={{
                                    display: { xs: 'none', sm: 'block' },

                                    ml: 3,

                                    transition: 'all .2s ease-in-out',

                                    '& input': { color: customization.isDarkMode ? '#fff' : '#000', width: '50%' },

                                    '& label.Mui-focused': { color: customization.isDarkMode ? '#E22A90' : '#3C5BA4', width: '50%' },

                                    '& .MuiInput-underline:after': {
                                        borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4',

                                        width: '50%'
                                    },

                                    '& .MuiInput-underline:before': {
                                        borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4',

                                        width: '50%'
                                    },

                                    '&:hover': {
                                        '& .MuiInput-underline:before': {
                                            borderBottomColor: customization.isDarkMode ? '#e22a90 !important' : '#3c5ba4 !important',

                                            width: '50%'
                                        }
                                    }
                                }}
                                variant='standard'
                                // placeholder='Search name or category'

                                onChange={onSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <Select
                                            size='small'
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            sx={{
                                                ml: 2,

                                                marginLeft: '10px',

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
                                    )
                                }}
                            />

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

                    {!isLoading && (!view || view === 'card') && getAllChatflowsApi.data && (
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
                            {sortData(getAllChatflowsApi.data)
                                .filter(filterFlows)

                                .map((data, index) => (
                                    <Box key={index}>
                                        <ItemCard
                                            onClick={() => goToCanvas(data)}
                                            updateFlowsApi={getAllChatflowsApi}
                                            data={data}
                                            images={images[data.id]}
                                        />
                                    </Box>
                                ))}
                        </Box>
                    )}

                    {!isLoading && view === 'list' && getAllChatflowsApi.data && (
                        <FlowListTable
                            sx={{ mt: 20 }}
                            data={sortData(getAllChatflowsApi.data)}
                            images={images}
                            filterFunction={filterFlows}
                            updateFlowsApi={getAllChatflowsApi}
                        />
                    )}
                </Stack>

                {!isLoading && (!getAllChatflowsApi.data || getAllChatflowsApi.data.length === 0) && (
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

                <LoginDialog show={loginDialogOpen} dialogProps={loginDialogProps} onConfirm={onLoginClick} />

                <ConfirmDialog />
            </MainCard>
        </>
    )
}

export default Chatflows
