import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import moment from 'moment'

// material-ui
import {
    Button,
    Box,
    Stack,
    IconButton,
    Toolbar,
    TextField,
    ButtonGroup,
    Chip,
    InputAdornment,
    Typography,
    Tooltip,
    Skeleton,
    useTheme
} from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { StyledButton } from '@/ui-component/button/StyledButton'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import emptyImage from '../../assets/images/glass.svg'
import emptyImagelite from '../../assets/images/glass-lite.svg'

// API
import variablesApi from '@/api/variables'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import { IconTrash, IconEdit, IconX, IconPlus } from '@tabler/icons-react'

// const
import AddEditVariableDialog from './AddEditVariableDialog'
import HowToUseVariablesDialog from './HowToUseVariablesDialog'
import { IconSearch } from '@tabler/icons-react'

// ==============================|| Variables ||============================== //

const Variables = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const isDark = customization.isDarkMode

    const dispatch = useDispatch()
    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [isLoading, setLoading] = useState(true)
    const [showVariableDialog, setShowVariableDialog] = useState(false)
    const [variableDialogProps, setVariableDialogProps] = useState({})
    const [variables, setVariables] = useState([])
    const [showHowToDialog, setShowHowToDialog] = useState(false)

    const { confirm } = useConfirm()

    const getAllVariables = useApi(variablesApi.getAllVariables)

    const [search, setSearch] = useState('')
    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const userData = useSelector((state) => state.user.userData)
    const tenantId = userData?.uid

    function filterVariables(data) {
        return data.name.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    const addNew = () => {
        const dialogProp = {
            type: 'ADD',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Add',
            data: {}
        }
        setVariableDialogProps(dialogProp)
        setShowVariableDialog(true)
    }

    const edit = (variable) => {
        const dialogProp = {
            type: 'EDIT',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Save',
            data: variable
        }
        setVariableDialogProps(dialogProp)
        setShowVariableDialog(true)
    }

    const deleteVariable = async (variable) => {
        const confirmPayload = {
            title: `Delete`,
            description: `Delete variable ${variable.name}?`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const deleteResp = await variablesApi.deleteVariable(variable.id)
                if (deleteResp.data) {
                    enqueueSnackbar({
                        message: 'Variable deleted',
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
                const errorData = error.response?.data || `${error.response?.status}: ${error.response?.statusText}`
                enqueueSnackbar({
                    message: `Failed to delete Variable: ${errorData}`,
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
        setShowVariableDialog(false)
        getAllVariables.request(tenantId)
    }

    useEffect(() => {
        getAllVariables.request(tenantId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setLoading(getAllVariables.loading)
    }, [getAllVariables.loading])

    useEffect(() => {
        if (getAllVariables.data) {
            setVariables(getAllVariables.data)
        }
    }, [getAllVariables.data])

    const filteredVariables = variables ? variables.filter(filterVariables) : []

    return (
        <>
            <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : '#f5faff' }}>
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
                                Variables
                            </h1>
                            <TextField
                                size='small'
                                sx={{
                                    display: { xs: 'none', sm: 'block' },
                                    ml: 3,
                                    transition: 'all .2s ease-in-out',
                                    '& input': { color: customization.isDarkMode ? '#fff' : '#000', width: '180px' },
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
                                            <IconSearch
                                                style={{ color: customization.isDarkMode ? '#fff' : '#000', width: 16, height: 16 }}
                                            />
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Box sx={{ flexGrow: 1 }} />
                            <Button
                                variant='outlined'
                                sx={{
                                    mr: 2,
                                    color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                                    borderColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                    '&:hover': {
                                        borderColor: customization.isDarkMode ? '#e22a90 !important' : '#3c5ba4 !important'
                                    }
                                }}
                                onClick={() => setShowHowToDialog(true)}
                            >
                                How To Use
                            </Button>
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
                                    >
                                        Add Variable
                                    </StyledButton>
                                </ButtonGroup>
                            </ButtonGroup>
                        </Toolbar>
                    </Box>
                </Stack>

                {variables.length === 0 && !isLoading && (
                    <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                        <Box sx={{ p: 2, height: 'auto' }}>
                            <img
                                style={{ objectFit: 'cover', height: '30vh', width: 'auto' }}
                                src={customization.isDarkMode ? emptyImage : emptyImagelite}
                                alt='VariablesEmptySVG'
                            />
                        </Box>
                        <div>No Variables Yet</div>
                    </Stack>
                )}

                {/* FlowListTable Style Cards */}
                {(variables.length > 0 || isLoading) && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
                                                overflow: 'hidden',
                                                display: 'flex',
                                                alignItems: 'center'
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
                                                {/* Left Section - Name and Type */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1.5 }}>
                                                    <Skeleton
                                                        variant='text'
                                                        width={120}
                                                        height={26}
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                    <Skeleton
                                                        variant='rounded'
                                                        width={60}
                                                        height={24}
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                </Box>

                                                {/* Value Section */}
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
                                                        width={100}
                                                        height={20}
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                </Box>

                                                {/* Last Updated Section */}
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
                                                        width={80}
                                                        height={16}
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                    <Skeleton
                                                        variant='text'
                                                        width={120}
                                                        height={20}
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                </Box>

                                                {/* Created Section */}
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
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                    <Skeleton
                                                        variant='text'
                                                        width={120}
                                                        height={20}
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                </Box>

                                                {/* Right Section - Action Buttons */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                                    <Skeleton
                                                        variant='circular'
                                                        width={24}
                                                        height={24}
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                    <Skeleton
                                                        variant='circular'
                                                        width={24}
                                                        height={24}
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
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
                                {filteredVariables.map((variable, index) => (
                                    <Box
                                        key={variable.id}
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
                                                {/* Left Section - Variable Name and Type */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 2, minWidth: 0 }}>
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
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {variable.name}
                                                    </Typography>
                                                    <Chip
                                                        color={variable.type === 'static' ? 'info' : 'secondary'}
                                                        size='small'
                                                        label={variable.type}
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            textTransform: 'capitalize',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                </Box>

                                                {/* Value Section */}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 0.5,
                                                        flex: 1,
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
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 0.5
                                                        }}
                                                    >
                                                        Value
                                                    </Typography>
                                                    <Tooltip title={variable.value} placement='top'>
                                                        <Typography
                                                            variant='body2'
                                                            sx={{
                                                                color: isDark ? 'white' : 'black',
                                                                fontSize: '0.875rem',
                                                                fontFamily: 'Cambria Math',
                                                                maxWidth: '120px',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {variable.value}
                                                        </Typography>
                                                    </Tooltip>
                                                </Box>

                                                {/* Last Updated Section - Reduced flex */}
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
                                                            fontSize: '0.825rem',
                                                            fontFamily: 'Cambria Math',
                                                            textAlign: 'center',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            maxWidth: '140px'
                                                        }}
                                                    >
                                                        {moment(variable.updatedDate).format('MMM Do, YYYY HH:mm')}
                                                    </Typography>
                                                </Box>

                                                {/* Created Section - Reduced flex */}
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
                                                        {moment(variable.createdDate).format('MMM Do, YYYY HH:mm')}
                                                    </Typography>
                                                </Box>

                                                {/* Right Section - Action Buttons - Increased space */}
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
                                                            onClick={() => edit(variable)}
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
                                                                width: 36,
                                                                height: 36
                                                            }}
                                                        >
                                                            <IconEdit size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='Delete' placement='top'>
                                                        <IconButton
                                                            color='error'
                                                            onClick={() => deleteVariable(variable)}
                                                            sx={{
                                                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(211, 47, 47, 0.2)'
                                                                },
                                                                width: 36,
                                                                height: 36
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
                            </>
                        )}
                    </Box>
                )}
            </MainCard>
            <AddEditVariableDialog
                show={showVariableDialog}
                dialogProps={variableDialogProps}
                onCancel={() => setShowVariableDialog(false)}
                onConfirm={onConfirm}
            ></AddEditVariableDialog>
            <HowToUseVariablesDialog show={showHowToDialog} onCancel={() => setShowHowToDialog(false)}></HowToUseVariablesDialog>
            <ConfirmDialog />
        </>
    )
}

export default Variables
