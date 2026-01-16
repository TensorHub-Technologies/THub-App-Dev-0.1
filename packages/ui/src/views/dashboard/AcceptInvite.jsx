// AcceptInvite.jsx
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Box, Button, Typography, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'

const AcceptInvite = () => {
    const [params] = useSearchParams()
    const token = params.get('token')
    const navigate = useNavigate()
    const user = useSelector((state) => state.user.userData)

    const [invite, setInvite] = useState(null)
    const [loading, setLoading] = useState(true)

    const API_BASE =
        window.location.hostname === 'localhost'
            ? 'http://localhost:2000'
            : 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'

    // ----------------------------------
    // Validate invite & store context
    // ----------------------------------
    useEffect(() => {
        if (!token) {
            navigate('/')
            return
        }

        axios
            .get(`${API_BASE}/invite/validate`, { params: { token } })
            .then((res) => {
                setInvite(res.data)

                // ✅ SINGLE SOURCE OF TRUTH
                sessionStorage.setItem(
                    'inviteContext',
                    JSON.stringify({
                        workspace: res.data.workspace,
                        role: res.data.role,
                        email: res.data.email,
                        token
                    })
                )
            })
            .catch(() => navigate('/'))
            .finally(() => setLoading(false))
    }, [token, navigate])

    // ----------------------------------
    // Continue button
    // ----------------------------------
    const handleContinue = () => {
        // ❌ NOT LOGGED IN → SIGNUP
        if (!user?.uid) {
            navigate('/signup', {
                state: {
                    inviteEmail: invite.email,
                    redirectTo: '/dashboard'
                }
            })
            return
        }

        // ✅ LOGGED IN → DASHBOARD
        navigate('/dashboard')
    }

    if (loading) {
        return (
            <Box textAlign='center' mt={10}>
                <CircularProgress />
            </Box>
        )
    }

    if (!invite) return null

    return (
        <Box textAlign='center' mt={10}>
            <Typography variant='h5'>You’ve been invited to join</Typography>
            <Typography variant='h6' color='primary'>
                {invite.workspace}
            </Typography>

            <Button sx={{ mt: 3 }} variant='contained' onClick={handleContinue}>
                Continue
            </Button>
        </Box>
    )
}

export default AcceptInvite
