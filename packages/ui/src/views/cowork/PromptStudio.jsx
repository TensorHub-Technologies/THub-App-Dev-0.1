import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import { Typography, Box } from '@mui/material'
import { IconWand } from '@tabler/icons-react'

const PromptStudio = () => (
    <MainCard>
        <ViewHeader title='Prompt Studio' description='Manage agent persona templates' />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <IconWand size={64} stroke={1} color='#9CA3AF' />
            <Typography variant='h5' color='textSecondary'>
                Prompt Studio
            </Typography>
            <Typography variant='body2' color='textSecondary' textAlign='center' maxWidth={400}>
                Browse and edit the persona prompts that drive every CoWork agent. Full functionality available in Sprint 2.
            </Typography>
        </Box>
    </MainCard>
)

export default PromptStudio
