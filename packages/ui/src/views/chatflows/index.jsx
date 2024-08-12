import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// material-ui
import { Grid, Box, Stack, Toolbar, ToggleButton, ButtonGroup, InputAdornment, TextField, MenuItem, Select } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ItemCard from '@/ui-component/cards/ItemCard'
import { gridSpacing } from '@/store/constant'
import LoginDialog from '@/ui-component/dialog/LoginDialog'
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

    const addNew = () => {
        navigate('/canvas')
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
        getAllChatflowsApi.request(tenantId)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
            <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : ` #e3f2fd` }}>
                <Stack flexDirection='column'>
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
                                    lineHeight: '1.3'
                                }}
                            >
                                AI Apps Workspace
                            </h1>
                            <TextField
                                size='small'
                                sx={{
                                    display: { xs: 'none', sm: 'block' },
                                    ml: 3,
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
                                            borderBottomColor: customization.isDarkMode ? '#3C5BA4 !important' : '#E22A90 !important'
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
                                                    padding: '2px',
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
                                            borderBottomColor: customization.isDarkMode ? '#3C5BA4 !important' : '#E22A90 !important',
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
                                                '.MuiSelect-select': {},
                                                '.MuiOutlinedInput-notchedOutline': {},
                                                '&:hover .MuiOutlinedInput-notchedOutline': {},
                                                '.MuiSelect-icon': {
                                                    color: customization.isDarkMode ? '#fff' : '#000' // Dropdown icon color
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
                                                color: customization.isDarkMode ? '#3C5BA4' : '#3C5BA4',
                                                borderRadius: '20px 0 0 20px',
                                                '&.Mui-selected': {
                                                    color: customization?.isDarkMode ? '#E22A90' : '#E22A90'
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
                                                color: customization.isDarkMode ? '#E22A90' : '#E22A90',
                                                borderRadius: '0 20px 20px 0',
                                                '&.Mui-selected': {
                                                    color: customization?.isDarkMode ? '#3C5BA4' : '#3C5BA4'
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
                                                    background: 'transparent !important'
                                                }}
                                            />
                                        }
                                    >
                                        Create GenAI App
                                    </StyledButton>
                                </ButtonGroup>
                            </ButtonGroup>
                            <Box sx={{ flexGrow: 1 }} />
                            {/* <Select
                                size='small'
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                sx={{ ml: 2 }}
                            >
                                <MenuItem value='name'>Sort by Name</MenuItem>
                                <MenuItem value='created'>Sort by Created Date</MenuItem>
                                <MenuItem value='updated'>Sort by Updated Date</MenuItem>
                            </Select> */}
                        </Toolbar>
                    </Box>
                    {!isLoading && (!view || view === 'card') && getAllChatflowsApi.data && (
                        <Grid container spacing={gridSpacing}>
                            {sortData(getAllChatflowsApi.data) // Apply sorting
                                .filter(filterFlows)
                                .map((data, index) => (
                                    <Grid key={index} item lg={3} md={4} sm={6} xs={12}>
                                        <ItemCard
                                            onClick={() => goToCanvas(data)}
                                            updateFlowsApi={getAllChatflowsApi}
                                            data={data}
                                            images={images[data.id]}
                                        />
                                    </Grid>
                                ))}
                        </Grid>
                    )}
                    {!isLoading && view === 'list' && getAllChatflowsApi.data && (
                        <FlowListTable
                            sx={{ mt: 20 }}
                            data={sortData(getAllChatflowsApi.data)} // Apply sorting
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
