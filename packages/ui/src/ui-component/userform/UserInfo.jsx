import './UserInfo.css'
import axios from 'axios'
import PropTypes from 'prop-types'
import userImage_light from '../../assets/images/userForm/userForm.svg'
import userImage_dark from '../../assets/images/userForm/userForm_dark.svg'
import { Box, Button, FormControl, Stack, TextField, Typography, IconButton } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import { useNavigate } from 'react-router'
import { IconX } from '@tabler/icons'
import { Formik } from 'formik'
import * as Yup from 'yup'

const UserInfo = ({ setShowModal, showModal }) => {
    const navigate = useNavigate()
    const { uid } = useSelector((state) => state.user.userData)
    const dispatch = useDispatch()
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const isDarkMode = useSelector((state) => state.customization.isDarkMode)
    const customization = useSelector((state) => state.customization)
    console.log(showModal, 'showModal')
    const handleClose = () => setShowModal(false)

    const handleSkip = () => {
        setShowModal(false)
        sessionStorage.setItem('modalShown', 'true')
        handleClose()
    }

    const initialValues = {
        company: '',
        department: '',
        role: '',
        designation: '',
        workspace: ''
    }

    const validationSchema = Yup.object().shape({
        company: Yup.string().required('Company Name is required'),
        department: Yup.string().required('Department is required'),
        role: Yup.string().required('Role is required'),
        designation: Yup.string().required('Designation is required'),
        workspace: Yup.string()
            .matches(/^[a-zA-Z0-9]*$/, 'Workspace name can only contain letters and numbers')
            .required('Workspace Name is required')
    })

    const handleSubmit = async (values, { resetForm }) => {
        const Url =
            window.location.hostname === 'localhost'
                ? 'http://localhost:2000/updateUser'
                : 'https://thub-web-server-2-0-378678297066.us-central1.run.app/updateUser'

        try {
            const response = await axios.post(Url, { ...values, uid })
            if (response.status === 200) {
                enqueueSnackbar({
                    message: 'User data updated successfully',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                resetForm()
                window.location.href = `https://${values.workspace}.thub.tech/?theme=dark&uid=${uid}`
                handleClose()
            }
        } catch (error) {
            enqueueSnackbar({
                message: 'Failed to update user data',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            })
            console.error('Error:', error)
        }
    }

    return (
        <div>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        width: '800px',
                        boxShadow: 3,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: isDarkMode ? '#191B1F' : 'white'
                    }}
                >
                    <Box
                        sx={{
                            width: '50%',
                            backgroundImage: isDarkMode ? `url(${userImage_dark})` : `url(${userImage_light})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></Box>

                    <Box
                        sx={{
                            width: '50%',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            position: 'relative'
                        }}
                    >
                        <IconButton
                            sx={{ position: 'absolute', top: '2px', right: '4px', color: customization.isDarkMode ? '#e22a90' : '#3c5ba4' }}
                            onClick={handleSkip}
                        >
                            <IconX />
                        </IconButton>
                        <Typography
                            variant='h2'
                            gutterBottom
                            className={`typography-font ${isDarkMode ? 'user-form-heading-dark' : 'user-form-heading-light'}`}
                        >
                            User Details
                        </Typography>
                        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                <form onSubmit={handleSubmit}>
                                    <FormControl fullWidth>
                                        <Stack spacing={2}>
                                            <TextField
                                                label='Company Name'
                                                name='company'
                                                variant='outlined'
                                                value={values.company}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.company && !!errors.company}
                                                helperText={touched.company && errors.company}
                                                required
                                            />
                                            <TextField
                                                label='Department'
                                                name='department'
                                                variant='outlined'
                                                value={values.department}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.department && !!errors.department}
                                                helperText={touched.department && errors.department}
                                                required
                                            />
                                            <TextField
                                                label='Role'
                                                name='role'
                                                variant='outlined'
                                                value={values.role}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.role && !!errors.role}
                                                helperText={touched.role && errors.role}
                                                required
                                            />
                                            <TextField
                                                label='Designation'
                                                name='designation'
                                                variant='outlined'
                                                value={values.designation}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.designation && !!errors.designation}
                                                helperText={touched.designation && errors.designation}
                                                required
                                            />
                                            <TextField
                                                label='Workspace Name'
                                                name='workspace'
                                                variant='outlined'
                                                value={values.workspace}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.workspace && !!errors.workspace}
                                                helperText={touched.workspace && errors.workspace}
                                                required
                                            />
                                        </Stack>
                                    </FormControl>

                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Button
                                            variant='contained'
                                            sx={{
                                                mt: 3,
                                                width: '40%',
                                                bgcolor: isDarkMode ? '#e22a90' : '#3c5ba4',
                                                '&:hover': {
                                                    bgcolor: isDarkMode ? '#c91d78' : '#2c4883'
                                                }
                                            }}
                                            onClick={handleSkip}
                                        >
                                            Skip
                                        </Button>
                                        <Button
                                            variant='contained'
                                            sx={{
                                                mt: 3,
                                                width: '40%',
                                                bgcolor: isDarkMode ? '#e22a90' : '#3c5ba4',
                                                '&:hover': {
                                                    bgcolor: isDarkMode ? '#c91d78' : '#2c4883'
                                                }
                                            }}
                                            type='submit'
                                        >
                                            Submit
                                        </Button>
                                    </Box>
                                </form>
                            )}
                        </Formik>
                    </Box>
                </Box>
            </Box>
        </div>
    )
}

UserInfo.propTypes = {
    setShowModal: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired
}

export default UserInfo
