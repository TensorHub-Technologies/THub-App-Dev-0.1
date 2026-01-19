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

    const thubWebServerDevUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_DEMO_URL || 'https://thub-server.calmisland-c4dd80be.westus2.azurecontainerapps.io'

    const thubWebServerProdUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_PROD_URL || 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'

    const thubWebServerLocalUrl = import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL || 'http://localhost:2000'

    const API_BASE =
        window.location.hostname === 'localhost'
            ? thubWebServerLocalUrl
            : window.location.hostname === 'thub-app.calmisland-c4dd80be.westus2.azurecontainerapps.io'
            ? thubWebServerDevUrl
            : thubWebServerProdUrl

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
