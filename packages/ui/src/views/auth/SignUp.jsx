import { useState } from 'react'
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    CssBaseline,
    Stack,
    FormControl,
    FormLabel,
    OutlinedInput,
    FormHelperText
} from '@mui/material'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const SignUp = () => {
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            password: '',
            login_type: ''
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Required'),
            firstName: Yup.string().required('Required'),
            lastName: Yup.string().required('Required'),
            phone: Yup.string()
                .matches(/^[0-9]{10,15}$/, 'Enter a valid phone number')
                .required('Required'),
            password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
            login_type: Yup.string().oneOf(['user', 'admin'], 'Select a valid login type').required('Required')
        }),
        onSubmit: (values) => {
            setLoading(true)
            setTimeout(() => {
                setLoading(false)
                console.log('SignUp attempted with:', values)
            }, 1000)
        }
    })

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
                {/* Left Side - SignUp Form */}
                <Box
                    sx={{
                        width: { xs: '100%', md: '50%' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 550,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            pt: 2,
                            borderRadius: 2,
                            boxShadow: 3
                        }}
                    >
                        <Stack>
                            <Typography variant='h1' sx={{ fontFamily: 'Cambria Math', fontSize: '2rem' }} color='white'>
                                Sign Up
                            </Typography>
                            <Typography variant='body2' color='white'>
                                Already have an account?
                                <Link to='/' style={{ color: '#1976d2', marginLeft: '4px', textDecoration: 'underline' }}>
                                    Login
                                </Link>
                            </Typography>
                        </Stack>

                        <Box
                            component='form'
                            noValidate
                            onSubmit={formik.handleSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                        >
                            {[
                                { name: 'email', label: 'Email', type: 'email', placeholder: 'user@company.com' },
                                { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'John' },
                                { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe' },
                                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '1234567890' },
                                { name: 'password', label: 'Password', type: 'password', placeholder: '********' }
                            ].map(({ name, label, type, placeholder }) => (
                                <FormControl key={name} fullWidth error={formik.touched[name] && Boolean(formik.errors[name])}>
                                    <FormLabel sx={{ mb: 1, color: 'white' }} htmlFor={name}>
                                        {label}
                                    </FormLabel>
                                    <OutlinedInput
                                        id={name}
                                        name={name}
                                        type={type}
                                        placeholder={placeholder}
                                        value={formik.values[name]}
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
                                        {formik.touched[name] && formik.errors[name] ? formik.errors[name] : '\u00A0'}
                                    </FormHelperText>
                                </FormControl>
                            ))}

                            <Button
                                type='submit'
                                variant='contained'
                                color='primary'
                                fullWidth
                                disabled={loading}
                                sx={{ py: 1.5, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                            >
                                {loading ? <CircularProgress size={24} color='inherit' /> : 'Sign Up'}
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Right Side - Image */}
                <Box
                    sx={{
                        width: { xs: '100%', md: '50%' },
                        display: { xs: 'none', md: 'block' },
                        backgroundImage: 'url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            </Box>
        </Box>
    )
}

export default SignUp
