import { useState } from 'react'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    CssBaseline,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Typography
} from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useSelector } from 'react-redux'
import authApi from '@/api/auth'
import EyeCloseIcon from '@/assets/custom-svg/EyeCloseIcon'
import EyeOpenIcon from '@/assets/custom-svg/EyeOpenIcon'
import darkImage from '../../assets/images/auth/screen-5.png'
import lightImage from '../../assets/images/auth/screen-8.png'
import thubLogo from '../../assets/images/THub_Logo_Icon.png'

const ResetPassword = () => {
    const customization = useSelector((state) => state.customization)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [success, setSuccess] = useState('')
    const [serverError, setServerError] = useState('')
    const navigate = useNavigate()
    const { token } = useParams()

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: ''
        },
        validationSchema: Yup.object({
            password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password')], 'Passwords must match')
                .required('Required')
        }),
        onSubmit: async (values) => {
            setLoading(true)
            setServerError('')
            setSuccess('')

            try {
                await authApi.resetPassword(token, { password: values.password })
                setSuccess('Password updated successfully. You can sign in now.')
            } catch (error) {
                setServerError(error.response?.data?.message || 'Unable to reset password')
            } finally {
                setLoading(false)
            }
        }
    })

    const inputStyles = {
        bgcolor: customization.isDarkMode ? '#000000' : '#ffffff',
        color: customization.isDarkMode ? 'white' : 'black',
        boxShadow: customization.isDarkMode ? '0px 5px 10px rgba(255, 255, 255, 0.1)' : '0px 5px 10px rgba(0, 0, 0, 0.1)',
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
        }
    }

    return (
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
                            Reset your
                            <br />
                            <span style={{ color: customization.isDarkMode ? '#E22A90' : '#3c5ba4' }}>THub</span> password.
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
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3
                    }}
                >
                    <Box
                        sx={{
                            width: 450,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Box
                            component='img'
                            src={thubLogo}
                            alt='logo'
                            sx={{ width: 160, mb: 4, cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        />

                        {success ? (
                            <Box sx={{ width: '100%' }}>
                                <Alert severity='success' sx={{ mb: 3 }}>
                                    {success}
                                </Alert>
                                <Button
                                    fullWidth
                                    variant='contained'
                                    onClick={() => navigate('/')}
                                    sx={{
                                        py: 1.5,
                                        bgcolor: customization.isDarkMode ? '#E22A90' : '#3c5ba4',
                                        color: 'white'
                                    }}
                                >
                                    Back to Sign In
                                </Button>
                            </Box>
                        ) : (
                            <Box component='form' onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                                <Typography
                                    variant='h4'
                                    sx={{ color: customization.isDarkMode ? 'white' : 'black', mb: 3, fontFamily: 'Cambria Math' }}
                                >
                                    Set a new password
                                </Typography>

                                {serverError && (
                                    <Alert severity='error' sx={{ mb: 3 }}>
                                        {serverError}
                                    </Alert>
                                )}

                                <FormControl fullWidth error={formik.touched.password && Boolean(formik.errors.password)} sx={{ mb: 2 }}>
                                    <OutlinedInput
                                        id='password'
                                        name='password'
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='New Password'
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        endAdornment={
                                            <InputAdornment position='end'>
                                                <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                                                    {showPassword ? (
                                                        <EyeCloseIcon color={customization.isDarkMode ? 'white' : 'black'} />
                                                    ) : (
                                                        <EyeOpenIcon size={20} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        sx={inputStyles}
                                    />
                                    <FormHelperText>
                                        {formik.touched.password && formik.errors.password ? formik.errors.password : ' '}
                                    </FormHelperText>
                                </FormControl>

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
                                                <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)}>
                                                    {showConfirmPassword ? (
                                                        <EyeCloseIcon color={customization.isDarkMode ? 'white' : 'black'} />
                                                    ) : (
                                                        <EyeOpenIcon size={20} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        sx={inputStyles}
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
                                    disabled={loading || !token}
                                    sx={{
                                        py: 1.5,
                                        mt: 1,
                                        bgcolor: customization.isDarkMode ? '#E22A90' : '#3c5ba4',
                                        '&:hover': { bgcolor: customization.isDarkMode ? '#E22A90' : '#3c5ba4' },
                                        color: 'white'
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color='inherit' /> : 'Reset Password'}
                                </Button>

                                <Typography sx={{ mt: 3, textAlign: 'center', color: customization.isDarkMode ? 'white' : 'black' }}>
                                    Remembered it?
                                    <Link
                                        to='/'
                                        style={{
                                            color: customization.isDarkMode ? '#E32A90' : '#3c5ba4',
                                            marginLeft: 6
                                        }}
                                    >
                                        Sign in
                                    </Link>
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default ResetPassword
