import { useEffect, useState } from 'react'
import { Alert, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material'
import authApi from '@/api/auth'

const ProtectedRouteExampleCard = () => {
    const [loading, setLoading] = useState(true)
    const [protectedData, setProtectedData] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        let isMounted = true

        const loadProtectedExample = async () => {
            try {
                const response = await authApi.getProtectedExample()

                if (!isMounted) return

                setProtectedData(response.data)
                setError('')
            } catch (err) {
                if (!isMounted) return

                setError(err?.response?.data?.message || 'Unable to load protected route example')
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadProtectedExample()

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Stack spacing={2}>
                    <div>
                        <Typography variant='h5'>Protected Route Example</Typography>
                        <Typography variant='body2' color='text.secondary'>
                            Backend route: `GET /api/v1/auth/protected`
                        </Typography>
                    </div>

                    {loading && (
                        <Stack direction='row' spacing={1.5} alignItems='center'>
                            <CircularProgress size={18} />
                            <Typography variant='body2'>Verifying JWT token with the backend...</Typography>
                        </Stack>
                    )}

                    {!loading && error && <Alert severity='error'>{error}</Alert>}

                    {!loading && protectedData && (
                        <Alert severity='success'>
                            <Typography variant='body2'>{protectedData.message}</Typography>
                            <Typography variant='body2'>Authenticated user: {protectedData.user?.email || 'Unknown user'}</Typography>
                        </Alert>
                    )}
                </Stack>
            </CardContent>
        </Card>
    )
}

export default ProtectedRouteExampleCard
