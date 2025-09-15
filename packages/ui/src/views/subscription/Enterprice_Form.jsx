import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Formik, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import 'react-toastify/dist/ReactToastify.css'
import { useSelector } from 'react-redux'
import { TextField, Button, Typography, Box, Container, Paper, Grid, IconButton } from '@mui/material'
import { IconX } from '@tabler/icons-react'

import './EnterpriceForm.css'

const EnterpriceForm = ({ setShowForm, handleLoading, handleError }) => {
    const formRef = useRef(null)
    const customization = useSelector((state) => state.customization)

    const initialValues = {
        firstName: '',
        lastName: '',
        companyName: '',
        designation: '',
        email: '',
        contactNumber: '',
        description: ''
    }

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('First Name is required'),
        lastName: Yup.string().required('Last Name is required'),
        companyName: Yup.string().required('Company Name is required'),
        designation: Yup.string().required('Designation is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        contactNumber: Yup.string()
            .matches(/^[0-9]+$/, 'Must be only digits')
            .min(10, 'Must be at least 10 digits')
            .required('Contact Number is required'),
        description: Yup.string().required('Description is required')
    })

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) {
                setShowForm(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [setShowForm])

    const handleSubmit = async (values, resetForm) => {
        console.log(values, 'submit clicked')
        try {
            let apiUrl

            if (window.location.hostname === 'demo.thub.tech') {
                apiUrl = 'https://thub-web-server-demo-378678297066.us-central1.run.app'
            } else if (window.location.hostname === 'localhost') {
                apiUrl = 'http://localhost:2000'
            } else {
                apiUrl = 'https://thub-web-server-2-0-378678297066.us-central1.run.app'
            }

            const response = await axios.post(`${apiUrl}/enterprice-mail`, values)
            if (response.status === 200 || response.status === 'ok') {
                handleLoading("We'll reach out shortly!")
                resetForm()
                setShowForm(false)
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            handleError('Form Submission Failed')
        }
    }

    return (
        <div className={customization.isDarkMode ? 'modal-overlay-dark' : 'modal-overlay-light'} role='dialog' aria-modal='true'>
            <Container maxWidth='sm' ref={formRef}>
                <Paper elevation={3} className={customization.isDarkMode ? 'modal-content-dark' : 'modal-content-light'}>
                    <IconButton
                        aria-label='close'
                        onClick={() => setShowForm(false)}
                        className={customization.isDarkMode ? 'close-button-dark' : 'close-button-light'}
                    >
                        <IconX />
                    </IconButton>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
                    >
                        {({ handleChange, handleBlur, values }) => (
                            <Form>
                                <Typography
                                    variant='h2'
                                    align='start'
                                    marginBottom={2}
                                    style={{
                                        fontFamily: "'Cambria Math', serif",
                                        fontSize: '32px',
                                        fontWeight: 'bolder',
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    }}
                                >
                                    Enterprise Inquiry Form
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
                                                    textAlign: 'left',
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='firstName' component='div' className='error_message' />}
                                            sx={{
                                                '& .MuiInput-underline:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#949494' : ''
                                                },
                                                '& .MuiInput-underline:hover:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#616161' : ''
                                                },
                                                '& .MuiInput-underline:after': {
                                                    borderBottomColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                }
                                            }}
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
                                                    textAlign: 'left',
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='lastName' component='div' className='error_message' />}
                                            sx={{
                                                '& .MuiInput-underline:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#949494' : ''
                                                },
                                                '& .MuiInput-underline:hover:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#616161' : ''
                                                },
                                                '& .MuiInput-underline:after': {
                                                    borderBottomColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Company Name'
                                            name='companyName'
                                            value={values.companyName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    textAlign: 'left',
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='companyName' component='div' className='error_message' />}
                                            sx={{
                                                '& .MuiInput-underline:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#949494' : ''
                                                },
                                                '& .MuiInput-underline:hover:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#616161' : ''
                                                },
                                                '& .MuiInput-underline:after': {
                                                    borderBottomColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                }
                                            }}
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
                                                    textAlign: 'left',
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='designation' component='div' className='error_message' />}
                                            sx={{
                                                '& .MuiInput-underline:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#949494' : ''
                                                },
                                                '& .MuiInput-underline:hover:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#616161' : ''
                                                },
                                                '& .MuiInput-underline:after': {
                                                    borderBottomColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                }
                                            }}
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
                                                    textAlign: 'left',
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='email' component='div' className='error_message' />}
                                            sx={{
                                                '& .MuiInput-underline:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#949494' : ''
                                                },
                                                '& .MuiInput-underline:hover:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#616161' : ''
                                                },
                                                '& .MuiInput-underline:after': {
                                                    borderBottomColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Contact Number'
                                            name='contactNumber'
                                            value={values.contactNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    textAlign: 'left',
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='contactNumber' component='div' className='error_message' />}
                                            sx={{
                                                '& .MuiInput-underline:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#949494' : ''
                                                },
                                                '& .MuiInput-underline:hover:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#616161' : ''
                                                },
                                                '& .MuiInput-underline:after': {
                                                    borderBottomColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label='Description'
                                            name='description'
                                            value={values.description}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            multiline
                                            rows={4}
                                            variant='standard'
                                            InputLabelProps={{
                                                style: {
                                                    textAlign: 'left',
                                                    color: customization.isDarkMode ? 'white' : '#9E9E9E',
                                                    fontFamily: "'Cambria Math', serif"
                                                }
                                            }}
                                            helperText={<ErrorMessage name='description' component='div' className='error_message' />}
                                            sx={{
                                                '& .MuiInput-underline:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#949494' : ''
                                                },
                                                '& .MuiInput-underline:hover:before': {
                                                    borderBottomColor: customization.isDarkMode ? '#616161' : ''
                                                },
                                                '& .MuiInput-underline:after': {
                                                    borderBottomColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Box>
                                <Box display='flex' justifyContent='center' alignItems='center' marginTop={3} gap={2}>
                                    <Button
                                        variant='outlined'
                                        sx={{
                                            color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                            borderColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                            '&:hover': {
                                                borderColor: customization.isDarkMode ? '#c91d78' : '#2c4883',
                                                backgroundColor: customization.isDarkMode ? '' : '#dbe9f8',
                                                color: customization.isDarkMode ? '#c91d78' : '#2c4883'
                                            }
                                        }}
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type='submit'
                                        variant='contained'
                                        sx={{
                                            color: '#ffff',
                                            bgcolor: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                            '&:hover': {
                                                bgcolor: customization.isDarkMode ? '#c91d78' : '#2c4883'
                                            }
                                        }}
                                    >
                                        Submit
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

EnterpriceForm.propTypes = {
    setShowForm: PropTypes.func.isRequired,
    handleLoading: PropTypes.func.isRequired,
    handleError: PropTypes.func.isRequired
}

export default EnterpriceForm
