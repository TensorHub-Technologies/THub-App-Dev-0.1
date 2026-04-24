import { Typography, Stack } from '@mui/material'
import MainCard from '@/ui-component/cards/MainCard'

const PromptStudio = () => {
    return (
        <MainCard title='Prompt Studio'>
            <Stack alignItems='center' justifyContent='center' sx={{ minHeight: 400 }}>
                <Typography variant='h4' color='textSecondary'>
                    Prompt Studio Placeholder
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                    This component is coming soon!
                </Typography>
            </Stack>
        </MainCard>
    )
}

export default PromptStudio
