import './UserInfo.css'
import axios from 'axios'
import PropTypes from 'prop-types'
import userImage_light from '../../assets/images/userForm/userForm.svg'
import userImage_dark from '../../assets/images/userForm/userForm_dark.svg'
import { Box, Button, FormControl, Stack, TextField, Typography, IconButton } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, SET_USER_DATA } from '@/store/actions'
import { IconX } from '@tabler/icons-react'
import { Formik } from 'formik'
import * as Yup from 'yup'

const UserInfo = ({ setShowModal, forceOpen = false }) => {
    const user = useSelector((state) => state.user.userData)
    const isDarkMode = useSelector((state) => state.customization.isDarkMode)
    const dispatch = useDispatch()

    // 🔐 INVITE CONTEXT
    const inviteContext = JSON.parse(sessionStorage.getItem('inviteContext') || 'null')

    // ✅ INVITE FLOW ONLY IF USER HAS NO WORKSPACE
    const isInviteFlow = Boolean(inviteContext) && !user?.workspace

    // 🧹 CLEAR STALE INVITE CONTEXT
    if (inviteContext && user?.workspace) {
        sessionStorage.removeItem('inviteContext')
    }

    const API_BASE =
        window.location.hostname === 'localhost'
            ? 'http://localhost:2000'
            : window.location.hostname === 'thub-app.calmisland-c4dd80be.westus2.azurecontainerapps.io'
            ? 'https://thub-server.calmisland-c4dd80be.westus2.azurecontainerapps.io'
            : 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'

    const enqueueSnackbar = (args) => dispatch(enqueueSnackbarAction(args))

    // 🔄 Refresh user in redux
    const refreshUserData = async () => {
        const res = await axios.get(`${API_BASE}/userdata`, {
            params: { userId: user.uid }
        })

        dispatch({
            type: SET_USER_DATA,
            payload: res.data
        })
    }

    const initialValues = {
        company: '',
        department: '',
        designation: '',
        workspace: isInviteFlow ? inviteContext.workspace : ''
    }

    const validationSchema = Yup.object({
        company: Yup.string().required('Company is required'),
        department: Yup.string().required('Department is required'),
        designation: Yup.string().required('Designation is required'),
        workspace: Yup.string()
            .matches(/^[a-zA-Z0-9]*$/, 'Only letters & numbers allowed')
            .required('Workspace is required')
    })

    // -----------------------
    // SUBMIT
    // -----------------------
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const payload = {
                uid: user.uid,
                company: values.company,
                department: values.department,
                designation: values.designation,
                workspace: values.workspace
            }

            // ✅ ONLY for normal workspace creation
            if (!isInviteFlow) {
                await axios.post(`${API_BASE}/updateUser`, payload)
                await refreshUserData()

                enqueueSnackbar({
                    message: 'Workspace created successfully',
                    options: { variant: 'success' }
                })

                setShowModal(false)
                return
            }

            // ✅ INVITE FLOW: Call /invite/accept FIRST
            try {
                await axios.post(`${API_BASE}/invite/accept`, {
                    token: inviteContext.token,
                    uid: user.uid,
                    email: user.email
                })

                console.log('✅ Invite accepted successfully')
            } catch (acceptErr) {
                console.error('Invite acceptance failed:', acceptErr)

                enqueueSnackbar({
                    message: acceptErr.response?.data?.message || 'Failed to join workspace',
                    options: { variant: 'error' }
                })

                setSubmitting(false)
                return
            }

            // ✅ THEN update profile
            await axios.post(`${API_BASE}/updateUser`, payload)
            await refreshUserData()

            sessionStorage.removeItem('inviteContext')

            enqueueSnackbar({
                message: 'Profile completed & joined workspace',
                options: { variant: 'success' }
            })

            setShowModal(false)
        } catch (err) {
            enqueueSnackbar({
                message: err.response?.data?.message || 'Something went wrong',
                options: { variant: 'error' }
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleSkip = () => {
        sessionStorage.setItem('userInfoSkipped', 'true')

        enqueueSnackbar({
            message: 'You can complete your profile later',
            options: { variant: 'info' }
        })

        setShowModal(false)
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    width: 800,
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: isDarkMode ? '#191B1F' : '#fff'
                }}
            >
                <Box
                    sx={{
                        width: '50%',
                        backgroundImage: `url(${isDarkMode ? userImage_dark : userImage_light})`,
                        backgroundSize: 'cover'
                    }}
                />

                <Box sx={{ width: '50%', p: 4, position: 'relative' }}>
                    {!forceOpen && (
                        <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleSkip}>
                            <IconX />
                        </IconButton>
                    )}

                    <Typography variant='h4' mb={3}>
                        {isInviteFlow ? 'Complete Your Profile' : 'Create Workspace'}
                    </Typography>

                    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                            <form onSubmit={handleSubmit} noValidate>
                                <FormControl fullWidth>
                                    <Stack spacing={2}>
                                        <TextField
                                            label='Company'
                                            name='company'
                                            value={values.company}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.company && !!errors.company}
                                            helperText={touched.company && errors.company}
                                        />

                                        <TextField
                                            label='Department'
                                            name='department'
                                            value={values.department}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.department && !!errors.department}
                                            helperText={touched.department && errors.department}
                                        />

                                        <TextField
                                            label='Designation'
                                            name='designation'
                                            value={values.designation}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.designation && !!errors.designation}
                                            helperText={touched.designation && errors.designation}
                                        />

                                        {/* ✅ FIXED WORKSPACE FIELD */}
                                        <TextField
                                            label='Workspace'
                                            name='workspace'
                                            value={values.workspace}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={isInviteFlow}
                                            error={touched.workspace && !!errors.workspace}
                                            helperText={
                                                isInviteFlow ? 'Workspace assigned by admin' : touched.workspace && errors.workspace
                                            }
                                        />
                                    </Stack>
                                </FormControl>

                                <Button fullWidth sx={{ mt: 3 }} variant='contained' type='submit' disabled={isSubmitting}>
                                    {isInviteFlow ? 'Join Workspace' : 'Create Workspace'}
                                </Button>

                                {!forceOpen && (
                                    <Button fullWidth sx={{ mt: 1 }} variant='text' onClick={handleSkip}>
                                        Skip for now
                                    </Button>
                                )}
                            </form>
                        )}
                    </Formik>
                </Box>
            </Box>
        </Box>
    )
}

UserInfo.propTypes = {
    setShowModal: PropTypes.func.isRequired,
    forceOpen: PropTypes.bool
}

export default UserInfo
