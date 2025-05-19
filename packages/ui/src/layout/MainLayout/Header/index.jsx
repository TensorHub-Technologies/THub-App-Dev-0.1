import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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

const Header = () => {
    const [userName, setUserName] = useState('')
    const [userImg, setUserImg] = useState('')
    const [userFName, setUserFullName] = useState('')
    const [anchorEl, setAnchorEl] = useState(null)
    const theme = useTheme()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    const open = Boolean(anchorEl)

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

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = () => {
        localStorage.removeItem('userId')
        sessionStorage.removeItem('modalShown')
        dispatch(setUserData(''))
        setUserName('')
        setUserImg('')
        navigate('/')

        setAnchorEl(null)
    }

    useEffect(() => {
        const storeUserData = async () => {
            const urlParams = new URLSearchParams(window.location.search)
            const userId = localStorage.getItem('userId') || urlParams.get('uid')
            if (userId) {
                const apiUrl =
                    window.location.hostname === 'localhost'
                        ? 'http://localhost:2000/userdata'
                        : 'https://thub-web-server-2-0-378678297066.us-central1.run.app/userdata'

                try {
                    const response = await axios.post(apiUrl, { userId })
                    if (response.status === 200) {
                        const userData = response?.data[0]

                        dispatch(setUserData(userData))

                        const name = userData?.name[0].toUpperCase()
                        setUserFullName(userData?.name)
                        setUserName(name)
                        const proPicture = userData?.picture
                        setUserImg(proPicture)

                        const dateObj = new Date(userData?.subscription_date)

                        const monthlySubscription = new Date(dateObj)
                        monthlySubscription.setUTCDate(monthlySubscription.getUTCDate() + 30)
                        monthlySubscription.setUTCFullYear(monthlySubscription.getUTCFullYear() + 1)

                        if (userData?.subscription_duration === 'monthly') {
                            // check if user subscription limit is reached
                            const SubscriptionDay = monthlySubscription.getUTCDate()
                            const SubscriptionMonth = monthlySubscription.getUTCMonth() + 1

                            const currentDate = new Date() // Get the current date

                            const currentmonth = currentDate.getMonth() + 1
                            const currentday = currentDate.getDate()

                            if (SubscriptionMonth === currentmonth && currentday >= SubscriptionDay) {
                                // subscription date complete, update subscription
                            }
                        } else if (userData?.subscription_duration === 'yearly') {
                            // check if user subscription limit is reached
                            const SubscriptionDay = monthlySubscription.getUTCDate()
                            const SubscriptionMonth = monthlySubscription.getUTCMonth() + 1
                            const SubscriptionYear = monthlySubscription.getUTCFullYear()

                            const currentDate = new Date() // Get the current date

                            // Extract the year, month, and day
                            const currentyear = currentDate.getFullYear()
                            const currentmonth = currentDate.getMonth() + 1
                            const currentday = currentDate.getDate()

                            if (SubscriptionYear === currentyear && currentmonth === SubscriptionMonth && currentday >= SubscriptionDay) {
                                // subscription date complete, update subscription
                            }
                        }
                    } else {
                        console.error('Error:', response.statusText)
                    }
                } catch (error) {
                    console.error('Error:', error)
                }
            } else {
                console.warn('UID parameter is missing in the URL')
            }
        }

        storeUserData()
    }, [dispatch])

    const changeDarkMode = () => {
        const newTheme = !customization.isDarkMode
        dispatch({ type: SET_DARKMODE, isDarkMode: newTheme })
        localStorage.setItem('isDarkMode', newTheme)
        const url = new URL(window.location.href)
        url.searchParams.set('theme', newTheme ? 'dark' : 'lite')
        window.history.replaceState({}, '', url)
    }

    return (
        <>
            <Box
                sx={{
                    width: 228,
                    display: 'flex',
                    [theme.breakpoints.down('md')]: {
                        width: 'auto'
                    }
                }}
            >
                <img src={ColorfulLogo} alt='THub_Logo' width={35} />
                {customization.menu_open && <img src={logo} alt='THub_Logo' width={90} height={29} style={{ marginTop: '2px' }} />}
            </Box>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}></Toolbar>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={changeDarkMode}>
                <img
                    src={customization.isDarkMode ? toggle_1 : toggle_2}
                    style={{ width: '30px', marginRight: '3px' }}
                    alt={customization.isDarkMode ? 'dark' : 'lite'}
                />
            </IconButton>
            <Box sx={{ ml: 2 }}></Box>
            <ProfileSection username={localStorage.getItem('username') ?? ''} handleLogout={handleLogout} />
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
                                    sx={{ width: 38, height: 38 }}
                                    style={{
                                        color: '#FFFFFF',
                                        background: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                    }}
                                    alt='GS'
                                    src={userImg}
                                />
                            ) : (
                                <Avatar
                                    sx={{ width: 38, height: 38 }}
                                    style={{
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
                    <MenuItem onClick={handleSettingClick}>
                        <ListItemIcon>
                            <IconSettings color={customization.isDarkMode ? 'white' : '#616161'} />
                        </ListItemIcon>
                        Settings
                    </MenuItem>
                    <MenuItem onClick={handleSubscriptionClick}>
                        <ListItemIcon>
                            <IconUserPlus color={customization.isDarkMode ? 'white' : '#616161'} />
                        </ListItemIcon>
                        Subscription
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
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
