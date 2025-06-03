import { useState } from 'react'
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
    InputAdornment
} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Top } from './Top'
import axios from 'axios'
import { setUserData } from '@/store/actions'
import { useDispatch, useSelector } from 'react-redux'

// images
import leftImage from '../../assets/images/auth/screen-5.png'
import thubLogo from '../../assets/images/THub_Logo_Icon.png'
import EyeCloseIcon from '@/assets/custom-svg/EyeCloseIcon'
import EyeOpenIcon from '@/assets/custom-svg/EyeOpenIcon'

const Login = () => {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)

    console.log('THub Prod:', import.meta.env.VITE_THUB_WEB_SERVER_PROD_URL)
    console.log('THub Demo:', import.meta.env.VITE_THUB_WEB_SERVER_DEMO_URL)
    console.log('THub local:', import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL)

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
                let apiUrl
                if (window.location.hostname === 'demo.thub.tech') {
                    apiUrl = 'https://thub-web-server-demo-378678297066.us-central1.run.app'
                } else if (window.location.hostname === 'localhost') {
                    apiUrl = 'http://localhost:2000'
                } else {
                    apiUrl = 'https://thub-web-server-2-0-378678297066.us-central1.run.app'
                }
                const loginResponse = await axios.post(`${apiUrl}/loginUser`, {
                    email: values.email,
                    password: values.password
                })

                console.log('Login Success:', loginResponse.data)

                const userId = loginResponse.data?.userId
                if (!userId) {
                    throw new Error('User ID not found in login response')
                }
                localStorage.setItem('userId', userId)
                console.log('User ID:', userId)
                // Second API call: Get full user data
                const userDataResponse = await axios.get(`${apiUrl}userdata`, { params: { userId } })

                const userData = userDataResponse.data[0]
                console.log('User Data:', userData)

                dispatch(setUserData(userData))
                navigate('/workflows')
            } catch (error) {
                console.error('Login Error:', error.response?.data || error.message)
                alert(error.response?.data?.message || 'Login failed. Please try again.')
            } finally {
                setLoading(false)
            }
        }
    })

    return (
        <Box sx={{ bgcolor: '#121212' }}>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    minHeight: '100vh',
                    backgroundColor: '#11121C'
                }}
            >
                <Box
                    sx={{
                        width: { xs: '100%', md: '50%' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            border: '1px solid white',
                            padding: '80px 40px 80px 40px',
                            borderRadius: '10px'
                        }}
                    >
                        <Typography
                            variant='h2'
                            style={{ fontFamily: 'cambria math', fontWeight: 'bolder', color: 'white', fontSize: '32px' }}
                            align='center'
                        >
                            Unlock the Power of
                            <br />
                            <span style={{ color: '#E22A90' }}>THub</span> GenAI Builder Tool.
                        </Typography>
                        <Box component='img' src={leftImage} alt='login image' sx={{ width: '100%', height: 'auto' }} />
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: { xs: '100%', md: '50%' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#12121C',
                        flexDirection: 'column'
                    }}
                >
                    <Box
                        component='img'
                        src={thubLogo}
                        alt='Thub image'
                        sx={{ width: '180px', height: 'auto', padding: '30px 0px 10px 0px' }}
                    />
                    <Top />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', my: 4 }}>
                        <Divider sx={{ flexGrow: 0.25 }} />
                        <Typography sx={{ mx: 2, whiteSpace: 'nowrap' }} variant='h5' color='white'>
                            Login with Email
                        </Typography>
                        <Divider sx={{ flexGrow: 0.25 }} />
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
                                    bgcolor: '#11121c',
                                    color: 'white',
                                    '& input': {
                                        color: 'white',
                                        backgroundColor: '#11121c'
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
                            <FormHelperText>{formik.touched.email && formik.errors.email ? formik.errors.email : '\u00A0'}</FormHelperText>
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
                                    bgcolor: '#11121c',
                                    color: 'white',
                                    '& input': {
                                        color: 'white',
                                        backgroundColor: '#11121c'
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
                            <FormHelperText>
                                {formik.touched.password && formik.errors.password ? formik.errors.password : '\u00A0'}
                            </FormHelperText>
                        </FormControl>

                        <Link
                            to='/forgot-password'
                            style={{
                                color: '#E32A90',
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
                            // disabled={loading}
                            sx={{
                                py: 1.5,
                                bgcolor: '#de1e88',
                                '&:hover': { bgcolor: '#E32A90' },
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
                            color='white'
                            textAlign={'center'}
                            sx={{ mb: 4, fontSize: '16px', fontFamily: 'cambria math' }}
                        >
                            Don&apos;t have an account?
                            <Link to='/signup' style={{ color: '#E32A90', marginLeft: '6px' }}>
                                Sign up for free
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Login
