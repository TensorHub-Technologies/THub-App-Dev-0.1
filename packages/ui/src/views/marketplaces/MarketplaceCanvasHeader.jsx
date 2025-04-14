import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, ButtonBase, Typography, Stack } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'

// icons
import { IconCopy, IconChevronLeft } from '@tabler/icons-react'
import Logo from '@/assets/images/THub_Logo_Icon.png'

// ==============================|| CANVAS HEADER ||============================== //

const MarketplaceCanvasHeader = ({ flowName, flowData, onChatflowCopy }) => {
    const theme = useTheme()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginRight: '14px'
                }}
                onClick={() => navigate('/')}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        navigate('/')
                    }
                }}
                role='button'
                tabIndex={0}
            >
                <img src={Logo} alt='THub_Logo' width={130} />
            </Box>
            <Box>
                <ButtonBase title='Back' sx={{ borderRadius: '50%' }}>
                    <Avatar
                        variant='rounded'
                        sx={{
                            ...theme.typography.commonAvatar,
                            ...theme.typography.mediumAvatar,
                            transition: 'all .2s ease-in-out',
                            // background: theme.palette.secondary.light,
                            background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                            // color: theme.palette.secondary.dark,
                            color: '#fff',
                            '&:hover': {
                                // background: theme.palette.secondary.dark,
                                background: 'linear-gradient(to right, #3C5BA4, #E22A90)',
                                // color: theme.palette.secondary.light
                                color: '#fff'
                            }
                        }}
                        color='inherit'
                        onClick={() => navigate(-1)}
                    >
                        <IconChevronLeft stroke={1.5} size='1.3rem' />
                    </Avatar>
                </ButtonBase>
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
