import { Stack } from '@mui/material'
import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleCustomButton from './googleLogin/GoogleCustomButton'
import { useEffect } from 'react'
import { SET_USER_DATA } from '@/store/actions'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router'
import { MicrosoftLogin } from './microsoftLogin/MicrosoftLogin'
import { apiBaseUrl } from '@/utils/apiBaseUrl'

export const Top = ({ setLoading }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    useEffect(() => {
        setLoading(true)
        handleGithubAuth().finally(() => setLoading(false))
    }, [])

    const handleGithubAuth = async () => {
        const query = window.location.search
        const urlParams = new URLSearchParams(query)
        const code = urlParams.get('code')
        const accessToken = localStorage.getItem('access_token')

        if (code && !accessToken) {
            try {
                const response = await axios.get(`${apiBaseUrl}/getAccessToken`, {
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
            } finally {
                setLoading(false)
            }
        } else if (accessToken) {
            await getUserData()
            setLoading(false)
        }
    }

    const getUserData = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/getuserData`, {
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
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
        const gitRedirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}`
        window.location.assign(gitRedirectUrl)
    }
    return (
        <div>
            <Stack gap={2} sx={{ mt: 2 }} style={{ width: '450px' }}>
                <GoogleOAuthProvider
                    clientId={
                        import.meta.env.VITE_GOOGLE_CLIENT_ID || '378678297066-q6qeqtpfh0ih4e99lv887o1rgduehs9u.apps.googleusercontent.com'
                    }
                >
                    <GoogleCustomButton setLoading={setLoading} />
                </GoogleOAuthProvider>
                {/* <Button
                    variant='outlined'
                    fullWidth
                    onClick={loginWithGithub}
                    sx={{
                        py: 1.5,
                        color: customization.isDarkMode ? 'white' : 'black',
                        borderColor: customization.isDarkMode ? 'gray' : '#bdbfd4',
                        bgcolor: customization.isDarkMode ? '#2e2e2e' : '#ffffff',
                        '&:hover': { bgcolor: customization.isDarkMode ? '#3e3e3e' : '#f0f0f0', borderColor: '#777' }
                    }}
                    startIcon={<GitHubIcon color={customization.isDarkMode ? 'white' : 'black'} />}
                >
                    Continue With Github
                </Button> */}
                <MicrosoftLogin />
            </Stack>
        </div>
    )
}

Top.propTypes = {
    setLoading: PropTypes.func.isRequired
}
