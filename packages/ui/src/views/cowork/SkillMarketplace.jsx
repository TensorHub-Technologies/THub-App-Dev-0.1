import { Typography, Stack } from '@mui/material'
import MainCard from '@/ui-component/cards/MainCard'

const SkillMarketplace = () => {
    return (
        <MainCard title='Skill Marketplace'>
            <Stack alignItems='center' justifyContent='center' sx={{ minHeight: 400 }}>
                <Typography variant='h4' color='textSecondary'>
                    Skill Marketplace Placeholder
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                    This component is coming soon!
                </Typography>
            </Stack>
        </MainCard>
    )
}

export default SkillMarketplace
