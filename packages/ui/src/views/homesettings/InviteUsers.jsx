import { useState } from 'react'
import { TextField, Button, Typography, Box, List, ListItem, ListItemText, Grid } from '@mui/material'
import axios from 'axios'
import { useSelector } from 'react-redux'
import './InviteUsers.css'

function InviteUsers() {
    const [email, setEmail] = useState('')
    const [invitedUsers, setInvitedUsers] = useState([])
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const customization = useSelector((state) => state.customization)
    const userData = useSelector((state) => state.user.userData)
    const workspace = userData.workspace
    const uid = userData.uid

    const handleInputChange = (e) => {
        setEmail(e.target.value)
        setError('')
        setSuccessMessage('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.')
            return
        }
        const apiUrl =
            window.location.hostname === 'localhost'
                ? 'http://localhost:2000'
                : 'https://thub-web-server-2-0-378678297066.us-central1.run.app'

        try {
            const response = await axios.post(`${apiUrl}/api/invite`, { email, workspace, uid })

            if (response.status === 200) {
                setSuccessMessage(`Invitation sent to ${email}!`)
                setInvitedUsers([...invitedUsers, email])
                setEmail('')
            } else {
                setError(response.data.message || 'Failed to send the invitation.')
            }
        } catch (err) {
            setError('An error occurred while sending the invitation.')
        }
    }

    return (
        <>
            <Typography variant='h1' gutterBottom style={{ fontFamily: 'cambria math' }}>
                There&apos;s a team behind every success
            </Typography>
            <Box sx={{ width: '100%', margin: '0 auto', padding: 3, border: '1px solid #ddd', borderRadius: 2 }}>
                <Typography variant='h2' gutterBottom style={{ fontFamily: 'cambria math' }}>
                    Invite Team to Workspace
                </Typography>
                <Box>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label='Email'
                                    type='email'
                                    value={email}
                                    onChange={handleInputChange}
                                    placeholder='Enter email address'
                                    variant='standard'
                                    InputLabelProps={{
                                        style: {
                                            textAlign: 'left',
                                            color: '#9E9E9E',
                                            fontFamily: "'Cambria Math', serif",
                                            fontSize: '1rem'
                                        }
                                    }}
                                    helperText={
                                        error ? (
                                            <Typography variant='caption' color='error'>
                                                {error}
                                            </Typography>
                                        ) : null
                                    }
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            fontSize: '1.2rem',
                                            fontFamily: 'cambria math'
                                        },
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
                        </Grid>
                        <Button
                            type='submit'
                            variant='contained'
                            sx={{
                                color: '#ffff',
                                bgcolor: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                fontFamily: 'cambria math',
                                fontSize: '14px',
                                marginTop: '6px',
                                paddingBottom: '0px',
                                '&:hover': {
                                    bgcolor: customization.isDarkMode ? '#c91d78' : '#2c4883'
                                }
                            }}
                        >
                            Invite
                        </Button>
                    </form>
                </Box>

                {invitedUsers.length > 0 && (
                    <Box sx={{ marginTop: 3 }}>
                        <Typography variant='h5' style={{ fontFamily: 'cambria math' }}>
                            Invited Users:
                        </Typography>
                        <List>
                            {invitedUsers.map((user, index) => (
                                <ListItem
                                    key={index}
                                    style={{ borderBottom: customization.isDarkMode ? '1px solid #9E9E9E' : '1px solid black' }}
                                >
                                    <ListItemText
                                        primary={user}
                                        sx={{
                                            '& .MuiTypography-root': {
                                                fontFamily: 'Cambria Math'
                                            }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Box>
        </>
    )
}

export default InviteUsers
