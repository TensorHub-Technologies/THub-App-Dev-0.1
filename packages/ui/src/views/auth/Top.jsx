import { Button, Stack } from '@mui/material'
import { GitHubIcon } from './CustomIcons'
import { useMsal } from '@azure/msal-react'
import { loginRequest } from './microsoftLogin/config/msalConfig'
import { SignInButton } from './microsoftLogin/SignInButton'
import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleCustomButton from './googleLogin/GoogleCustomButton'

export const Top = () => {
    const { instance } = useMsal()

    const handleGithubLogin = () => {
        console.log('Continue With Github')
    }

    const handleMicrosoftLogin = () => {
        console.log('Continue With Microsoft')
        instance.loginPopup(loginRequest).catch((e) => {
            console.log(e)
        })
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
                    onClick={handleGithubLogin}
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
