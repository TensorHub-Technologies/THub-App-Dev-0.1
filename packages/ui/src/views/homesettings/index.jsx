import { useState } from 'react'
import { Grid, List, ListItem, Button, ListItemText, Typography, Box, Paper } from '@mui/material'
import MainCard from '@/ui-component/cards/MainCard'
import { useTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import '../homesettings/homesettings.css'

// mui icons import
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined'
import UserDetailsTable from './UserDetailsTable'
import { useNavigate } from 'react-router'

const HomeSettings = () => {
    const theme = useTheme()
    const user = useSelector((state) => state.user.userData)
    const customization = useSelector((state) => state.customization)
    const [selectedSection, setSelectedSection] = useState('Profile')
    const navigate = useNavigate()
    const subscription_active = user.subscription_type
    const expire = user?.expiry_date ?? ''

    return (
        <div>
            <MainCard
                sx={{
                    background: customization.isDarkMode ? theme.palette.common.black : '#f5faff'
                }}
            >
                {/* Header */}
                <Grid sx={{ mb: 1.25 }} container>
                    <h1
                        style={{
                            background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            fontSize: '24px',
                            lineHeight: '1.3',
                            fontFamily: 'cambria math',
                            marginLeft: '15px'
                        }}
                    >
                        Settings & Help
                    </h1>
                </Grid>

                {/* Main Layout */}
                <Grid container sx={{ height: '100vh', backgroundColor: 'transparent' }}>
                    {/* Sidebar */}
                    <Grid item xs={4} sx={{ borderRight: customization.isDarkMode ? '1px solid white' : '1px solid black' }}>
                        <List>
                            <ListItem>
                                <Button
                                    fullWidth
                                    onClick={() => setSelectedSection('Profile')}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        textTransform: 'none'
                                    }}
                                    className={`${customization.isDarkMode ? 'button_parent_dark' : 'button_parent_light'} ${
                                        selectedSection === 'Profile' ? 'active' : ''
                                    }`}
                                >
                                    <AccountCircleOutlinedIcon style={{ backgroundColor: 'transparent' }} />
                                    <ListItemText
                                        primary='Profile'
                                        primaryTypographyProps={{
                                            fontSize: '20px',
                                            width: '80px',
                                            fontFamily: 'cambria math',
                                            fontWeight: selectedSection === 'Profile' ? 'bold' : 'normal',
                                            color: selectedSection === 'Profile' ? 'white' : 'pink'
                                        }}
                                    />
                                    <ArrowRightOutlinedIcon style={{ backgroundColor: 'transparent' }} />
                                </Button>
                            </ListItem>
                            <ListItem>
                                <Button
                                    fullWidth
                                    onClick={() => setSelectedSection('Help')}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        textTransform: 'none'
                                    }}
                                    className={`${customization.isDarkMode ? 'button_parent_dark' : 'button_parent_light'} ${
                                        selectedSection === 'Help' ? 'active' : ''
                                    }`}
                                >
                                    <HelpOutlineOutlinedIcon style={{ backgroundColor: 'transparent' }} />
                                    <ListItemText
                                        primary='Help'
                                        primaryTypographyProps={{
                                            fontSize: '20px',
                                            width: '68px',
                                            fontFamily: 'cambria math',
                                            fontWeight: selectedSection === 'Help' ? 'bold' : 'normal',
                                            color: selectedSection === 'Help' ? 'white' : 'pink'
                                        }}
                                    />
                                    <ArrowRightOutlinedIcon style={{ backgroundColor: 'transparent' }} />
                                </Button>
                            </ListItem>
                        </List>
                    </Grid>

                    {/* Content */}
                    <Grid item xs={8} sx={{ height: 'calc(100vh - 32px)', marginBottom: '16px' }}>
                        <Box sx={{ padding: '15px 15px 0px 15px', height: '100%' }}>
                            {selectedSection === 'Profile' && (
                                <Paper
                                    sx={{ padding: '1rem', height: '100%' }}
                                    className={customization.isDarkMode ? 'parent-right-content-dark' : 'parent-right-content-light'}
                                >
                                    <Typography
                                        variant='h2'
                                        gutterBottom
                                        sx={{ fontFamily: 'Cambria, serif', fontWeight: 'bold', color: '#E22A90' }}
                                        className={customization.isDarkMode ? 'typography-plan-dark' : 'typography-plan-light'}
                                    >
                                        {subscription_active.toUpperCase()}
                                    </Typography>
                                    <Typography
                                        sx={{ fontFamily: 'Cambria, serif' }}
                                        className={customization.isDarkMode ? 'typography-expiry-dark' : 'typography-expiry-light'}
                                    >
                                        Next Payment On{' '}
                                        <span style={{ fontSize: '16px', borderBottom: '0.5px solid' }}>
                                            {expire ? expire.split('T')[0] : 'Not available'}
                                        </span>
                                    </Typography>

                                    {/* Buttons Section */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'start',
                                            gap: '10px',
                                            marginTop: '26px'
                                        }}
                                    >
                                        <Button
                                            variant='contained'
                                            sx={{ textTransform: 'none', fontFamily: 'Cambria, serif', backgroundColor: '#E22A90' }}
                                            className={customization.isDarkMode ? 'button-upgrade-dark' : 'button-upgrade-light'}
                                            onClick={() => {
                                                navigate('/subscription')
                                            }}
                                        >
                                            Upgrade
                                        </Button>
                                        <Button
                                            variant='contained'
                                            color='primary'
                                            sx={{
                                                textTransform: 'none',
                                                fontFamily: 'Cambria, serif',
                                                backgroundColor: '#191B1F',
                                                border: '0.5px solid white'
                                            }}
                                            className={customization.isDarkMode ? 'button-invoices-dark' : 'button-invoices-light'}
                                        >
                                            Payment Invoices
                                        </Button>
                                    </Box>
                                    <UserDetailsTable />
                                </Paper>
                            )}

                            {selectedSection === 'Help' && (
                                <Paper sx={{ padding: '1rem', height: '100%' }}>
                                    <Typography variant='h2' gutterBottom sx={{ fontFamily: 'Cambria, serif', fontWeight: 'bold' }}>
                                        Help
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'Cambria, serif' }}>
                                        Find answers to frequently asked questions or get support.
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </MainCard>
        </div>
    )
}

export default HomeSettings
