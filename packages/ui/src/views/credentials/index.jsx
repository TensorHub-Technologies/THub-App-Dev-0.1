import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import moment from 'moment'

// material-ui
import { Button, Box, Skeleton, Stack, IconButton, useTheme, Typography, Tooltip } from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { StyledButton } from '@/ui-component/button/StyledButton'
import CredentialListDialog from './CredentialListDialog'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import AddEditCredentialDialog from './AddEditCredentialDialog'

// API
import credentialsApi from '@/api/credentials'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import { IconTrash, IconEdit, IconX, IconPlus } from '@tabler/icons-react'
import keySVG from '@/assets/images/key.svg'

// const
import { baseURL } from '@/store/constant'
import { SET_COMPONENT_CREDENTIALS } from '@/store/actions'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'

// ==============================|| Credentials ||============================== //

const Credentials = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showCredentialListDialog, setShowCredentialListDialog] = useState(false)
    const [credentialListDialogProps, setCredentialListDialogProps] = useState({})
    const [showSpecificCredentialDialog, setShowSpecificCredentialDialog] = useState(false)
    const [specificCredentialDialogProps, setSpecificCredentialDialogProps] = useState({})
    const [credentials, setCredentials] = useState([])
    const [componentsCredentials, setComponentsCredentials] = useState([])

    const { confirm } = useConfirm()

    const userData = useSelector((state) => state.user.userData)
    const isDark = customization.isDarkMode

    const tenantId = userData?.uid || localStorage.getItem('userId')

    const getAllCredentialsApi = useApi(credentialsApi.getAllCredentials)
    const getAllComponentsCredentialsApi = useApi(credentialsApi.getAllComponentsCredentials)

    const [search, setSearch] = useState('')
    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }
    function filterCredentials(data) {
        return data.credentialName.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    const listCredential = () => {
        const dialogProp = {
            title: 'Add New Credential',
            componentsCredentials
        }
        setCredentialListDialogProps(dialogProp)
        setShowCredentialListDialog(true)
    }

    const addNew = (credentialComponent) => {
        const dialogProp = {
            type: 'ADD',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Add',
            credentialComponent
        }
        setSpecificCredentialDialogProps(dialogProp)
        setShowSpecificCredentialDialog(true)
    }

    const edit = (credential) => {
        const dialogProp = {
            type: 'EDIT',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Save',
            data: credential
        }
        setSpecificCredentialDialogProps(dialogProp)
        setShowSpecificCredentialDialog(true)
    }

    const deleteCredential = async (credential) => {
        const confirmPayload = {
            title: `Delete`,
            description: `Delete credential ${credential.name}?`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const deleteResp = await credentialsApi.deleteCredential(credential.id)
                if (deleteResp.data) {
                    enqueueSnackbar({
                        message: 'Credential deleted',
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
                    message: `Failed to delete Credential: ${
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

    const onCredentialSelected = (credentialComponent) => {
        setShowCredentialListDialog(false)
        addNew(credentialComponent)
    }

    const onConfirm = () => {
        setShowCredentialListDialog(false)
        setShowSpecificCredentialDialog(false)
        getAllCredentialsApi.request(tenantId)
    }

    useEffect(() => {
        getAllCredentialsApi.request(tenantId)
        getAllComponentsCredentialsApi.request()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setLoading(getAllCredentialsApi.loading)
    }, [getAllCredentialsApi.loading])

    useEffect(() => {
        if (getAllCredentialsApi.data) {
            setCredentials(getAllCredentialsApi.data)
        }
    }, [getAllCredentialsApi.data])

    useEffect(() => {
        if (getAllCredentialsApi.error) {
            setError(getAllCredentialsApi.error)
        }
    }, [getAllCredentialsApi.error])

    useEffect(() => {
        if (getAllComponentsCredentialsApi.data) {
            setComponentsCredentials(getAllComponentsCredentialsApi.data)
            dispatch({ type: SET_COMPONENT_CREDENTIALS, componentsCredentials: getAllComponentsCredentialsApi.data })
        }
    }, [getAllComponentsCredentialsApi.data, dispatch])

    const filteredCredentials = credentials ? credentials.filter(filterCredentials) : []

    return (
        <>
            <MainCard>
                {error ? (
                    <ErrorBoundary error={error} />
                ) : (
                    <Stack flexDirection='column' sx={{ gap: 3 }}>
                        <ViewHeader
                            onSearchChange={onSearchChange}
                            search={true}
                            searchPlaceholder='Search Credentials'
                            title='Credentials'
                            description='API keys, tokens, and secrets for 3rd party integrations'
                        >
                            <StyledButton
                                variant='contained'
                                sx={{ borderRadius: 2, height: '100%' }}
                                onClick={listCredential}
                                startIcon={<IconPlus />}
                            >
                                Add Credential
                            </StyledButton>
                        </ViewHeader>

                        {!isLoading && credentials.length <= 0 ? (
                            <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                                <Box sx={{ p: 2, height: 'auto' }}>
                                    {/* <img
                                        style={{ objectFit: 'cover', height: '16vh', width: 'auto' }}
                                        src={CredentialEmptySVG}
                                        alt='CredentialEmptySVG'
                                    /> */}
                                </Box>
                                <div>No Credentials Yet</div>
                            </Stack>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {isLoading ? (
                                    // Loading skeletons
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
                                                {/* Main Glass Card - matching the actual card structure */}
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        border: '1px solid',
                                                        borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '12px',
                                                        backdropFilter: 'blur(16px)',
                                                        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                                        height: '6rem',
                                                        width: '100%',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    {/* Content - matching the actual content structure */}
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
                                                        {/* Left Section - Icon and Name */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                                            <Skeleton
                                                                variant='circular'
                                                                width={40}
                                                                height={40}
                                                                sx={{
                                                                    flexShrink: 0,
                                                                    backgroundColor: isDark
                                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                                        : 'rgba(0, 0, 0, 0.1)'
                                                                }}
                                                            />
                                                            <Skeleton
                                                                variant='text'
                                                                width={180}
                                                                height={26}
                                                                sx={{
                                                                    backgroundColor: isDark
                                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                                        : 'rgba(0, 0, 0, 0.1)'
                                                                }}
                                                            />
                                                        </Box>

                                                        {/* Center Section - Last Updated */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 0.5,
                                                                flex: 1,
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <Skeleton
                                                                variant='text'
                                                                width={60}
                                                                height={16}
                                                                sx={{
                                                                    backgroundColor: isDark
                                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                                        : 'rgba(0, 0, 0, 0.1)'
                                                                }}
                                                            />
                                                            <Skeleton
                                                                variant='text'
                                                                width={120}
                                                                height={20}
                                                                sx={{
                                                                    backgroundColor: isDark
                                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                                        : 'rgba(0, 0, 0, 0.1)'
                                                                }}
                                                            />
                                                        </Box>

                                                        {/* Center Right Section - Created */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 0.5,
                                                                flex: 1,
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <Skeleton
                                                                variant='text'
                                                                width={50}
                                                                height={16}
                                                                sx={{
                                                                    backgroundColor: isDark
                                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                                        : 'rgba(0, 0, 0, 0.1)'
                                                                }}
                                                            />
                                                            <Skeleton
                                                                variant='text'
                                                                width={120}
                                                                height={20}
                                                                sx={{
                                                                    backgroundColor: isDark
                                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                                        : 'rgba(0, 0, 0, 0.1)'
                                                                }}
                                                            />
                                                        </Box>

                                                        {/* Right Section - Action Buttons */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                justifyContent: 'flex-end'
                                                            }}
                                                        >
                                                            <Skeleton
                                                                variant='circular'
                                                                width={24}
                                                                height={24}
                                                                sx={{
                                                                    backgroundColor: isDark
                                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                                        : 'rgba(0, 0, 0, 0.1)'
                                                                }}
                                                            />
                                                            <Skeleton
                                                                variant='circular'
                                                                width={24}
                                                                height={24}
                                                                sx={{
                                                                    backgroundColor: isDark
                                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                                        : 'rgba(0, 0, 0, 0.1)'
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))}
                                    </>
                                ) : (
                                    // Actual data
                                    <>
                                        {filteredCredentials.map((credential, index) => (
                                            <Box
                                                key={credential.id}
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
                                                        height: '6rem',
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
                                                        {/* Left Section - Credential Icon and Name */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                                            <Box
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: isDark
                                                                        ? theme.palette.common.white
                                                                        : theme.palette.grey[300] + 75,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0
                                                                }}
                                                            >
                                                                <img
                                                                    style={{
                                                                        width: '80%',
                                                                        height: '80%',
                                                                        objectFit: 'contain'
                                                                    }}
                                                                    alt={credential.credentialName}
                                                                    src={`${baseURL}/api/v1/components-credentials-icon/${credential.credentialName}`}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null
                                                                        e.target.src = keySVG
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography
                                                                variant='h6'
                                                                sx={{
                                                                    fontFamily: 'Cambria Math',
                                                                    fontWeight: 'bold',
                                                                    color: isDark ? 'white' : 'black',
                                                                    fontSize: '1.1rem',
                                                                    lineHeight: 1.2
                                                                }}
                                                            >
                                                                {credential.name}
                                                            </Typography>
                                                        </Box>

                                                        {/* Center Section - Last Updated */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 0.5,
                                                                flex: 1,
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <Typography
                                                                variant='caption'
                                                                sx={{
                                                                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 500,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: 0.5
                                                                }}
                                                            >
                                                                Last Updated
                                                            </Typography>
                                                            <Typography
                                                                variant='body2'
                                                                sx={{
                                                                    color: isDark ? 'white' : 'black',
                                                                    fontSize: '0.875rem',
                                                                    fontFamily: 'Cambria Math'
                                                                }}
                                                            >
                                                                {moment(credential.updatedDate).format('MMMM Do, YYYY HH:mm:ss')}
                                                            </Typography>
                                                        </Box>

                                                        {/* Center Right Section - Created */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 0.5,
                                                                flex: 1,
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <Typography
                                                                variant='caption'
                                                                sx={{
                                                                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                                                                    fontSize: '0.75rem',
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
                                                                    fontSize: '0.875rem',
                                                                    fontFamily: 'Cambria Math'
                                                                }}
                                                            >
                                                                {moment(credential.createdDate).format('MMMM Do, YYYY HH:mm:ss')}
                                                            </Typography>
                                                        </Box>

                                                        {/* Right Section - Action Buttons */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                justifyContent: 'flex-end'
                                                            }}
                                                        >
                                                            <Tooltip title='Edit' placement='top'>
                                                                <IconButton
                                                                    color='primary'
                                                                    onClick={() => edit(credential)}
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
                                                                    <IconEdit size={18} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title='Delete' placement='top'>
                                                                <IconButton
                                                                    color='error'
                                                                    onClick={() => deleteCredential(credential)}
                                                                    sx={{
                                                                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(211, 47, 47, 0.2)'
                                                                        }
                                                                    }}
                                                                >
                                                                    <IconTrash size={18} />
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
                    </Stack>
                )}
            </MainCard>
            <CredentialListDialog
                show={showCredentialListDialog}
                dialogProps={credentialListDialogProps}
                onCancel={() => setShowCredentialListDialog(false)}
                onCredentialSelected={onCredentialSelected}
            ></CredentialListDialog>
            <AddEditCredentialDialog
                show={showSpecificCredentialDialog}
                dialogProps={specificCredentialDialogProps}
                onCancel={() => setShowSpecificCredentialDialog(false)}
                onConfirm={onConfirm}
                setError={setError}
            ></AddEditCredentialDialog>
            <ConfirmDialog />
        </>
    )
}

export default Credentials
