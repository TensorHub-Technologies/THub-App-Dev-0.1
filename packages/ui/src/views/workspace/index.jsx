import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import MainCard from '@/ui-component/cards/MainCard'
import { useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'

const JoinWorkspace = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)
    const theme = useTheme()
    const [apiUrl, setApiUrl] = useState('')

    const token = searchParams.get('token')

    useEffect(() => {
        let determinedUrl = ''

        const hostname = window.location.hostname

        if (hostname === 'thub-app.calmisland-c4dd80be.westus2.azurecontainerapps.io') {
            determinedUrl = 'https://thub-server.calmisland-c4dd80be.westus2.azurecontainerapps.io'
        } else if (hostname === 'localhost') {
            determinedUrl = 'http://localhost:2000'
        } else {
            determinedUrl = 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'
        }

        setApiUrl(determinedUrl)
    }, [])

    useEffect(() => {
        const handleInvite = async () => {
            if (!token) {
                alert('Invalid invitation link.')
                navigate('/')
                return
            }

            try {
                // Send token to backend for verification
                const res = await axios.post(`${apiUrl}/verify-token`, {
                    token
                })

                const { workspaceId, email } = res?.data || {}

                // Save temporarily, until signup/login is done
                localStorage.setItem('invitedWorkspaceId', workspaceId)
                localStorage.setItem('invitedEmail', email)
                // Redirect user to signup/login
                navigate('/signup')
            } catch (err) {
                console.error(err)
                alert('Invitation expired or invalid.')
                navigate('/')
            }
        }

        handleInvite()
    }, [token])

    return (
        <MainCard
            sx={{
                background: customization.isDarkMode ? theme.palette.common.black : '#f5faff'
            }}
        >
            <div>validate user.....</div>
        </MainCard>
    )
}

export default JoinWorkspace
