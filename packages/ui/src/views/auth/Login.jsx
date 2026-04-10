import { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    CssBaseline,
    FormControl,
    OutlinedInput,
    FormHelperText,
    Divider,
    IconButton,
    InputAdornment,
    Alert
} from '@mui/material'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Top } from './Top'
import authApi from '@/api/auth'
import { setUserData, SET_DARKMODE } from '@/store/actions'
import { useDispatch, useSelector } from 'react-redux'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'

// images
import darkImage from '../../assets/images/auth/screen-5.png'
import lightImage from '../../assets/images/auth/screen-8.png'
import thubLogo from '../../assets/images/THub_Logo_Icon.png'
import EyeCloseIcon from '@/assets/custom-svg/EyeCloseIcon'
import EyeOpenIcon from '@/assets/custom-svg/EyeOpenIcon'
import { redirectAfterAuth } from '@/utils/authRedirect'

const Login = () => {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [requiredLoginMethod, setRequiredLoginMethod] = useState(null)
    const dispatch = useDispatch()
    const customization = useSelector((state) => state.customization)

    useEffect(() => {
        const url = new URL(window.location.href)
        const themeParam = url.searchParams.get('theme')
        if (themeParam) {
            const isDark = themeParam === 'dark'
            dispatch({ type: SET_DARKMODE, isDarkMode: isDark })
            localStorage.setItem('isDarkMode', isDark)
        }

        // ✅ Check if specific login method is required (from invite)
        const method = sessionStorage.getItem('requiredLoginMethod')
        if (method) {
            setRequiredLoginMethod(method)
        }
    }, [dispatch])

    // ✅ HELPER: Accept invite if context exists
    const acceptInviteIfNeeded = async (userEmail) => {
        const inviteContext = sessionStorage.getItem('inviteContext')
        if (!inviteContext) return

        try {
            const { token, email } = JSON.parse(inviteContext)

            // Email must match
            if (email !== userEmail) {
                console.warn('Invite email mismatch')
                sessionStorage.removeItem('inviteContext')
                return
            }

            await authApi.acceptInvite({ token })

            console.log('✅ Invite accepted successfully')

            // Clear the required login method
            sessionStorage.removeItem('requiredLoginMethod')
        } catch (err) {
            console.error('Failed to accept invite:', err)
            // Don't remove context here - let UserInfo handle it
        }
    }

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Required'),
            password: Yup.string().min(6, 'Must be at least 6 characters').required('Required')
        }),
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: async (values) => {
            try {
                setLoading(true)

                // 1️⃣ Login
                const loginResponse = await authApi.login({
                    email: values.email,
                    password: values.password
                })

                const userId = loginResponse.data?.userId
                if (!userId) throw new Error('User ID missing')

                authApi.storeAuthSession(loginResponse.data)

                // 2️⃣ Fetch user full data
                const inviteEmail = loginResponse.data?.user?.email || values.email
                await acceptInviteIfNeeded(inviteEmail)

                const userDataResponse = await authApi.getCurrentUser()

                const userData = userDataResponse.data
                dispatch(setUserData(userData))

                // 3️⃣ ✅ ACCEPT INVITE (if exists)

                // 4️⃣ Navigate to workflows
                redirectAfterAuth()
            } catch (error) {
                console.error('Login Error:', error)
                alert(error.response?.data?.message || 'Login failed')
            } finally {
                setLoading(false)
            }
        }
    })

    const passwordError = formik.touched.password && formik.errors.password

    // ✅ Get login method display name
    const getLoginMethodName = (method) => {
        switch (method) {
            case 'google':
                return 'Google'
            case 'github':
                return 'GitHub'
            case 'email':
                return 'Email'
            default:
                return method
        }
    }

    return (
        <Stack sx={{ width: '100%', color: 'grey.500' }}>
            {loading && <LinearProgress color='secondary' />}
            <Box sx={{ bgcolor: '#121212' }}>
                <CssBaseline />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        minHeight: '100vh',
                        backgroundColor: customization.isDarkMode ? '#000000' : '#ffffff'
                    }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            mt: 6,
                            justifyContent: 'center'
                        }}
                    >
                        <Box
                            sx={{
                                width: '90%',
                                border: customization.isDarkMode ? '1px solid white' : '1px solid gray',
                                p: 4,
                                borderRadius: 2,
                                textAlign: 'center',
                                height: '90%'
                            }}
                        >
                            <Typography
                                variant='h2'
                                align='center'
                                sx={{
                                    fontFamily: 'Cambria Math',
                                    fontWeight: 'bolder',
                                    color: customization.isDarkMode ? 'white' : 'black',
                                    fontSize: 32
                                }}
                            >
                                Unlock the Power of
                                <br />
                                <span style={{ color: customization.isDarkMode ? '#E22A90' : '#3c5ba4' }}>THub</span> GenAI Builder Tool.
                            </Typography>
                            <Box
                                component='img'
                                src={customization.isDarkMode ? darkImage : lightImage}
                                alt='illustration'
                                sx={{ width: '100%', mt: 2 }}
                            />
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            width: { xs: '100%', md: '50%' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: customization.isDarkMode ? '#000000' : '#ffffff',
                            flexDirection: 'column'
                        }}
                    >
                        <Box
                            component='img'
                            src={thubLogo}
                            alt='Thub image'
                            sx={{ width: '180px', height: 'auto', padding: '30px 0px 10px 0px', cursor: 'pointer' }}
                            onClick={() => window.location.reload()}
                        />

                        {/* ✅ ALERT: Required login method from invite */}
                        {requiredLoginMethod && (
                            <Box sx={{ width: '450px', mb: 2 }}>
                                <Alert
                                    severity='info'
                                    onClose={() => {
                                        sessionStorage.removeItem('requiredLoginMethod')
                                        setRequiredLoginMethod(null)
                                    }}
                                >
                                    <Typography variant='body2'>
                                        <strong>Workspace Invitation:</strong> Please sign in using{' '}
                                        <strong>{getLoginMethodName(requiredLoginMethod)}</strong> to accept your invitation.
                                    </Typography>
                                </Alert>
                            </Box>
                        )}

                        <Top setLoading={setLoading} />
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', my: 4 }}>
                            <Divider sx={{ flexGrow: 0.25 }} />
                            <Typography
                                sx={{ mx: 2, whiteSpace: 'nowrap' }}
                                variant='h5'
                                color={customization.isDarkMode ? 'white' : 'black'}
                            >
                                Login with Email
                            </Typography>
                            <Divider sx={{ flexGrow: 0.25, color: customization.isDarkMode ? 'white' : 'black' }} />
                        </Box>

                        <Box
                            component='form'
                            noValidate
                            onSubmit={formik.handleSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '450px' }}
                        >
                            <FormControl fullWidth error={formik.touched.email && Boolean(formik.errors.email)}>
                                <OutlinedInput
                                    id='email'
                                    name='email'
                                    type='email'
                                    placeholder='Email'
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    sx={{
                                        bgcolor: customization.isDarkMode ? '#000000' : '#ffffff',
                                        color: customization.isDarkMode ? 'white' : 'black',
                                        boxShadow: customization.isDarkMode
                                            ? '0px 5px 10px rgba(255, 255, 255, 0.1)'
                                            : '0px 5px 10px rgba(0, 0, 0, 0.1)',
                                        '& input': {
                                            color: customization.isDarkMode ? 'white' : 'black',
                                            backgroundColor: customization.isDarkMode ? '#000000' : '#ffffff'
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#bdbfd4'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#bdbfd4'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#bdbfd4'
                                        },
                                        '& .MuiInputAdornment-root .mail-icon': {
                                            color: '#bdbfd4'
                                        }
                                    }}
                                />
                                <FormHelperText>
                                    {formik.touched.email && formik.errors.email ? formik.errors.email : '\u00A0'}
                                </FormHelperText>
                            </FormControl>

                            <FormControl fullWidth error={formik.touched.password && Boolean(formik.errors.password)} sx={{ mt: -1 }}>
                                <OutlinedInput
                                    id='password'
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Password'
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    endAdornment={
                                        <InputAdornment position='end'>
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? (
                                                    <EyeCloseIcon color={customization.isDarkMode ? 'white' : 'black'} />
                                                ) : (
                                                    <EyeOpenIcon size={20} />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    sx={{
                                        bgcolor: customization.isDarkMode ? '#000000' : '#ffffff',
                                        color: customization.isDarkMode ? 'white' : 'black',
                                        boxShadow: customization.isDarkMode
                                            ? '0px 5px 10px rgba(255, 255, 255, 0.1)'
                                            : '0px 5px 10px rgba(0, 0, 0, 0.1)',
                                        '& input': {
                                            color: customization.isDarkMode ? 'white' : 'black',
                                            backgroundColor: customization.isDarkMode ? '#000000' : '#ffffff'
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#bdbfd4'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#bdbfd4'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#bdbfd4'
                                        },
                                        '& .MuiInputAdornment-root .lock-icon': {
                                            color: '#bdbfd4'
                                        }
                                    }}
                                />
                                <FormHelperText>{passwordError || '\u00A0'}</FormHelperText>
                            </FormControl>

                            <Link
                                to='/forgot-password'
                                style={{
                                    color: customization.isDarkMode ? '#E32A90' : '#3c5ba4',
                                    textDecoration: 'underline',
                                    alignSelf: 'flex-end',
                                    fontSize: '0.875rem',
                                    marginTop: '-26px'
                                }}
                            >
                                Forgot password?
                            </Link>

                            <Button
                                type='submit'
                                variant='contained'
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    bgcolor: customization.isDarkMode ? '#E22A90' : '#3c5ba4',
                                    '&:hover': { bgcolor: customization.isDarkMode ? '#E22A90' : '#3c5ba4' },
                                    mt: 2,
                                    color: 'black',
                                    fontFamily: 'cambira math',
                                    fontSize: '1rem'
                                }}
                            >
                                {loading ? <CircularProgress size={28} color='inherit' /> : 'Sign In With THub'}
                            </Button>
                            <Typography
                                variant='body2'
                                color={customization.isDarkMode ? 'white' : 'black'}
                                textAlign={'center'}
                                sx={{ mb: 4, fontSize: '16px', fontFamily: 'cambria math' }}
                            >
                                Don&apos;t have an account?
                                <Link to='/signup' style={{ color: customization.isDarkMode ? '#E32A90' : '#3c5ba4', marginLeft: '6px' }}>
                                    Sign up for free
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Stack>
    )
}

export default Login
