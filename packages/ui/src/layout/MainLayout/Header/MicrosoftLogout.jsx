import { useMsal } from '@azure/msal-react'
import { Button } from '@mui/material'
import { Logout } from '@mui/icons-material'
import { useNavigate } from 'react-router'

export const SignOutButton = () => {
    const { instance } = useMsal()
    const navigate = useNavigate()

    const handleLogout = async () => {
        // ✅ Clear session-based flags
        sessionStorage.removeItem('profileSkipped')
        sessionStorage.removeItem('inviteContext')

        localStorage.removeItem('userId')

        await instance.logoutPopup({
            postLogoutRedirectUri: '/'
        })

        navigate('/')
    }

    return (
        <Button
            variant='outlined'
            onClick={handleLogout}
            sx={{
                py: 1.5,
                color: 'white',
                borderColor: '#555',
                bgcolor: '#2e2e2e',
                '&:hover': { bgcolor: '#3e3e3e', borderColor: '#777' }
            }}
            startIcon={<Logout />}
        >
            Logout
        </Button>
    )
}
