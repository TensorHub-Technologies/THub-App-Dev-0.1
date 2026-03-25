import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import authApi from '@/api/auth'
import { Box, Button, Typography, CircularProgress, Alert, Paper } from '@mui/material'
import { useSelector } from 'react-redux'
import { IconBrandGoogle, IconMail, IconBrandGithub } from '@tabler/icons-react'
import { apiBaseUrl } from '@/utils/apiBaseUrl'

const AcceptInvite = () => {
    const [params] = useSearchParams()
    const token = params.get('token')
    const navigate = useNavigate()
    const user = useSelector((state) => state.user.userData)

    const [invite, setInvite] = useState(null)
    const [loading, setLoading] = useState(true)
    const [existingUser, setExistingUser] = useState(null)
    const [checkingUser, setCheckingUser] = useState(true)

    // ----------------------------------
    // Validate invite & check if user exists
    // ----------------------------------
    useEffect(() => {
        if (!token) {
            navigate('/')
            return
        }

        const validateAndCheckUser = async () => {
            try {
                // 1️⃣ Validate invite
                const inviteRes = await axios.get(`${apiBaseUrl}/invite/validate`, { params: { token } })
                const inviteData = inviteRes.data

                setInvite(inviteData)

                // ✅ Store invite context
                sessionStorage.setItem(
                    'inviteContext',
                    JSON.stringify({
                        workspace: inviteData.workspace,
                        role: inviteData.role,
                        email: inviteData.email,
                        token
                    })
                )

                // 2️⃣ Check if user with this email already exists
                try {
                    const userCheckRes = await authApi.checkEmail({
                        email: inviteData.email
                    })

                    if (userCheckRes.data.exists) {
                        setExistingUser({
                            exists: true,
                            login_type: userCheckRes.data.login_type
                        })
                    } else {
                        setExistingUser({ exists: false })
                    }
                } catch (err) {
                    console.error('Error checking user:', err)
                    setExistingUser({ exists: false })
                }
            } catch (err) {
                console.error('Invite validation failed:', err)
                navigate('/')
            } finally {
                setLoading(false)
                setCheckingUser(false)
            }
        }

        validateAndCheckUser()
    }, [token, navigate])

    // ----------------------------------
    // Handle continue based on user state
    // ----------------------------------
    const handleContinue = (authType = null) => {
        // ✅ USER ALREADY LOGGED IN
        if (user?.uid) {
            // Check if logged-in user email matches invite
            if (user.email !== invite.email) {
                alert(`This invite is for ${invite.email}. Please log out and sign in with the correct account.`)
                return
            }
            navigate('/workflows')
            return
        }

        // ✅ NEW USER → SIGNUP
        if (!existingUser?.exists) {
            navigate('/signup', {
                state: {
                    inviteEmail: invite.email,
                    redirectTo: '/workflows'
                }
            })
            return
        }

        // ✅ EXISTING USER → LOGIN (with specific method if needed)
        if (authType) {
            // Store the required login method
            sessionStorage.setItem('requiredLoginMethod', authType)
        }
        navigate('/')
    }

    // ----------------------------------
    // Get login method display info
    // ----------------------------------
    const getLoginMethodInfo = (loginType) => {
        switch (loginType) {
            case 'google':
                return {
                    name: 'Google',
                    icon: <IconBrandGoogle size={20} />,
                    color: '#DB4437'
                }
            case 'github':
                return {
                    name: 'GitHub',
                    icon: <IconBrandGithub size={20} />,
                    color: '#333'
                }
            case 'email':
                return {
                    name: 'Email',
                    icon: <IconMail size={20} />,
                    color: '#1976d2'
                }
            default:
                return {
                    name: loginType,
                    icon: <IconMail size={20} />,
                    color: '#1976d2'
                }
        }
    }

    // ----------------------------------
    // Loading state
    // ----------------------------------
    if (loading || checkingUser) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 2
                }}
            >
                <CircularProgress />
                <Typography>Validating invite...</Typography>
            </Box>
        )
    }

    if (!invite) return null

    const loginMethod = existingUser?.exists ? getLoginMethodInfo(existingUser.login_type) : null

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                bgcolor: '#f5f5f5',
                p: 3
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    maxWidth: 600,
                    width: '100%',
                    p: 4,
                    textAlign: 'center'
                }}
            >
                {/* Invite Header */}
                <Typography variant='h4' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    🎉 You&apos;ve Been Invited!
                </Typography>

                {/* Workspace Info */}
                <Box
                    sx={{
                        bgcolor: '#f0f7ff',
                        p: 3,
                        borderRadius: 2,
                        mb: 3
                    }}
                >
                    <Typography variant='body1' color='text.secondary' gutterBottom>
                        You&apos;ve been invited to join
                    </Typography>
                    <Typography variant='h5' sx={{ fontWeight: 700, color: '#3c5ba4' }}>
                        {invite.workspace}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                        as a <strong>{invite.role}</strong>
                    </Typography>
                </Box>

                {/* Email Info */}
                <Alert severity='info' sx={{ mb: 3, textAlign: 'left' }}>
                    <Typography variant='body2'>
                        <strong>Invite sent to:</strong> {invite.email}
                    </Typography>
                </Alert>

                {/* ✅ USER ALREADY LOGGED IN */}
                {user?.uid && (
                    <>
                        {user.email === invite.email ? (
                            <Alert severity='success' sx={{ mb: 3 }}>
                                <Typography variant='body2'>
                                    You&apos;re already logged in with the correct account. Click continue to complete your profile and join
                                    the workspace.
                                </Typography>
                            </Alert>
                        ) : (
                            <Alert severity='warning' sx={{ mb: 3 }}>
                                <Typography variant='body2'>
                                    You&apos;re currently logged in as <strong>{user.email}</strong>, but this invite is for{' '}
                                    <strong>{invite.email}</strong>. Please log out and sign in with the correct account.
                                </Typography>
                            </Alert>
                        )}

                        <Button
                            fullWidth
                            variant='contained'
                            size='large'
                            onClick={() => handleContinue()}
                            disabled={user.email !== invite.email}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            Continue to Workspace
                        </Button>
                    </>
                )}

                {/* ✅ NEW USER - Need to Sign Up */}
                {!user?.uid && !existingUser?.exists && (
                    <>
                        <Alert severity='info' sx={{ mb: 3 }}>
                            <Typography variant='body2'>
                                This is your first time here. Create an account to accept this invitation.
                            </Typography>
                        </Alert>

                        <Button
                            fullWidth
                            variant='contained'
                            size='large'
                            onClick={() => handleContinue()}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)'
                            }}
                        >
                            Sign Up to Continue
                        </Button>

                        <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                            Your email ({invite.email}) will be pre-filled
                        </Typography>
                    </>
                )}

                {/* ✅ EXISTING USER - Need to Login with Specific Method */}
                {!user?.uid && existingUser?.exists && loginMethod && (
                    <>
                        <Alert severity='warning' sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography variant='body2' gutterBottom>
                                <strong>Account Found!</strong>
                            </Typography>
                            <Typography variant='body2'>
                                You already have an account registered with <strong>{invite.email}</strong> using{' '}
                                <strong>{loginMethod.name}</strong>.
                            </Typography>
                            <Typography variant='body2' sx={{ mt: 1 }}>
                                Please sign in using <strong>{loginMethod.name}</strong> to accept this invitation.
                            </Typography>
                        </Alert>

                        <Button
                            fullWidth
                            variant='contained'
                            size='large'
                            startIcon={loginMethod.icon}
                            onClick={() => handleContinue(existingUser.login_type)}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                bgcolor: loginMethod.color,
                                '&:hover': {
                                    bgcolor: loginMethod.color,
                                    opacity: 0.9
                                }
                            }}
                        >
                            Sign In with {loginMethod.name}
                        </Button>

                        <Typography variant='caption' color='text.secondary' sx={{ mt: 2, display: 'block' }}>
                            You must use the same login method you registered with
                        </Typography>
                    </>
                )}

                {/* Divider */}
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant='caption' color='text.secondary'>
                        Invited by: {invite.invitedBy || 'Admin'}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    )
}

export default AcceptInvite
