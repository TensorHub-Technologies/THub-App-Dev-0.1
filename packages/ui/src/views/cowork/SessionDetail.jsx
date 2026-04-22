import { useParams } from 'react-router-dom'
import { Typography, Stack } from '@mui/material'
import MainCard from '@/ui-component/cards/MainCard'

const SessionDetail = () => {
    const { id } = useParams()

    return (
        <MainCard title={`Session Detail: ${id}`}>
            <Stack alignItems='center' justifyContent='center' sx={{ minHeight: 400 }}>
                <Typography variant='h4' color='textSecondary'>
                    Session Detail Placeholder
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                    Viewing session ID: {id}
                </Typography>
            </Stack>
        </MainCard>
    )
}

export default SessionDetail
