import { useState } from 'react'
import axios from 'axios'
import { Box, Button, FormControl, FormLabel, IconButton, Modal, Stack, TextField, Typography } from '@mui/material'
import { StyledButton } from '../button/StyledButton'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import { IconX } from '@tabler/icons'
import { useNavigate } from 'react-router-dom';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
}

const blurStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropFilter: 'blur(5px)',
    zIndex: 10
}

const UserInfo = ({ setShowModal, showModal }) => {
    const navigate = useNavigate();
    const { uid } = useSelector((state) => state.user.userData)
    const dispatch = useDispatch()
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const [formData, setFormData] = useState({
        uid,
        department: '',
        role: '',
        designation: '',
        company: '',
        workspace: ''
    })

    const [workspaceError, setWorkspaceError] = useState('')
    const customization = useSelector((state) => state.customization)

    const handleClose = () => setShowModal(false)

    const handleSkip = () => {
        setShowModal(false)
        sessionStorage.setItem('modalShown', 'true')
        handleClose()
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name === 'workspace') {
            const isValid = /^[a-zA-Z0-9]*$/.test(value)
            if (!isValid) {
                setWorkspaceError('Workspace name can only contain letters and numbers without spaces or special characters.')
            } else {
                setWorkspaceError('')
            }
        }
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        if (!formData.department || !formData.role || !formData.designation || !formData.company || !formData.workspace) {
            enqueueSnackbar({
                message: 'Please fill out all required fields.',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            return
        }
        const Url =
            window.location.hostname === 'localhost'
                ? 'http://localhost:4000/updateUser'
                : 'https://thub-dev-420204.uc.r.appspot.com/updateUser'
        try {
            const response = await axios.post(Url, formData)
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
            }
            setFormData({
                department: '',
                role: '',
                designation: '',
                company: '',
                workspace: ''
            })
            console.log("formData.workspace: ",formData.workspace);
            window.location.href = `http://${formData.workspace}.thub.tech/?theme=dark&uid=${uid}`;    
            handleClose()
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    return (
        <div style={showModal ? blurStyle : null}>
            <Modal open={showModal} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
                <Box sx={style}>
                    <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, color: customization.isDarkMode ? '#e22a90' : '#3c5ba4' }}
                        onClick={handleSkip}
                    >
                        <IconX />
                    </IconButton>
                    <Typography id='modal-modal-title' variant='h3' component='h2' sx={{ textAlign: 'center' }}>
                        User Info
                    </Typography>

                    <FormControl variant='outlined' fullWidth required sx={{ mt: '14px' }}>
                        <Stack spacing={2}>
                            <FormLabel htmlFor='company'>Company Name</FormLabel>

                            <TextField
                                id='standard-basic'
                                variant='standard'
                                name='company'
                                placeholder='Company Name'
                                value={formData.company}
                                onChange={handleInputChange}
                                required
                            />
                            <FormLabel htmlFor='department'>Department</FormLabel>
                            <TextField
                                id='standard-basic'
                                variant='standard'
                                name='department'
                                placeholder='Department'
                                value={formData.department}
                                onChange={handleInputChange}
                                required
                            />
                            <FormLabel htmlFor='role'>Role</FormLabel>
                            <TextField
                                id='standard-basic'
                                variant='standard'
                                name='role'
                                placeholder='Role'
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            />
                            <FormLabel htmlFor='designation'>Designation</FormLabel>
                            <TextField
                                id='standard-basic'
                                variant='standard'
                                name='designation'
                                placeholder='Designation'
                                value={formData.designation}
                                onChange={handleInputChange}
                                required
                            />
                            <FormLabel htmlFor='workspace'>Workspace Name</FormLabel>
                            <TextField
                                id='standard-basic'
                                variant='standard'
                                name='workspace'
                                placeholder='Workspace Name'
                                value={formData.workspace}
                                onChange={handleInputChange}
                                error={!!workspaceError}
                                helperText={workspaceError}
                                required
                            />
                        </Stack>
                    </FormControl>
                    <Stack direction='row' gap={38} mt={4}>
                        <StyledButton onClick={handleSkip}>Skip</StyledButton>
                        <StyledButton onClick={handleSubmit} disabled={!!workspaceError}>
                            Submit
                        </StyledButton>
                    </Stack>
                </Box>
            </Modal>
        </div>
    )
}

UserInfo.propTypes = {
    setShowModal: PropTypes.func,
    showModal: PropTypes.bool
}
export default UserInfo
