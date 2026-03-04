import { GoogleIcon } from '../CustomIcons'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { SET_USER_DATA } from '@/store/actions'
import PropTypes from 'prop-types'

const GoogleCustomButton = ({ setLoading }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const customization = useSelector((state) => state.customization)

    const thubWebServerDevUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_DEMO_URL || 'https://thub-server.calmisland-c4dd80be.westus2.azurecontainerapps.io'
    const thubWebServerProdUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_PROD_URL || 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'
    const thubWebServerLocalUrl = import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL || 'http://localhost:2000'
    const thubWebServerQAUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_QA_URL || 'https://thub-server.lemonpond-e68ea8b7.westus2.azurecontainerapps.io'

    let apiUrl

    if (window.location.hostname === 'localhost') {
        apiUrl = thubWebServerLocalUrl
    } else if (window.location.hostname === 'thub-app.calmisland-c4dd80be.westus2.azurecontainerapps.io') {
        apiUrl = thubWebServerDevUrl
    } else if (window.location.hostname === 'thub-app.lemonpond-e68ea8b7.westus2.azurecontainerapps.io') {
        apiUrl = thubWebServerQAUrl
    } else {
        apiUrl = thubWebServerProdUrl
    }

    const login = useGoogleLogin({
        onSuccess: async (response) => {
            setLoading(true)
            try {
                const { data } = await axios.post(`${apiUrl}/api/auth/google`, {
                    code: response.code
                })

                // Save Redux & Local
                dispatch({ type: SET_USER_DATA, payload: data.user })
                localStorage.setItem('id_token', data.id_token)
                localStorage.setItem('userId', data.userId)

                const hostname = window.location.hostname
                let workspace = data?.workspace?.trim()
                console.log(workspace, 'workspace')
                // --------------------------------
                // 1️⃣ LOCALHOST → no workspace logic
                // --------------------------------
                if (hostname === 'localhost') {
                    workspace = 'local'
                    window.location.href = `http://localhost:8080/workflows?theme=dark&uid=${data.userId}`
                    return
                }

                // --------------------------------
                // 2️⃣ DEMO → always default workspace = demo
                // --------------------------------
                if (hostname === 'thub-app.calmisland-c4dd80be.westus2.azurecontainerapps.io') {
                    workspace = 'demo'
                    window.location.href = `https://thub-app.calmisland-c4dd80be.westus2.azurecontainerapps.io/workflows?theme=dark&uid=${data.userId}`
                    return
                }

                // --------------------------------
                // 2️⃣ QA → always default workspace = qa
                // --------------------------------
                if (hostname === 'thub-app.lemonpond-e68ea8b7.westus2.azurecontainerapps.io') {
                    workspace = 'qa'
                    window.location.href = `https://thub-app.lemonpond-e68ea8b7.westus2.azurecontainerapps.io/workflows?theme=dark&uid=${data.userId}`
                    return
                }

                // --------------------------------
                // 3️⃣ PRODUCTION → use workspace OR default to app
                // --------------------------------
                // if (!workspace) {
                //     workspace = 'app'
                // }

                window.location.href = `https://thub-app.wittysand-a4a5c89d.westus2.azurecontainerapps.io/workflows?theme=dark&uid=${data.userId}`
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
