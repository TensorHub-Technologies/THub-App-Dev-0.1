import moment from 'moment/moment'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'

// material-ui
import {
    Button,
    Box,
    Skeleton,
    Stack,
    IconButton,
    Popover,
    Typography,
    Tooltip,
    Toolbar,
    TextField,
    ButtonGroup,
    InputAdornment,
    useTheme
} from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { StyledButton } from '@/ui-component/button/StyledButton'
import APIKeyDialog from './APIKeyDialog'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import ErrorBoundary from '@/ErrorBoundary'

// API
import apiKeyApi from '@/api/apikey'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import { IconTrash, IconEdit, IconCopy, IconX, IconPlus, IconEye, IconEyeOff, IconSearch } from '@tabler/icons-react'

// ==============================|| APIKey ||============================== //

const APIKey = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const isDark = customization.isDarkMode

    const userData = useSelector((state) => state.user.userData)
    const tenantId = userData?.uid || localStorage.getItem('userId')

    const dispatch = useDispatch()
    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showDialog, setShowDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [apiKeys, setAPIKeys] = useState([])
    const [anchorEl, setAnchorEl] = useState(null)
    const [showApiKeys, setShowApiKeys] = useState([])
    const openPopOver = Boolean(anchorEl)

    const [search, setSearch] = useState('')
    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    function filterKeys(data) {
        return data.keyName.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    const { confirm } = useConfirm()
    const getAllAPIKeysApi = useApi(apiKeyApi.getAllAPIKeys)

    const onShowApiKeyClick = (apikey) => {
        const index = showApiKeys.indexOf(apikey)
        if (index > -1) {
            const newShowApiKeys = showApiKeys.filter(function (item) {
                return item !== apikey
            })
            setShowApiKeys(newShowApiKeys)
        } else {
            setShowApiKeys((prevkeys) => [...prevkeys, apikey])
        }
    }

    const handleClosePopOver = () => {
        setAnchorEl(null)
    }

    const addNew = () => {
        const dialogProp = {
            title: 'Add New API Key',
            type: 'ADD',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Add',
            customBtnId: 'btn_confirmAddingApiKey'
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const edit = (key) => {
        const dialogProp = {
            title: 'Edit API Key',
            type: 'EDIT',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Save',
            customBtnId: 'btn_confirmEditingApiKey',
            key
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const deleteKey = async (key) => {
        const confirmPayload = {
            title: `Delete`,
            description:
                key.chatFlows.length === 0
                    ? `Delete key [${key.keyName}] ? `
                    : `Delete key [${key.keyName}] ?\n There are ${key.chatFlows.length} chatflows using this key.`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel',
            customBtnId: 'btn_initiateDeleteApiKey'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const deleteResp = await apiKeyApi.deleteAPI(key.id)
                if (deleteResp.data) {
                    enqueueSnackbar({
                        message: 'API key deleted',
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
                    message: `Failed to delete API key: ${
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
        setShowDialog(false)
        getAllAPIKeysApi.request(tenantId)
    }

    useEffect(() => {
        getAllAPIKeysApi.request(tenantId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setLoading(getAllAPIKeysApi.loading)
    }, [getAllAPIKeysApi.loading])

    useEffect(() => {
        if (getAllAPIKeysApi.data) {
            const keys = Array.isArray(getAllAPIKeysApi.data) ? getAllAPIKeysApi.data : []
            setAPIKeys(keys)
        }
    }, [getAllAPIKeysApi.data])

    useEffect(() => {
        if (getAllAPIKeysApi.error) {
            setError(getAllAPIKeysApi.error)
        }
    }, [getAllAPIKeysApi.error])

    const filteredAPIKeys = apiKeys ? apiKeys.filter(filterKeys) : []

    return (
        <>
            <MainCard>
                {error ? (
                    <ErrorBoundary error={error} />
                ) : (
                    <>
                        <Stack flexDirection='row'>
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
                                        API Keys
                                    </h1>
                                    <TextField
                                        size='small'
                                        sx={{
                                            display: { xs: 'none', sm: 'block' },
                                            ml: 3,
                                            transition: 'all .2s ease-in-out',
                                            '& input': { color: customization.isDarkMode ? '#fff' : '#000', width: '180px' },
                                            '& label.Mui-focused': { color: customization.isDarkMode ? '#E22A90' : '#3C5BA4' },
                                            '& .MuiInput-underline:after': {
                                                borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                            },
                                            '& .MuiInput-underline:before': {
                                                borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                            },
                                            '&:hover': {
                                                '& .MuiInput-underline:before': {
                                                    borderBottomColor: customization.isDarkMode
                                                        ? '#e22a90 !important'
                                                        : '#3c5ba4 !important'
                                                }
                                            }
                                        }}
                                        variant='standard'
                                        placeholder='Search API Keys'
                                        onChange={onSearchChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position='start'>
                                                    <IconSearch
                                                        style={{ color: customization.isDarkMode ? '#fff' : '#000', width: 16, height: 16 }}
                                                    />
                                                </InputAdornment>
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
                                        <ButtonGroup disableElevation aria-label='outlined primary button group'>
                                            <StyledButton
                                                variant='contained'
                                                sx={{ color: 'white', mr: 1, height: 37 }}
                                                onClick={addNew}
                                                startIcon={<IconPlus />}
                                                id='btn_createApiKey'
                                            >
                                                Create Key
                                            </StyledButton>
                                        </ButtonGroup>
                                    </ButtonGroup>
                                </Toolbar>
                            </Box>
                        </Stack>

                        {apiKeys.length === 0 && !isLoading && (
                            <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                                <Box sx={{ p: 2, height: 'auto' }}>
                                    {/* <img
                                        style={{ objectFit: 'cover', height: '30vh', width: 'auto' }}
                                        src={customization.isDarkMode ? emptyImage : emptyImagelite}
                                        alt='APIKeysEmptySVG'
                                    /> */}
                                </Box>
                                <div>No API Keys Yet</div>
                            </Stack>
                        )}

                        {/* FlowListTable Style Cards */}
                        {(apiKeys.length > 0 || isLoading) && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                {isLoading ? (
                                    // Loading skeletons - 6 default skeletons
                                    <>
                                        {[...Array(6)].map((_, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    position: 'relative',
                                                    transform: 'translateY(0)',
                                                    transition: 'all 0.5s ease-in-out'
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        border: '1px solid',
                                                        borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '12px',
                                                        backdropFilter: 'blur(16px)',
                                                        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                                        height: '5rem',
                                                        width: '100%',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        px: 3,
                                                        py: 2
                                                    }}
                                                >
                                                    <Skeleton variant='text' width='100%' height={40} />
                                                </Box>
                                            </Box>
                                        ))}
                                    </>
                                ) : (
                                    // Actual data
                                    <>
                                        {filteredAPIKeys.map((apiKey, index) => (
                                            <Box
                                                key={apiKey.id}
                                                sx={{
                                                    position: 'relative',
                                                    transform: 'translateY(0)',
                                                    transition: 'all 0.5s ease-in-out',
                                                    animation: 'float 6s ease-in-out infinite',
                                                    animationDelay: `${index * 0.1}s`,
                                                    '@keyframes float': {
                                                        '0%, 100%': { transform: 'translateY(0px)' },
                                                        '50%': { transform: 'translateY(-5px)' }
                                                    },
                                                    '&:hover': {
                                                        transform: 'translateY(-3px)'
                                                    }
                                                }}
                                            >
                                                {/* Main Glass Card */}
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        border: '1px solid',
                                                        borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '12px',
                                                        backdropFilter: 'blur(16px)',
                                                        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                                        height: '5rem',
                                                        width: '100%',
                                                        transition: 'all 0.3s ease-in-out',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        '&:hover': {
                                                            '& .glow-effect': {
                                                                opacity: 1
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {/* Content */}
                                                    <Box
                                                        sx={{
                                                            position: 'relative',
                                                            zIndex: 10,
                                                            px: 3,
                                                            py: 2,
                                                            flex: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}
                                                    >
                                                        {/* Left Section - Key Name */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                                            <Typography
                                                                variant='h6'
                                                                sx={{
                                                                    fontFamily: 'Cambria Math',
                                                                    fontWeight: 'bold',
                                                                    color: isDark ? 'white' : 'black',
                                                                    fontSize: '1.1rem',
                                                                    lineHeight: 1.2,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    marginTop: 2
                                                                }}
                                                            >
                                                                {apiKey.keyName}
                                                            </Typography>
                                                        </Box>

                                                        {/* API Key Section */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 0.5,
                                                                flex: 2,
                                                                alignItems: 'center',
                                                                minWidth: 0
                                                            }}
                                                        >
                                                            <Typography
                                                                variant='caption'
                                                                sx={{
                                                                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 500,
                                                                    fontFamily: 'Cambria Math',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: 0.5
                                                                }}
                                                            >
                                                                API Key
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography
                                                                    variant='body2'
                                                                    sx={{
                                                                        color: isDark ? 'white' : 'black',
                                                                        fontSize: '1rem',
                                                                        fontFamily: 'Cambria Math',
                                                                        maxWidth: '200px',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    {showApiKeys.includes(apiKey.apiKey)
                                                                        ? apiKey.apiKey
                                                                        : `${apiKey.apiKey.substring(0, 2)}${'•'.repeat(
                                                                              18
                                                                          )}${apiKey.apiKey.substring(apiKey.apiKey.length - 5)}`}
                                                                </Typography>
                                                                <Tooltip title='Copy' placement='top'>
                                                                    <IconButton
                                                                        onClick={(event) => {
                                                                            navigator.clipboard.writeText(apiKey.apiKey)
                                                                            setAnchorEl(event.currentTarget)
                                                                            setTimeout(() => {
                                                                                handleClosePopOver()
                                                                            }, 1500)
                                                                        }}
                                                                        sx={{
                                                                            color: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                                                            width: 32,
                                                                            height: 32
                                                                        }}
                                                                    >
                                                                        <IconCopy size={24} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    title={showApiKeys.includes(apiKey.apiKey) ? 'Hide' : 'Show'}
                                                                    placement='top'
                                                                >
                                                                    <IconButton
                                                                        onClick={() => onShowApiKeyClick(apiKey.apiKey)}
                                                                        sx={{
                                                                            color: isDark ? 'white' : 'black',
                                                                            width: 32,
                                                                            height: 32
                                                                        }}
                                                                    >
                                                                        {showApiKeys.includes(apiKey.apiKey) ? (
                                                                            <IconEyeOff size={24} />
                                                                        ) : (
                                                                            <IconEye size={24} />
                                                                        )}
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </Box>

                                                        {/* Usage Section */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 0.5,
                                                                flex: 0.8,
                                                                alignItems: 'center',
                                                                minWidth: 0
                                                            }}
                                                        >
                                                            <Typography
                                                                variant='caption'
                                                                sx={{
                                                                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 500,
                                                                    fontFamily: 'Cambria Math',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: 0.5
                                                                }}
                                                            >
                                                                Usage
                                                            </Typography>
                                                            <Typography
                                                                variant='body2'
                                                                sx={{
                                                                    color: isDark ? 'white' : 'black',
                                                                    fontSize: '1rem',
                                                                    fontWeight: 'bold',
                                                                    fontFamily: 'Cambria Math'
                                                                }}
                                                            >
                                                                {apiKey.chatFlows.length}
                                                            </Typography>
                                                        </Box>

                                                        {/* Created Section */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 0.5,
                                                                flex: 1.2,
                                                                alignItems: 'center',
                                                                minWidth: 0
                                                            }}
                                                        >
                                                            <Typography
                                                                variant='caption'
                                                                sx={{
                                                                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                                                                    fontSize: '0.75rem',
                                                                    fontFamily: 'Cambria Math',
                                                                    fontWeight: 500,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: 0.5
                                                                }}
                                                            >
                                                                Created
                                                            </Typography>
                                                            <Typography
                                                                variant='body2'
                                                                sx={{
                                                                    color: isDark ? 'white' : 'black',
                                                                    fontSize: '0.825rem',
                                                                    fontFamily: 'Cambria Math',
                                                                    textAlign: 'center',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    maxWidth: '140px'
                                                                }}
                                                            >
                                                                {moment(apiKey.createdAt).format('MMM Do, YYYY')}
                                                            </Typography>
                                                        </Box>

                                                        {/* Right Section - Action Buttons */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1.5,
                                                                justifyContent: 'flex-end',
                                                                flexShrink: 0,
                                                                minWidth: '100px',
                                                                pl: 1
                                                            }}
                                                        >
                                                            <Tooltip title='Edit' placement='top'>
                                                                <IconButton
                                                                    onClick={() => edit(apiKey)}
                                                                    sx={{
                                                                        color: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                                                        backgroundColor: customization.isDarkMode
                                                                            ? 'rgba(226, 42, 144, 0.1)'
                                                                            : 'rgba(60, 91, 164, 0.1)',
                                                                        '&:hover': {
                                                                            backgroundColor: customization.isDarkMode
                                                                                ? 'rgba(226, 42, 144, 0.2)'
                                                                                : 'rgba(60, 91, 164, 0.2)'
                                                                        },
                                                                        width: 40,
                                                                        height: 40
                                                                    }}
                                                                >
                                                                    <IconEdit size={22} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title='Delete' placement='top'>
                                                                <IconButton
                                                                    color='error'
                                                                    onClick={() => deleteKey(apiKey)}
                                                                    sx={{
                                                                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(211, 47, 47, 0.2)'
                                                                        },
                                                                        width: 40,
                                                                        height: 40
                                                                    }}
                                                                >
                                                                    <IconTrash size={22} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>

                                                    {/* Soft Glow Effect */}
                                                    <Box
                                                        className='glow-effect'
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            borderRadius: '12px',
                                                            background:
                                                                'linear-gradient(to right, rgba(60,91,164,0.3), rgba(226,42,144,0.3))',
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s ease-in-out',
                                                            filter: 'blur(8px)',
                                                            zIndex: -1
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        ))}
                                    </>
                                )}
                            </Box>
                        )}
                    </>
                )}
            </MainCard>

            <APIKeyDialog
                show={showDialog}
                dialogProps={dialogProps}
                onCancel={() => setShowDialog(false)}
                onConfirm={onConfirm}
                setError={setError}
            />

            <Popover
                open={openPopOver}
                anchorEl={anchorEl}
                onClose={handleClosePopOver}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
            >
                <Typography variant='h6' sx={{ pl: 1, pr: 1, color: 'white', background: theme.palette.success.dark }}>
                    Copied!
                </Typography>
            </Popover>

            <ConfirmDialog />
        </>
    )
}

export default APIKey
