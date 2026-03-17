import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, IconButton, Toolbar, Tooltip, Avatar, Menu, MenuItem, ListItemIcon } from '@mui/material'
import { SET_DARKMODE, setUserData } from '@/store/actions'
import ProfileSection from './ProfileSection'
import ColorfulLogo from '@/assets/images/THub_icon_colorful_logo.png'
import logo from '@/assets/images/THub_Logo_resize.png'
import toggle_1 from '@/assets/images/toggle_mode-1.svg'
import toggle_2 from '@/assets/images/toggle_mode-2.svg'

// import custom icons component
import IconSettings from '@/assets/custom-svg/IconSettings'
import IconUserPlus from '@/assets/custom-svg/IconUserPlus'
import IconLogout from '@/assets/custom-svg/IconLogout'
import { useMsal } from '@azure/msal-react'
import { StyledFab } from '@/ui-component/button/StyledFab'
import { IconLayoutDashboardFilled } from '@tabler/icons-react'

const Header = () => {
    const [userName, setUserName] = useState('')
    const [userImg, setUserImg] = useState('')
    const [userFName, setUserFullName] = useState('')
    const [loginType, setLoginType] = useState('')
    const [anchorEl, setAnchorEl] = useState(null)
    const theme = useTheme()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)
    const userData = useSelector((state) => state.user.userData)
    const dispatch = useDispatch()
    const open = Boolean(anchorEl)

    const { instance } = useMsal()
    const location = useLocation()

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleSubscriptionClick = () => {
        navigate('/subscription')
        handleClose()
    }

    const handleSettingClick = () => {
        navigate('/setting')
    }

    const handleDashboardClick = () => {
        navigate('/dashboard')
        handleClose()
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const userId = localStorage.getItem('userId')
    const handleLogout = () => {
        const currentHost = window.location.hostname

        // 1️⃣ Clear all local/session storage
        localStorage.removeItem('userId')
        localStorage.removeItem('workspace')
        localStorage.removeItem('access_token')
        sessionStorage.removeItem('userInfoSkipped')
        sessionStorage.removeItem('inviteContext')

        // Reset Redux
        dispatch(setUserData(''))
        setUserName('')
        setUserImg('')

        setAnchorEl(null)
        if (loginType === 'azure_ad') {
            let redirectUri = 'https://thub-web.happytree-73f6fdda.westus2.azurecontainerapps.io/'
            if (currentHost === 'localhost') {
                redirectUri = 'http://localhost:8080/'
            } else if (currentHost === 'dev.thub.tech') {
                redirectUri = 'https://thub-web.calmisland-c4dd80be.westus2.azurecontainerapps.io/'
            } else if (currentHost === 'qa.thub.tech') {
                redirectUri = 'https://thub-web.lemonpond-e68ea8b7.westus2.azurecontainerapps.io/'
            }

            instance.logoutRedirect({
                postLogoutRedirectUri: redirectUri
            })

            return
        }

        if (loginType === 'google') {
            if (currentHost === 'localhost') {
                window.location.href = 'http://localhost:8080/'
            } else if (currentHost === 'dev.thub.tech') {
                window.location.href = 'https://thub-web.calmisland-c4dd80be.westus2.azurecontainerapps.io/'
            } else if (currentHost === 'qa.thub.tech') {
                window.location.href = 'https://thub-web.lemonpond-e68ea8b7.westus2.azurecontainerapps.io/'
            } else {
                window.location.href = 'https://thub-web.happytree-73f6fdda.westus2.azurecontainerapps.io/'
            }

            return
        }

        // 3️⃣ Normal email/password login logout
        if (currentHost === 'dev.thub.tech') {
            window.location.href = 'https://thub-web.calmisland-c4dd80be.westus2.azurecontainerapps.io/'
            return
        }

        if (currentHost === 'qa.thub.tech') {
            window.location.href = 'https://thub-web.lemonpond-e68ea8b7.westus2.azurecontainerapps.io/'
            return
        }

        if (currentHost === 'localhost') {
            window.location.href = 'http://localhost:8080/'
            return
        }

        window.location.href = 'https://thub-web.happytree-73f6fdda.westus2.azurecontainerapps.io/'
    }

    useEffect(() => {
        const getUserData = async () => {
            try {
                const params = new URLSearchParams(location.search)
                const uid = params.get('uid')

                if (uid) {
                    localStorage.setItem('userId', uid)
                    const subdomain = window.location.hostname.split('.')[0]
                    localStorage.setItem('workspace', subdomain)
                }

                const userId = localStorage.getItem('userId')
                if (!userId) {
                    console.warn('UID parameter is missing in the URL')
                    return
                }

                // Determine correct backend base URL
                let apiUrl
                const hostname = window.location.hostname

                if (hostname === 'localhost') {
                    apiUrl = 'http://localhost:2000'
                } else if (hostname === 'dev.thub.tech') {
                    apiUrl = 'https://thub-server.calmisland-c4dd80be.westus2.azurecontainerapps.io'
                } else if (hostname === 'qa.thub.tech') {
                    apiUrl = 'https://thub-server.lemonpond-e68ea8b7.westus2.azurecontainerapps.io'
                } else {
                    apiUrl = 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'
                }

                // Fetch user data by userId
                const response = await axios.get(`${apiUrl}/userdata`, { params: { userId } })
                if (response.status === 200) {
                    const userData = response.data

                    dispatch(setUserData(userData))

                    // Set user-specific info
                    const name = userData?.name?.[0]?.toUpperCase() || ''
                    setUserFullName(userData?.name)
                    setUserName(name)
                    setUserImg(userData?.picture)
                    setLoginType(userData?.login_type)

                    // Handle subscription validation
                    const subscriptionDate = new Date(userData?.subscription_date)
                    const expiryDate = new Date(subscriptionDate)

                    if (userData?.subscription_duration === 'monthly') {
                        expiryDate.setUTCDate(expiryDate.getUTCDate() + 30)
                    } else if (userData?.subscription_duration === 'yearly') {
                        expiryDate.setUTCFullYear(expiryDate.getUTCFullYear() + 1)
                    }

                    if (new Date() >= expiryDate) {
                        console.warn('Subscription expired — update subscription status.')
                    }
                } else {
                    console.error('Error:', response.statusText)
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        }
        getUserData()
    }, [dispatch])

    const changeDarkMode = () => {
        const newTheme = !customization.isDarkMode
        dispatch({ type: SET_DARKMODE, isDarkMode: newTheme })
        localStorage.setItem('isDarkMode', newTheme)
        const url = new URL(window.location.href)
        url.searchParams.set('theme', newTheme ? 'dark' : 'light')
        window.history.replaceState({}, '', url)
    }

    return (
        <>
            <Box
                sx={{
                    width: 228,
                    display: 'flex',
                    // border:"2px solid red",
                    cursor: 'pointer',
                    [theme.breakpoints.down('md')]: {
                        width: 'auto'
                    }
                }}
                onClick={() => {
                    navigate('/workflows')
                }}
            >
                <img src={ColorfulLogo} alt='THub_Logo' width={35} />
                {customization.menu_open && <img src={logo} alt='THub_Logo' width={90} height={29} style={{ marginTop: '2px' }} />}
            </Box>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}></Toolbar>
            <Box sx={{ flexGrow: 1 }} />

            <StyledFab aria-label='mode' title='Theme' onClick={changeDarkMode}>
                <img
                    src={customization.isDarkMode ? toggle_1 : toggle_2}
                    style={{ width: '24px', height: '24px' }}
                    alt={customization.isDarkMode ? 'dark' : 'lite'}
                />
            </StyledFab>

            <Box sx={{ ml: 2 }}></Box>
            <ProfileSection />
            <React.Fragment>
                <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                    <Tooltip title={userFName}>
                        <IconButton
                            onClick={handleClick}
                            size='small'
                            sx={{ ml: 2 }}
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup='true'
                            aria-expanded={open ? 'true' : undefined}
                        >
                            {userImg ? (
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        color: '#FFFFFF',
                                        background: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                    }}
                                    alt={userName?.charAt(0).toUpperCase()}
                                    src={userImg}
                                />
                            ) : (
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        color: '#FFFFFF',
                                        background: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                    }}
                                >
                                    {userName?.charAt(0).toUpperCase()}
                                </Avatar>
                            )}
                        </IconButton>
                    </Tooltip>
                </Box>
                <Menu
                    anchorEl={anchorEl}
                    id='account-menu'
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0
                            }
                        }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem
                        onClick={handleDashboardClick}
                        sx={{
                            '&:hover': {
                                backgroundColor: customization.isDarkMode ? '#424242' : '#f5f5f5' // or any other visible color
                            }
                        }}
                    >
                        <ListItemIcon>
                            <IconLayoutDashboardFilled stroke={2} color={customization.isDarkMode ? 'white' : '#616161'} />
                        </ListItemIcon>
                        Dashboard
                    </MenuItem>
                    <MenuItem
                        onClick={handleSettingClick}
                        sx={{
                            '&:hover': {
                                backgroundColor: customization.isDarkMode ? '#424242' : '#f5f5f5' // or any other visible color
                            }
                        }}
                    >
                        <ListItemIcon>
                            <IconSettings color={customization.isDarkMode ? 'white' : '#616161'} />
                        </ListItemIcon>
                        Settings
                    </MenuItem>

                    <MenuItem
                        sx={{
                            '&:hover': {
                                backgroundColor: customization.isDarkMode ? '#424242' : '#f5f5f5' // or any other visible color
                            }
                        }}
                        onClick={handleSubscriptionClick}
                    >
                        <ListItemIcon>
                            <IconUserPlus color={customization.isDarkMode ? 'white' : '#616161'} />
                        </ListItemIcon>
                        Subscription
                    </MenuItem>
                    <MenuItem
                        sx={{
                            '&:hover': {
                                backgroundColor: customization.isDarkMode ? '#424242' : '#f5f5f5' // or any other visible color
                            }
                        }}
                        onClick={handleLogout}
                    >
                        <ListItemIcon>
                            <IconLogout color={customization.isDarkMode ? 'white' : '#616161'} />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </React.Fragment>
        </>
    )
}

export default Header
