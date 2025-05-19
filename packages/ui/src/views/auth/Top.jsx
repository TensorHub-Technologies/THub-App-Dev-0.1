import { Button, Stack } from '@mui/material'
import { GitHubIcon, GoogleIcon, MicrosoftIcon } from './CustomIcons'

export const Top = () => {
    const handleGoogleLogin = () => {
        console.log('Continue With Google')
    }

    const handleMicrosoftLogin = () => {
        console.log('Continue With Microsoft')
    }
    return (
        <div>
            <Stack gap={2} sx={{ mt: 2 }} style={{ width: '350px' }}>
                <Button
                    variant='outlined'
                    fullWidth
                    onClick={handleGoogleLogin}
                    sx={{
                        py: 1.5,
                        color: 'white',
                        borderColor: '#555',
                        bgcolor: '#2e2e2e',
                        '&:hover': { bgcolor: '#3e3e3e', borderColor: '#777' }
                    }}
                    startIcon={<GoogleIcon />}
                >
                    Continue With Google
                </Button>

                <Button
                    variant='outlined'
                    fullWidth
                    onClick={handleGoogleLogin}
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

                <Button
                    variant='outlined'
                    fullWidth
                    onClick={handleMicrosoftLogin}
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
            </Stack>
        </div>
    )
}
