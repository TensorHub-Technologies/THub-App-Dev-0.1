import { Button, Stack } from '@mui/material'
import { GitHubIcon } from './CustomIcons'
import { loginRequest } from './microsoftLogin/config/msalConfig'
import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleCustomButton from './googleLogin/GoogleCustomButton'
import { SignInButton } from './microsoftLogin/SignInButton'
import { useEffect, useState } from 'react'
import { SET_USER_DATA } from '@/store/actions'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { useNavigate } from 'react-router'

export const Top = () => {
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const dispatch = useDispatch()

    const clientIds = {
        localhost: 'Ov23liqiYh1YKRrTHr0s',
        demo: 'Ov23lif7mrkCVPKebB0G',
        production: 'Ov23li9nfbJfQ0N5XiFZ'
    }

    const getClientId = () => {
        switch (window.location.hostname) {
            case 'localhost':
                return clientIds.localhost
            case 'thub-web-2-0-0-378678297066.us-central1.run.app':
                return clientIds.demo
            default:
                return clientIds.production
        }
    }

    useEffect(() => {
        handleGithubAuth()
    }, [])

    const handleGithubAuth = async () => {
        const query = window.location.search
        const urlParams = new URLSearchParams(query)
        const code = urlParams.get('code')
        const accessToken = localStorage.getItem('access_token')

        if (code && !accessToken) {
            try {
                const apiUrl = import.meta.env.VITE_API_URL
                const response = await axios.get(`${apiUrl}/getAccessToken`, {
                    params: { code }
                })

                const { access_token } = response.data
                if (access_token) {
                    setLoading(true)
                    localStorage.setItem('access_token', access_token)
                    await getUserData()
                } else {
                    console.error('Failed to retrieve access token')
                }
            } catch (error) {
                console.error('Error during GitHub OAuth flow:', error)
            }
        } else if (accessToken) {
            await getUserData()
        }
    }

    const getUserData = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL

            const response = await axios.get(`${apiUrl}/getuserData`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            })

            const data = response.data

            if (data.uid) {
                const finalWorkspace = data.workspace || 'app'

                dispatch({
                    type: SET_USER_DATA,
                    payload: data
                })
                localStorage.setItem('userId', data.uid)
                navigate('/workflows')
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        }
        localStorage.removeItem('access_token')
    }

    const loginWithGithub = () => {
        const clientId = getClientId()
        const gitRedirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}`
        window.location.assign(gitRedirectUrl)
    }

    const handleGithubLogin = () => {
        console.log('Continue With Github')
    }

    const handleMicrosoftLogin = () => {
        console.log('Continue With Microsoft')
        instance.loginPopup(loginRequest).catch((e) => {
            console.log(e)
        })
    }
    const handleGoogleLogin = () => {
        console.log('Continue With Google')
    }

    return (
        <div>
            <Stack gap={2} sx={{ mt: 2 }} style={{ width: '350px' }}>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <GoogleCustomButton />
                </GoogleOAuthProvider>
                <Button
                    variant='outlined'
                    fullWidth
                    onClick={loginWithGithub}
                    sx={{
                        py: 1.5,
                        color: 'white',
                        borderColor: '#555',
                        bgcolor: '#2e2e2e',
                        '&:hover': { bgcolor: '#3e3e3e', borderColor: '#777' }
                    }}
                    startIcon={<GitHubIcon />}
                >
                    Continue With Github
                </Button>
                <SignInButton />
            </Stack>
        </div>
    )
}
