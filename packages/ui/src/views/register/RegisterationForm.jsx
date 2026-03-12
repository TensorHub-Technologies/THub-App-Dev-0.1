import { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Formik, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { showLoginModal, hideRegisterModal, showRegisterModal } from '@/store/actions'
import { useDispatch, useSelector } from 'react-redux'
import { TextField, Button, Typography, Box, Container, Paper, Grid, IconButton } from '@mui/material'
import '../register/RegisterationForm.css'

const RegistrationForm = () => {
    const formRef = useRef(null)
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.userData)
    const [workspace, setWorkspace] = useState('')
    const url = window.location.href || ''

    const thubWebServerDevUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_DEMO_URL || 'https://thub-server.calmisland-c4dd80be.westus2.azurecontainerapps.io'

    const thubWebServerQaUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_QA_URL || 'https://thub-server.lemonpond-e68ea8b7.westus2.azurecontainerapps.io'

    const thubWebServerProdUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_PROD_URL || 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'

    const thubWebServerLocalUrl = import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL || 'http://localhost:2000'

    let apiUrl

    if (window.location.hostname === 'dev.thub.tech') {
        apiUrl = thubWebServerDevUrl
    } else if (window.location.hostname === 'qa.thub.tech') {
        apiUrl = thubWebServerQaUrl
    } else if (window.location.hostname === 'localhost') {
        apiUrl = thubWebServerLocalUrl
    } else {
        apiUrl = thubWebServerProdUrl
    }

    useEffect(() => {
        const workspaceHost = new URL(url).hostname
        const workspace = workspaceHost.split('.')[0]
        setWorkspace(workspace)
    }, [url])

    if (!showRegisterModal && !showLoginModal) {
        return null
    }

    const initialValues = {
        firstName: '',
        lastName: '',
        company: '',
        designation: '',
        email: '',
        phone: '',
        password: '',
        workspace: workspace || ''
    }

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('First Name is required'),
        lastName: Yup.string().required('Last Name is required'),
        company: Yup.string().required('Company Name is required'),
        designation: Yup.string().required('Designation is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        phone: Yup.string()
            .matches(/^[0-9]+$/, 'Must be only digits')
            .min(10, 'Must be at least 10 digits')
            .required('Contact Number is required'),
        password: Yup.string().min(8, 'Password must be at least 8 characters long').required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required')
    })

    const handleCloseModal = () => {
        dispatch(hideRegisterModal())
    }

    const handleLogin = () => {
        dispatch(showLoginModal())
        dispatch(hideRegisterModal())
    }

    const checkEmail = async (email) => {
        try {
            const response = await axios.post(`${apiUrl}/check-email`, { email })
            return response.data.exists
        } catch (error) {
            console.error('Error checking email:', error)
            return false
        }
    }

    const handleSubmit = async (values) => {
        console.log('handleSubmit Clicked')
        try {
            const emailExists = await checkEmail(values.email)
            if (emailExists) {
                handleError('Email is already registered. Please use a different email.')
                return
            }

            const finalValues = {
                ...values,
                workspace
            }

            const response = await axios.post(`${apiUrl}/user/invite/register`, finalValues)
            if (response.status === 200 || response.statusText === 'OK') {
                localStorage.setItem('userId', response.data.userId)
                window.location.href = `https://${response.data.workspace}.thub.tech/?theme=lite&uid=${response.data.userId}`
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            handleError('Registration failed. Please try again later.')
        }
    }

    return (
        <div className={customization.isDarkMode ? 'modal-overlay-dark' : 'modal-overlay-light'} role='dialog' aria-modal='true'>
            <Container maxWidth='sm' ref={formRef}>
                <Paper elevation={3} className={customization.isDarkMode ? 'modal-content-dark' : 'modal-content-light'}>
                    <IconButton
                        aria-label='close'
                        onClick={() => handleCloseModal()}
                        className={customization.isDarkMode ? 'close-button-dark' : 'close-button-light'}
                    >
                        X
                    </IconButton>
                    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {({ handleChange, handleBlur, values }) => (
                            <Form>
                                <Typography
                                    variant='h2'
                                    align='center'
                                    marginBottom={2}
                                    style={{
                                        fontFamily: 'cambria math',
                                        fontWeight: 'bold',
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    }}
                                >
                                    Register
                                </Typography>
                                <Box component={Grid} container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label='First Name'
                                            name='firstName'
                                            value={values.firstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='firstName' component='div' className='error_message' />}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label='Last Name'
                                            name='lastName'
                                            value={values.lastName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='lastName' component='div' className='error_message' />}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Company Name'
                                            name='company'
                                            value={values.company}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='company' component='div' className='error_message' />}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Department'
                                            name='department'
                                            value={values.department}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='department' component='div' className='error_message' />}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Role'
                                            name='role'
                                            value={values.role}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='role' component='div' className='error_message' />}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Designation'
                                            name='designation'
                                            value={values.designation}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='designation' component='div' className='error_message' />}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Contact Number'
                                            name='phone'
                                            value={values.phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='phone' component='div' className='error_message' />}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Email'
                                            name='email'
                                            value={values.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='email' component='div' className='error_message' />}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Password'
                                            type='password'
                                            name='password'
                                            value={values.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='password' component='div' className='error_message' />}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Confirm Password'
                                            type='password'
                                            name='confirmPassword'
                                            value={values.confirmPassword}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='confirmPassword' component='div' className='error_message' />}
                                        />
                                    </Grid>
                                </Box>
                                <Box marginTop={3}>
                                    <Button
                                        type='submit'
                                        variant='contained'
                                        color='primary'
                                        fullWidth
                                        className={customization.isDarkMode ? 'button-dark' : 'button-light'}
                                    >
                                        Register
                                    </Button>
                                </Box>
                                <Box marginTop={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant='p' component='div'>
                                        Already have an account?
                                    </Typography>
                                    <Button
                                        color='primary'
                                        onClick={handleLogin}
                                        style={{ color: customization.isDarkMode ? '#E22A90' : '#3C5BA4', fontFamily: 'cambria math' }}
                                    >
                                        Login
                                    </Button>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                </Paper>
            </Container>
        </div>
    )
}

RegistrationForm.propTypes = {
    setShowRegisterModal: PropTypes.func.isRequired
}

export default RegistrationForm
