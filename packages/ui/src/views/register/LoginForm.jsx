import { useEffect, useState } from 'react'
import { Formik, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import './RegisterationForm.css'
import { TextField, Button, Typography, Box, Container, Paper, Grid, IconButton } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { hideLoginModal, showRegisterModal } from '@/store/actions'

const LoginForm = () => {
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    const [workspace, setWorkspace] = useState('')
    const url = window.location.href || ''

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().required('Password is required'),
        company: Yup.string().required('Company is required'),
        department: Yup.string().required('Department is required')
    })

    const initialValues = {
        email: '',
        password: '',
        company: '',
        department: '',
        workspace: workspace || ''
    }

    useEffect(() => {
        const workspaceHost = new URL(url).hostname
        const workspace = workspaceHost.split('.')[0]
        setWorkspace(workspace)
    }, [])

    const handleCloseModal = () => {
        dispatch(hideLoginModal())
    }

    const handleRegister = () => {
        dispatch(showRegisterModal())
        dispatch(hideLoginModal())
    }

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const apiUrl = import.meta.env.VITE_THUB_API_URL || window.location.origin

            const finalValues = {
                ...values,
                workspace
            }
            const response = await axios.post(`${apiUrl}/api/v1/auth/login`, finalValues)
            if (response.status === 200 || response.statusText === 'OK') {
                localStorage.setItem('userId', response.data.userId)
                window.location.href = `${window.location.origin}/?theme=lite&uid=${response.data.userId}`
            }
            resetForm()
        } catch (error) {
            alert('Login failed. Please check your credentials.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={customization.isDarkMode ? 'modal-overlay-dark' : 'modal-overlay-light'} role='dialog' aria-modal='true'>
            <Container maxWidth='sm'>
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
                                    Login
                                </Typography>
                                <Box component={Grid} container spacing={2}>
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
                                                style: { color: customization.isDarkMode ? 'white' : '#9E9E9E' }
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
                                                style: { color: customization.isDarkMode ? 'white' : '#9E9E9E' }
                                            }}
                                            helperText={<ErrorMessage name='password' component='div' className='error_message' />}
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
                                                style: { color: customization.isDarkMode ? 'white' : '#9E9E9E' }
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
                                                style: { color: customization.isDarkMode ? 'white' : '#9E9E9E' }
                                            }}
                                            helperText={<ErrorMessage name='department' component='div' className='error_message' />}
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
                                        Login
                                    </Button>
                                </Box>
                                <Box marginTop={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant='p' component='div'>
                                        Already have an account?
                                    </Typography>
                                    <Button
                                        color='primary'
                                        onClick={handleRegister}
                                        style={{ color: customization.isDarkMode ? '#E22A90' : '#3C5BA4', fontFamily: 'cambria math' }}
                                    >
                                        Register
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

export default LoginForm
