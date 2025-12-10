import { Box, Button, CssBaseline, FormControl, FormHelperText, OutlinedInput, Typography, CircularProgress } from '@mui/material'
import { useState } from 'react'
import leftImage from '../../assets/images/auth/screen-5.png'
import thubLogo from '../../assets/images/THub_Logo_Icon.png'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import axios from 'axios'

export const ForgotPassword = () => {
    const [emailSent, setEmailSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Required')
        }),
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: async (values) => {
            setLoading(true)
            setError('')

            try {
                const thubWebServerDevUrl =
                    import.meta.env.VITE_THUB_WEB_SERVER_DEMO_URL || 'https://thub-web-server-demo-378678297066.us-central1.run.app'
                const thubWebServerProdUrl =
                    import.meta.env.VITE_THUB_WEB_SERVER_PROD_URL || 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'
                const thubWebServerLocalUrl = import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL || 'http://localhost:2000'

                let apiUrl

                if (window.location.hostname === 'demo.thub.tech') {
                    apiUrl = thubWebServerDevUrl
                } else if (window.location.hostname === 'localhost') {
                    apiUrl = thubWebServerLocalUrl
                } else {
                    apiUrl = thubWebServerProdUrl
                }

                const response = await axios.post(`${apiUrl}/forgot-password`, {
                    email: values.email
                })
                if (response.status === 200) {
                    setEmailSent(true)
                }
            } catch (error) {
                console.error('ForgotPassword Error:', error.response?.data || error.message)
                setError('Failed to send reset link. Please try again.')
                alert(error.response?.data?.message || 'ForgotPassword failed. Please try again.')
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
                            padding: '80px 40px',
                            borderRadius: '10px'
                        }}
                    >
                        <Typography
                            variant='h2'
                            style={{ fontFamily: 'cambria math', fontWeight: 'bolder', color: 'white', fontSize: '32px' }}
                            align='center'
                        >
                            Unlock the Power of
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
                        justifyContent: 'top',
                        bgcolor: '#12121C',
                        flexDirection: 'column'
                    }}
                >
                    <a href='https://app.thub.tech/'>
                        <Box
                            component='img'
                            src={thubLogo}
                            alt='Thub image'
                            sx={{ width: '180px', height: 'auto', marginY: '40px', cursor: 'pointer' }}
                        />
                    </a>
                    <Button
                        onClick={() => navigate('/')}
                        aria-label='Close'
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            minWidth: 'auto',
                            padding: 1,
                            color: '#bdbfd4',
                            bgcolor: 'transparent',
                            '&:hover': {
                                bgcolor: '#1e1e2f'
                            }
                        }}
                    >
                        ✖️
                    </Button>

                    {emailSent ? (
                        <Typography sx={{ color: '#4caf50', fontSize: '1rem', mt: 4 }}>
                            ✅ A password reset link has been sent to your email.
                        </Typography>
                    ) : (
                        <Box
                            component='form'
                            noValidate
                            onSubmit={formik.handleSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '350px' }}
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
                                <FormHelperText>
                                    {formik.touched.email && formik.errors.email ? formik.errors.email : '\u00A0'}
                                </FormHelperText>
                            </FormControl>

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
                                    fontFamily: 'cambria math',
                                    fontSize: '1rem'
                                }}
                            >
                                {loading ? <CircularProgress size={28} color='inherit' /> : 'Send Password Link'}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    )
}
