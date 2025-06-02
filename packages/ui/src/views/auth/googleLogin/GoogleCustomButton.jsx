import { GoogleIcon } from '../CustomIcons'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { SET_USER_DATA } from '@/store/actions'

const GoogleCustomButton = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    console.log('THub local for google:', import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL)

    let apiUrl
    if (window.location.hostname === 'demo.thub.tech') {
        apiUrl = import.meta.env.VITE_THUB_WEB_SERVER_DEMO_URL
    } else if (window.location.hostname === 'localhost') {
        apiUrl = import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL || 'http://localhost:8080'
    } else {
        apiUrl = import.meta.env.VITE_THUB_WEB_SERVER_PROD_URL
    }
    console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)

    console.log('API URL:', apiUrl)
    const login = useGoogleLogin({
        onSuccess: async (response) => {
            console.log('Authorization Code:', response)

            try {
                const { data } = await axios.post(`${apiUrl}/api/auth/google`, {
                    code: response.code
                })
                console.log('Response Data:', data)

                dispatch({
                    type: SET_USER_DATA,
                    payload: data.user
                })
                localStorage.setItem('id_token', data.id_token)
                localStorage.setItem('userId', data.userId)
                navigate('/workflows')
            } catch (error) {
                console.error('Failed to exchange code:', error)
            }
        },

        scope: 'openid profile email',
        flow: 'auth-code',
        access_type: 'offline'
    })

    return (
        <div className='parent-div'>
            <Button
                variant='outlined'
                fullWidth
                sx={{
                    py: 1.5,
                    color: 'white',
                    borderColor: '#555',
                    bgcolor: '#2e2e2e',
                    '&:hover': { bgcolor: '#3e3e3e', borderColor: '#777' }
                }}
                startIcon={<GoogleIcon />}
                onClick={login}
            >
                Continue with Google
            </Button>
        </div>
    )
}

export default GoogleCustomButton
