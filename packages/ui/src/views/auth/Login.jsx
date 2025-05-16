import { useState } from 'react'
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    CssBaseline,
    Link as MuiLink,
    Stack,
    FormControl,
    FormLabel,
    OutlinedInput,
    FormHelperText
} from '@mui/material'
import { Link } from 'react-router-dom'
import { GitHubIcon, GoogleIcon, MicrosoftIcon } from './CustomIcons'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import image from '@/assets/images/image.png'

const Login = () => {
    const [loading, setLoading] = useState(false)

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
        onSubmit: (values) => {
            setLoading(true)
            setTimeout(() => {
                setLoading(false)
                console.log('Login attempted with:', values)
            }, 1000)
        }
    })

    const handleGoogleLogin = () => {
        console.log('Continue With Google')
    }

    const handleMicrosoftLogin = () => {
        console.log('Continue With Microsoft')
    }

    return (
        <Box sx={{ bgcolor: '#121212' }}>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    minHeight: '100vh'
                }}
            >
                <Box
                    sx={{
                        width: { xs: '100%', md: '50%' },
                        display: { xs: 'none', md: 'block' },
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <Box
                    sx={{
                        width: { xs: '100%', md: '50%' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        bgcolor: '#12121C'
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 550,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            p: 2,
                            borderRadius: 2,
                            boxShadow: 3
                        }}
                    >
                        <Stack>
                            <Typography variant='h1' sx={{ fontFamily: 'Cambria Math', fontSize: '2rem' }} color='white'>
                                Sign In
                            </Typography>
                            <Typography variant='body2' color='white'>
                                Don&apos;t have an account?
                                <Link to='/signup' style={{ color: '#1976d2', textDecoration: 'underline' }}>
                                    Sign up for free
                                </Link>
                            </Typography>
                        </Stack>

                        <Box
                            component='form'
                            noValidate
                            onSubmit={formik.handleSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                        >
                            <FormControl fullWidth error={formik.touched.email && Boolean(formik.errors.email)}>
                                <FormLabel sx={{ mb: 1, color: 'white' }} htmlFor='email'>
                                    Email
                                </FormLabel>
                                <OutlinedInput
                                    id='email'
                                    name='email'
                                    type='email'
                                    placeholder='user@company.com'
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    sx={{
                                        bgcolor: '#2e2e2e',
                                        color: 'white',
                                        '& input': {
                                            color: 'white',
                                            backgroundColor: '#32353b',
                                            '::placeholder': {
                                                fontWeight: 'bold',
                                                color: '#bbbbbb'
                                            }
                                        }
                                    }}
                                />
                                <FormHelperText>
                                    {formik.touched.email && formik.errors.email ? formik.errors.email : '\u00A0'}
                                </FormHelperText>
                            </FormControl>

                            <FormControl fullWidth error={formik.touched.password && Boolean(formik.errors.password)}>
                                <FormLabel sx={{ mb: 1, color: 'white' }} htmlFor='password'>
                                    Password
                                </FormLabel>
                                <OutlinedInput
                                    id='password'
                                    name='password'
                                    type='password'
                                    placeholder='********'
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    sx={{
                                        bgcolor: '#2e2e2e',
                                        color: 'white',
                                        '& input': {
                                            color: 'white',
                                            backgroundColor: '#32353b',
                                            '::placeholder': {
                                                fontWeight: 'bold',
                                                color: '#bbbbbb'
                                            }
                                        }
                                    }}
                                />
                                <FormHelperText>
                                    {formik.touched.password && formik.errors.password ? formik.errors.password : '\u00A0'}
                                </FormHelperText>
                            </FormControl>

                            <MuiLink
                                href='/forgot-password'
                                sx={{ color: '#1976d2', textDecoration: 'underline', alignSelf: 'flex-end', fontSize: '0.875rem' }}
                            >
                                Forgot password?
                            </MuiLink>

                            <Button
                                type='submit'
                                variant='contained'
                                color='primary'
                                fullWidth
                                disabled={loading}
                                sx={{ py: 1.5, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                            >
                                {loading ? <CircularProgress size={24} color='inherit' /> : 'Login'}
                            </Button>
                            <Stack gap={2} sx={{ mt: 2 }}>
                                <Button
                                    variant='outlined'
                                    fullWidth
                                    onClick={handleGoogleLogin}
                                    sx={{
                                        py: 1.5,
                                        color: 'white',
                                        borderColor: '#555',
                                        bgcolor: '#2e2e2e',
                                        '&:hover': { bgcolor: '#3e3e3e', borderColor: '#777' }
                                    }}
                                    startIcon={<GoogleIcon />}
                                >
                                    Continue With Google
                                </Button>

                                <Button
                                    variant='outlined'
                                    fullWidth
                                    onClick={handleGoogleLogin}
                                    sx={{
                                        py: 1.5,
                                        color: 'white',
                                        borderColor: '#555',
                                        bgcolor: '#2e2e2e',
                                        '&:hover': { bgcolor: '#3e3e3e', borderColor: '#777' }
                                    }}
                                    startIcon={<GitHubIcon />}
                                >
                                    Continue With Github
                                </Button>

                                <Button
                                    variant='outlined'
                                    fullWidth
                                    onClick={handleMicrosoftLogin}
                                    sx={{
                                        py: 1.5,
                                        pr: 2,
                                        color: 'white',
                                        borderColor: '#555',
                                        bgcolor: '#2e2e2e',
                                        '&:hover': { bgcolor: '#3e3e3e', borderColor: '#777' }
                                    }}
                                    startIcon={<MicrosoftIcon />}
                                >
                                    Continue With Microsoft
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Login
