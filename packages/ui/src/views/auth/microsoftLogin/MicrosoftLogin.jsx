import { useMsal } from '@azure/msal-react'
import { useEffect, useState } from 'react'
import { callMsGraph } from './graph'
import axios from 'axios'
import { MicrosoftIcon } from '../CustomIcons'
import { Button } from '@mui/material'
import { toast } from 'react-toastify'
import { loginRequest } from './config/msalConfig'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { SET_USER_DATA } from '@/store/actions'

export const MicrosoftLogin = () => {
    const { instance, accounts } = useMsal()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

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
            setLoading(true)
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

                            console.log('THub local for microsoft:', import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL)

                            let apiUrl
                            if (window.location.hostname === 'demo.thub.tech') {
                                apiUrl = import.meta.env.VITE_THUB_WEB_SERVER_DEMO_URL
                            } else if (window.location.hostname === 'localhost') {
                                apiUrl = import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL
                            } else {
                                apiUrl = import.meta.env.VITE_THUB_WEB_SERVER_PROD_URL
                            }

                            axios
                                .post(`${apiUrl}/microuser`, payload)
                                .then((response) => {
                                    const data = response.data
                                    const finalWorkspace = data.user?.workspace || 'app'
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
                color: 'white',
                borderColor: '#555',
                bgcolor: '#2e2e2e',
                '&:hover': { bgcolor: '#3e3e3e', borderColor: '#777' }
            }}
            startIcon={<MicrosoftIcon />}
        >
            Continue With Microsoft
        </Button>
    )
}
