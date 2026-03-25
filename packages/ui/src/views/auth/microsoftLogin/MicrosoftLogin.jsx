import { useMsal } from '@azure/msal-react'
import { useEffect } from 'react'
import { callMsGraph } from './graph'
import authApi from '@/api/auth'
import { MicrosoftIcon } from '../CustomIcons'
import { Button } from '@mui/material'
import { toast } from 'react-toastify'
import { loginRequest } from './config/msalConfig'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { SET_USER_DATA } from '@/store/actions'

export const MicrosoftLogin = () => {
    const { instance, accounts } = useMsal()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()

    const handleLogin = async () => {
        try {
            await instance.loginPopup(loginRequest)
        } catch (e) {
            console.error('Login failed:', e)
        }
    }

    useEffect(() => {
        if (accounts && accounts.length > 0) {
            instance
                .acquireTokenSilent({
                    ...loginRequest,
                    account: accounts[0]
                })
                .then((response) => {
                    callMsGraph(response.accessToken)
                        .then((data) => {
                            const payload = {
                                uid: data.id,
                                email: data.mail || data.userPrincipalName || '',
                                name: data.givenName || data.displayName || '',
                                phone: data.mobilePhone || '',
                                login_type: 'azure_ad',
                                subscription_type: 'free',
                                subscription_date: new Date().toISOString().split('T')[0],
                                workspace: ''
                            }

                            authApi
                                .microsoftLogin(payload)
                                .then((response) => {
                                    const data = response.data
                                    dispatch({
                                        type: SET_USER_DATA,
                                        payload: data.user
                                    })
                                    localStorage.setItem('userId', data.user.uid)
                                    navigate('/workflows')
                                })
                                .catch((error) => {
                                    console.error('Error storing data:', error)
                                    toast.error('Error storing data: ' + error.message)
                                })
                        })
                        .catch((error) => {
                            toast.error('Error fetching data from Graph API: ' + error.message)
                        })
                })
                .catch((error) => {
                    console.error('Error acquiring token silently', error)
                    toast.error('Error acquiring token silently: ' + error.message)
                })
        }
    }, [accounts, instance])

    return (
        <Button
            variant='outlined'
            fullWidth
            onClick={handleLogin}
            sx={{
                py: 1.5,
                pr: 2,
                color: customization.isDarkMode ? 'white' : 'black',
                borderColor: customization.isDarkMode ? 'gray' : '#bdbfd4',
                bgcolor: customization.isDarkMode ? '#2e2e2e' : '#ffffff',
                '&:hover': { bgcolor: customization.isDarkMode ? '#3e3e3e' : '#f0f0f0', borderColor: '#777' }
            }}
            startIcon={<MicrosoftIcon />}
        >
            Continue With Microsoft
        </Button>
    )
}
