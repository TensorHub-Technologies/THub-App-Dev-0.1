import { useState } from 'react'
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
import { useTheme } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import { Top } from './Top'
import { signUpValidationSchema } from './signUpValidationSchema'
import { ToastContainer, toast } from 'react-toastify'
import { useSelector, useDispatch } from 'react-redux'
import OTP_Modal from './OTP_Modal'
import { SET_USER_DATA } from '@/store/actions'

// images
import EyeCloseIcon from '@/assets/custom-svg/EyeCloseIcon'
import EyeOpenIcon from '@/assets/custom-svg/EyeOpenIcon'
import leftImage from '../../assets/images/auth/screen-5.png'
import thubLogo from '../../assets/images/THub_Logo_Icon.png'

const SignUp = () => {
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()

    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [email, setEmail] = useState('')
    const [tempUserData, setTempUserData] = useState(null)

    const apiUrl =
        window.location.hostname === 'localhost' ? 'http://localhost:2000' : 'https://thub-web-server-2-0-378678297066.us-central1.run.app'

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
        console.log('OTP Sent to email:', email)
        console.log('OTP provided:', otp)
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
                console.log('Registration response:', data)
                dispatch({
                    type: SET_USER_DATA,
                    payload: data.user
                })
                localStorage.setItem('userId', data.userId)
                setShowModal(false)
                toast.success('Registration successful!', {
                    theme: 'colored',
                    style: { background: customization?.isDarkMode ? '#e22a90' : '#3c5ba4', color: 'white' }
                })
                window.location.href = '/workflows'
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
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            password: '',
            confirmPassword: '',
            login_type: ''
        },
        validationSchema: signUpValidationSchema,
        onSubmit: async (values) => {
            console.log('Form values:', values)
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
        <Box sx={{ bgcolor: '#121212' }}>
            <CssBaseline />
            <ToastContainer />
            {showModal && (
                <OTP_Modal length={6} onOtpSubmit={onOtpSubmit} setShowModal={setShowModal} resendOtp={resendOtp} loading={loading} />
            )}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    minHeight: '100vh',
                    backgroundColor: '#11121C'
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
                            border: '1px solid white',
                            p: 4,
                            borderRadius: 2,
                            textAlign: 'center'
                        }}
                    >
                        <Typography
                            variant='h2'
                            align='center'
                            sx={{ fontFamily: 'Cambria Math', fontWeight: 'bolder', color: 'white', fontSize: 32 }}
                        >
                            Unlock the Power of
                            <br />
                            <span style={{ color: '#E22A90' }}>THub</span> GenAI Builder Tool.
                        </Typography>
                        <Box component='img' src={leftImage} alt='illustration' sx={{ width: '100%', mt: 2 }} />
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
                            boxShadow: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Box component='img' src={thubLogo} alt='logo' sx={{ width: 160, mb: 2 }} />
                        <Top />

                        <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                            <Divider sx={{ flex: 1 }} />
                            <Typography variant='h6' color='white' sx={{ mx: 2 }}>
                                Or Register with Email
                            </Typography>
                            <Divider sx={{ flex: 1 }} />
                        </Box>

                        <form onSubmit={formik.handleSubmit} noValidate>
                            {[
                                { name: 'email', placeholder: 'user@company.com' },
                                { name: 'firstName', placeholder: 'John' },
                                { name: 'lastName', placeholder: 'Doe' },
                                { name: 'phone', placeholder: '1234567890' }
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
                                        sx={{
                                            bgcolor: '#2e2e2e',
                                            color: 'white',
                                            '& input::placeholder': { color: '#bdbfd4', fontWeight: 'bold' }
                                        }}
                                    />
                                    <FormHelperText>
                                        {formik.touched[name] && formik.errors[name] ? formik.errors[name] : ' '}
                                    </FormHelperText>
                                </FormControl>
                            ))}

                            {/* Password */}
                            <FormControl fullWidth error={formik.touched.password && Boolean(formik.errors.password)} sx={{ mb: 2 }}>
                                <OutlinedInput
                                    id='password'
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='********'
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
                                        bgcolor: '#32353b',
                                        color: 'white',
                                        '& input::placeholder': { color: '#bdbfd4', fontWeight: 'bold' }
                                    }}
                                />
                                <FormHelperText>
                                    {formik.touched.password && formik.errors.password ? formik.errors.password : ' '}
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
                                    placeholder='********'
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    endAdornment={
                                        <InputAdornment position='end'>
                                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <EyeCloseIcon size={20} /> : <EyeOpenIcon size={20} />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    sx={{
                                        bgcolor: '#32353b',
                                        color: 'white',
                                        '& input::placeholder': { color: '#bdbfd4', fontWeight: 'bold' }
                                    }}
                                />
                                <FormHelperText>
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : ' '}
                                </FormHelperText>
                            </FormControl>

                            <Button
                                type='submit'
                                fullWidth
                                variant='contained'
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    bgcolor: '#de1e88',
                                    color: 'white',
                                    fontFamily: 'Cambria Math',
                                    fontSize: '1rem',
                                    '&:hover': { bgcolor: '#E32A90' }
                                }}
                            >
                                {loading ? <CircularProgress size={28} color='inherit' /> : otpSent ? 'Verify OTP' : 'Submit'}
                            </Button>
                        </form>

                        <Typography variant='body2' color='white' align='center' sx={{ mt: 2 }}>
                            Already have an account?{' '}
                            <Link to='/' style={{ color: '#E32A90', textDecoration: 'underline' }}>
                                Login
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default SignUp
