import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { buildLoginRedirectPath } from '@/utils/authRedirect'

const Unauthorized = ({ attemptedPath }) => {
    const location = useLocation()
    const navigate = useNavigate()

    const targetPath = useMemo(() => {
        if (attemptedPath) return attemptedPath
        return `${location.pathname}${location.search}${location.hash}`
    }, [attemptedPath, location.hash, location.pathname, location.search])

    return (
        <Box
            sx={{
                minHeight: '100vh',
                px: 3,
                py: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                    'radial-gradient(circle at top left, rgba(226,42,144,0.16), transparent 30%), linear-gradient(135deg, #f6f7fb 0%, #eef3ff 100%)'
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 720,
                    p: { xs: 3, sm: 5 },
                    borderRadius: 6,
                    border: '1px solid rgba(60, 91, 164, 0.14)',
                    boxShadow: '0 24px 60px rgba(60, 91, 164, 0.14)',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <Stack spacing={3}>
                    <Chip
                        label='Unauthorized'
                        sx={{
                            alignSelf: 'flex-start',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            background: 'linear-gradient(135deg, #3C5BA4 0%, #E22A90 100%)'
                        }}
                    />
                    <Stack spacing={1.5}>
                        <Typography variant='h2' sx={{ color: '#1F2A44' }}>
                            Sign in to continue
                        </Typography>
                        <Typography variant='body1' sx={{ color: '#5A6785', maxWidth: 560 }}>
                            This page is only available to logged-in users. Your session is missing or has ended, so THub blocked access
                            before loading protected data.
                        </Typography>
                    </Stack>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 4,
                            backgroundColor: '#F4F7FF',
                            border: '1px solid rgba(60, 91, 164, 0.12)'
                        }}
                    >
                        <Typography variant='caption' sx={{ color: '#6B7690', display: 'block', mb: 0.75 }}>
                            Requested URL
                        </Typography>
                        <Typography
                            variant='body2'
                            sx={{
                                color: '#213256',
                                wordBreak: 'break-all',
                                fontFamily: '"Fira Code", monospace'
                            }}
                        >
                            {targetPath}
                        </Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                            variant='contained'
                            size='large'
                            onClick={() => navigate(buildLoginRedirectPath(targetPath))}
                            sx={{
                                minWidth: 180,
                                borderRadius: 999,
                                background: 'linear-gradient(135deg, #3C5BA4 0%, #E22A90 100%)'
                            }}
                        >
                            Go to Login
                        </Button>
                        <Button
                            variant='outlined'
                            size='large'
                            onClick={() => navigate('/')}
                            sx={{
                                minWidth: 180,
                                borderRadius: 999,
                                borderColor: 'rgba(60, 91, 164, 0.24)',
                                color: '#3C5BA4'
                            }}
                        >
                            Back to Home
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    )
}

Unauthorized.propTypes = {
    attemptedPath: PropTypes.string
}

Unauthorized.defaultProps = {
    attemptedPath: ''
}

export default Unauthorized
