import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import { Typography, Box } from '@mui/material'
import { IconAward } from '@tabler/icons-react'

const SkillMarketplace = () => (
    <MainCard>
        <ViewHeader title='Skills' description='Browse and publish reusable agent skills' />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <IconAward size={64} stroke={1} color='#9CA3AF' />
            <Typography variant='h5' color='textSecondary'>
                Skill Marketplace
            </Typography>
            <Typography variant='body2' color='textSecondary' textAlign='center' maxWidth={400}>
                Skills captured from successful CoWork sessions will appear here. Full marketplace functionality available in Sprint 2.
            </Typography>
        </Box>
    </MainCard>
)

export default SkillMarketplace
