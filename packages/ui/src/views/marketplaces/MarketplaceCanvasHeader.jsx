import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, Typography, Stack } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'

// icons
import { IconCopy, IconChevronLeft } from '@tabler/icons-react'
import ColorfulLogo from '@/assets/images/THub_icon_colorful_logo.png'
import { StyledFab } from '@/ui-component/button/StyledFab'
import { useSelector } from 'react-redux'

// ==============================|| CANVAS HEADER ||============================== //

const MarketplaceCanvasHeader = ({ flowName, flowData, onChatflowCopy }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const navigate = useNavigate()

    return (
        <>
            <Box>
                <button
                    type='button'
                    style={{ background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}
                    onClick={() => {
                        navigate('/workflows')
                    }}
                >
                    <img src={ColorfulLogo} alt='THub_Logo' width={35} />
                </button>
                <StyledFab title='Back' sx={{ borderRadius: '50%', mt: -4, ml: 3 }}>
                    <Avatar
                        variant='rounded'
                        sx={{
                            color: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                            background: 'transparent'
                            // '&:hover': {
                            //     background: theme.palette.secondary.dark,
                            //     color: theme.palette.secondary.light
                            // }
                        }}
                        color='inherit'
                        onClick={() => navigate(-1)}
                    >
                        <IconChevronLeft stroke={1.5} size='1.3rem' />
                    </Avatar>
                </StyledFab>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Stack flexDirection='row'>
                    <Typography
                        sx={{
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            ml: 2
                        }}
                    >
                        {flowName}
                    </Typography>
                </Stack>
            </Box>
            <Box>
                <StyledButton
                    color='secondary'
                    variant='contained'
                    title='Use Workflow'
                    onClick={() => onChatflowCopy(flowData)}
                    startIcon={<IconCopy />}
                >
                    Use Template
                </StyledButton>
            </Box>
        </>
    )
}

MarketplaceCanvasHeader.propTypes = {
    flowName: PropTypes.string,
    flowData: PropTypes.object,
    onChatflowCopy: PropTypes.func
}

export default MarketplaceCanvasHeader
