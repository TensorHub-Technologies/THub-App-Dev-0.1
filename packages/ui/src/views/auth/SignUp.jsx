import { useState, useEffect } from 'react'
import axios from 'axios'
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    CssBaseline,
    FormControl,
    OutlinedInput,
    FormHelperText,
    InputAdornment,
    IconButton,
    Divider
} from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import { useFormik } from 'formik'
import { Top } from './Top'
import { signUpValidationSchema } from './signUpValidationSchema'
import toast, { Toaster } from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import OTP_Modal from './OTP_Modal'
import { SET_USER_DATA, SET_DARKMODE } from '@/store/actions'
import { useNavigate } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'

// images
import EyeCloseIcon from '@/assets/custom-svg/EyeCloseIcon'
import EyeOpenIcon from '@/assets/custom-svg/EyeOpenIcon'
import darkImage from '../../assets/images/auth/screen-5.png'
import lightImage from '../../assets/images/auth/screen-8.png'
import thubLogo from '../../assets/images/THub_Logo_Icon.png'

const SignUp = () => {
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    // 🔑 INVITE REDIRECT
    const redirectTo = location.state?.redirectTo
    const inviteEmail = location.state?.inviteEmail

    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [email, setEmail] = useState('')
    const [tempUserData, setTempUserData] = useState(null)

    useEffect(() => {
        const url = new URL(window.location.href)
        const themeParam = url.searchParams.get('theme')
        if (themeParam) {
            const isDark = themeParam === 'dark'
            dispatch({ type: SET_DARKMODE, isDarkMode: isDark })
            localStorage.setItem('isDarkMode', isDark)
        }
    }, [dispatch])

    const thubWebServerDevUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_DEMO_URL || 'https://thub-server.calmisland-c4dd80be.westus2.azurecontainerapps.io'
    const thubWebServerProdUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_PROD_URL || 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'
    const thubWebServerLocalUrl = import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL || 'http://localhost:2000'

    let apiUrl

    if (window.location.hostname === 'thub-app.calmisland-c4dd80be.westus2.azurecontainerapps.io') {
        apiUrl = thubWebServerDevUrl
    } else if (window.location.hostname === 'localhost') {
        apiUrl = thubWebServerLocalUrl
    } else {
        apiUrl = thubWebServerProdUrl
    }

    // ✅ HELPER: Accept invite if context exists
    const acceptInviteIfNeeded = async (userId, userEmail) => {
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

            await axios.post(`${apiUrl}/invite/accept`, {
                token,
                uid: userId,
                email: userEmail
            })

            console.log('✅ Invite accepted successfully')
        } catch (err) {
            console.error('Failed to accept invite:', err)
            // Don't remove context here - let UserInfo handle it
        }
    }

    const checkEmail = async (email) => {
        try {
            const { data } = await axios.post(`${apiUrl}/check-email`, { email })
            return data.exists
        } catch (err) {
            console.error('Error checking email:', err)
            return false
        }
    }

    // Verify the OTP
    const verifyOtp = async (otp) => {
        try {
            const response = await axios.post(`${apiUrl}/verify-otp`, { email, otp })
            if (response.status === 200) {
                toast.success('OTP Verification Successful', {
                    theme: 'colored',
                    style: {
                        background: 'black',
                        color: 'white'
                    }
                })
                setShowModal(true)
                return true
            } else {
                toast.error(`Invalid OTP`, {
                    theme: 'colored',
                    style: {
                        background: 'red',
                        color: 'white'
                    }
                })
                return false
            }
        } catch (error) {
            console.error('Error verifying OTP:', error)
            return false
        }
    }

    const resendOtp = () => {
        setOtpSent(false)
        sendOtp(email)
    }

    const sendOtp = async (email) => {
        setLoading(true)
        try {
            const response = await axios.post(`${apiUrl}/send-otp`, { email })
            if (response.status === 200) {
                toast.success('OTP sent successfully', {
                    theme: 'colored',
                    style: {
                        background: customization?.isDarkMode ? '#e22a90' : '#3c5ba4',
                        color: 'white'
                    }
                })
                setOtpSent(true)
                setShowModal(true)
                setEmail(email)
            } else {
                toast.error('Failed to send OTP', {
                    theme: 'colored',
                    style: { background: 'red', color: 'white' }
                })
            }
        } catch (err) {
            console.error('Error sending OTP:', err)
            toast.error('Error sending OTP', {
                theme: 'colored',
                style: { background: 'red', color: 'white' }
            })
        } finally {
            setLoading(false)
        }
    }

    // OTP Modal submit handler
    const onOtpSubmit = async (otp) => {
        setLoading(true)
        try {
            const otpVerified = await verifyOtp(otp)
            if (!otpVerified) {
                toast.error('OTP verification failed. Please try again.', {
                    theme: 'colored',
                    style: { background: 'red', color: 'white' }
                })
                return
            }
            // OTP verified, register user
            const payload = {
                email: tempUserData.email,
                firstName: tempUserData.firstName,
                lastName: tempUserData.lastName,
                phone: tempUserData.phone,
                password: tempUserData.password,
                subscription_type: 'free',
                login_type: 'email',
                subscription_duration: null,
                subscription_date: new Date().toISOString().split('T')[0]
            }
            const response = await axios.post(`${apiUrl}/user/register`, payload)
            if (response.status === 200) {
                const data = response.data
                dispatch({
                    type: SET_USER_DATA,
                    payload: data.user
                })
                localStorage.setItem('userId', data.userId)
                setShowModal(false)

                // ✅ ACCEPT INVITE (if exists)
                await acceptInviteIfNeeded(data.userId, tempUserData.email)

                toast.success('Registration successful!', {
                    theme: 'colored',
                    style: { background: customization?.isDarkMode ? '#e22a90' : '#3c5ba4', color: 'white' }
                })

                // 🔑 IMPORTANT: respect invite redirect
                if (redirectTo) {
                    navigate(redirectTo, { replace: true })
                } else {
                    navigate('/workflows')
                }
            } else {
                toast.error('Registration failed', {
                    theme: 'colored',
                    style: { background: 'red', color: 'white' }
                })
            }
        } catch (error) {
            console.error('Error registering user:', error)
            toast.error('Registration failed', {
                theme: 'colored',
                style: { background: 'red', color: 'white' }
            })
        } finally {
            setLoading(false)
        }
    }

    const formik = useFormik({
        initialValues: {
            email: inviteEmail || '',
            firstName: '',
            lastName: '',
            phone: '',
            password: '',
            confirmPassword: '',
            login_type: ''
        },
        validationSchema: signUpValidationSchema,
        onSubmit: async (values) => {
            setLoading(true)
            try {
                const exists = await checkEmail(values.email)
                if (exists) {
                    toast.error('Email already exists', {
                        theme: 'colored',
                        style: { background: 'red', color: 'white' }
                    })
                    setLoading(false)
                    return
                }
                setTempUserData(values)
                await sendOtp(values.email)
            } catch (err) {
                toast.error('Something went wrong', {
                    theme: 'colored',
                    style: { background: 'red', color: 'white' }
                })
            } finally {
                setLoading(false)
            }
        }
    })

    return (
        <Stack sx={{ width: '100%', color: 'grey.500' }}>
            {loading && <LinearProgress color='secondary' />}
            <Box sx={{ bgcolor: '#121212' }}>
                <CssBaseline />
                <Toaster />
                {showModal && (
                    <OTP_Modal length={6} onOtpSubmit={onOtpSubmit} setShowModal={setShowModal} resendOtp={resendOtp} loading={loading} />
                )}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        minHeight: '100vh',
                        backgroundColor: customization.isDarkMode ? '#000000' : '#ffffff'
                    }}
                >
                    {/* Left graphic */}
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

                    {/* Right form */}
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3
                        }}
                    >
                        <Box
                            sx={{
                                width: 500,
                                bgcolor: 'transparent',
                                p: 3,
                                borderRadius: 2,
                                border: 'none',
                                outline: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <Box
                                component='img'
                                src={thubLogo}
                                alt='logo'
                                sx={{ width: 160, mb: 2, cursor: 'pointer' }}
                                onClick={() => window.location.reload()}
                            />
                            <Top setLoading={setLoading} />

                            <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                                <Divider sx={{ flex: 1 }} />
                                <Typography
                                    variant='h5'
                                    color={customization.isDarkMode ? 'white' : 'black'}
                                    sx={{ mx: 2, fontFamily: 'Cambria Math' }}
                                >
                                    Register with Email
                                </Typography>
                                <Divider sx={{ flex: 1, color: customization.isDarkMode ? 'white' : 'black', width: '300px' }} />
                            </Box>

                            <form onSubmit={formik.handleSubmit} noValidate>
                                {[
                                    { name: 'email', placeholder: 'Email' },
                                    { name: 'firstName', placeholder: 'FirstName' },
                                    { name: 'lastName', placeholder: 'LastName' },
                                    { name: 'phone', placeholder: 'Phone Number' }
                                ].map(({ name, placeholder }) => (
                                    <FormControl
                                        key={name}
                                        fullWidth
                                        error={formik.touched[name] && Boolean(formik.errors[name])}
                                        sx={{ mb: 2 }}
                                    >
                                        <OutlinedInput
                                            id={name}
                                            name={name}
                                            type={name === 'phone' ? 'tel' : 'text'}
                                            placeholder={placeholder}
                                            value={formik.values[name]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={name === 'email' && Boolean(inviteEmail)}
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
                                            {name === 'email' && inviteEmail
                                                ? 'Email locked because this is an invite'
                                                : formik.touched[name] && formik.errors[name]
                                                ? formik.errors[name]
                                                : ' '}
                                        </FormHelperText>
                                    </FormControl>
                                ))}

                                {/* Password */}
                                <FormControl fullWidth error={formik.touched.password && Boolean(formik.errors.password)} sx={{ mb: 2 }}>
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
                                            '& .MuiInputAdornment-root .mail-icon': {
                                                color: '#bdbfd4'
                                            }
                                        }}
                                    />
                                    <FormHelperText>
                                        {formik.touched.password && formik.errors.password ? formik.errors.password : ' '}
                                    </FormHelperText>
                                </FormControl>

                                {/* Confirm Password */}
                                <FormControl
                                    fullWidth
                                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                    sx={{ mb: 2 }}
                                >
                                    <OutlinedInput
                                        id='confirmPassword'
                                        name='confirmPassword'
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder='Confirm Password'
                                        value={formik.values.confirmPassword}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        endAdornment={
                                            <InputAdornment position='end'>
                                                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                    {showConfirmPassword ? (
                                                        <EyeCloseIcon color={customization.isDarkMode ? 'white' : 'black'} size={20} />
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
                                            '& .MuiInputAdornment-root .mail-icon': {
                                                color: '#bdbfd4'
                                            }
                                        }}
                                    />
                                    <FormHelperText>
                                        {formik.touched.confirmPassword && formik.errors.confirmPassword
                                            ? formik.errors.confirmPassword
                                            : ' '}
                                    </FormHelperText>
                                </FormControl>

                                <Button
                                    type='submit'
                                    fullWidth
                                    variant='contained'
                                    disabled={loading}
                                    sx={{
                                        py: 1.5,
                                        bgcolor: customization.isDarkMode ? '#E22A90' : '#3c5ba4',
                                        color: 'white',
                                        fontFamily: 'Cambria Math',
                                        fontSize: '1rem',
                                        '&:hover': { bgcolor: customization.isDarkMode ? '#E22A90' : '#3c5ba4' },
                                        '&.Mui-disabled': {
                                            bgcolor: '#E22A90',
                                            color: 'white',
                                            opacity: 0.7
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={28} color='inherit' /> : otpSent ? 'Verify OTP' : 'Submit'}
                                </Button>
                            </form>

                            <Typography
                                variant='body2'
                                color={customization.isDarkMode ? 'white' : 'black'}
                                align='center'
                                sx={{ mt: 2, fontFamily: 'Cambria Math', fontSize: '16px' }}
                            >
                                Already have an account?{' '}
                                <Link
                                    to='/'
                                    style={{ color: customization.isDarkMode ? '#E22A90' : '#3c5ba4', textDecoration: 'underline' }}
                                >
                                    Login
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Stack>
    )
}

export default SignUp
