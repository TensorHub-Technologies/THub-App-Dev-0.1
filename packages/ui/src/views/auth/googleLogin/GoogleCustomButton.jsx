import { GoogleIcon } from '../CustomIcons'
import { useGoogleLogin } from '@react-oauth/google'
import authApi from '@/api/auth'
import { Button } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { SET_USER_DATA } from '@/store/actions'
import PropTypes from 'prop-types'
import { redirectAfterAuth } from '@/utils/authRedirect'
import { useNavigate } from 'react-router-dom'

const GoogleCustomButton = ({ setLoading }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)

    const login = useGoogleLogin({
        onSuccess: async (response) => {
            setLoading(true)
            try {
                const { data } = await authApi.googleLogin({
                    code: response.code
                })

                authApi.storeAuthSession(data)
                dispatch({ type: SET_USER_DATA, payload: data.user })
                redirectAfterAuth({ navigate })
            } catch (error) {
                alert('Login Failed')
                console.error('Failed to exchange code:', error)
            } finally {
                setLoading(false)
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
                    color: customization.isDarkMode ? 'white' : 'black',
                    borderColor: customization.isDarkMode ? 'gray' : '#bdbfd4',
                    bgcolor: customization.isDarkMode ? '#2e2e2e' : '#ffffff',
                    '&:hover': { bgcolor: customization.isDarkMode ? '#3e3e3e' : '#f0f0f0', borderColor: '#777' }
                }}
                startIcon={<GoogleIcon />}
                onClick={login}
            >
                Continue with Google
            </Button>
        </div>
    )
}

GoogleCustomButton.propTypes = {
    setLoading: PropTypes.func.isRequired
}

export default GoogleCustomButton
