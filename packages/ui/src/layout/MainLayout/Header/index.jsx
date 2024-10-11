import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, IconButton, Toolbar, Tooltip, Avatar, Menu, MenuItem, ListItemIcon, Switch } from '@mui/material'
import { styled } from '@mui/material/styles'
import { SET_DARKMODE, setUserData } from '@/store/actions'
import ProfileSection from './ProfileSection'
import ColorfulLogo from '@/assets/images/THub_icon_colorful_logo.png'
import logo from '@/assets/images/THub_Logo_resize.png'
import toggle_1 from '@/assets/images/toggle_mode-1.svg'
import toggle_2 from '@/assets/images/toggle_mode-2.svg'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Settings from '@mui/icons-material/Settings'
import Logout from '@mui/icons-material/Logout'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

// Custom Material-UI Switch
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
        margin: 1,
        padding: 0,
        transform: 'translateX(6px)',
        '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(22px)',
            '& .MuiSwitch-thumb:before': {
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                    '#fff'
                )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`
            },
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: theme.palette.mode === 'dark' ? '#3C5BA4' : '#E22A90'
            }
        }
    },
    '& .MuiSwitch-thumb': {
        background: 'linear-gradient(to right, #3C5BA4, #E22A90)',
        width: 32,
        height: 32,
        '&:before': {
            content: "''",
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                '#fff'
            )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`
        }
    },
    '& .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#E22A90' : '#3C5BA4',
        borderRadius: 20 / 2
    }
}))

const Header = ({ handleLeftDrawerToggle }) => {
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

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = () => {
        localStorage.removeItem('userId')
        sessionStorage.removeItem('modalShown')
        dispatch(setUserData(''))
        setUserName('')
        setUserImg('')
        const isLocalhost = window.location.hostname === 'localhost'
        const redirectUrl = customization.isDarkMode
            ? isLocalhost
                ? 'http://localhost:5001/index.html'
                : 'https://thub.tech/index.html'
            : isLocalhost
            ? 'http://localhost:5001/index-lite.html'
            : 'https://thub.tech/index-lite.html'
        window.location.href = redirectUrl
        setAnchorEl(null)
    }

    useEffect(() => {
        const fetchUserData = async () => {
            const urlParams = new URLSearchParams(window.location.search)
            const userId = localStorage.getItem('userId') || urlParams.get('uid')
            if (userId) {
                const apiUrl =
                    window.location.hostname === 'localhost'
                        ? 'http://localhost:4000/user'
                        : 'https://thub-dev-420204.uc.r.appspot.com/user'

                try {
                    const response = await axios.post(apiUrl, { userId })
                    if (response.status === 200) {
                        const userData = response?.data[0]
                        dispatch(setUserData(userData))
                        const name = userData?.name[0].toUpperCase()
                        setUserFullName(userData?.name)
                        setUserName(name)
                        console.log(userData?.picture)
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
                                console.log('monthly subscription expired')
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
                                console.log('yearly subscription expired')
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

        fetchUserData()
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
                <KeyboardArrowDownIcon onClick={handleClick} style={{ background: 'transparent', cursor: 'pointer', fontSize: '28px' }} />
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
                    <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                            <Settings fontSize='small' />
                        </ListItemIcon>
                        Settings
                    </MenuItem>
                    <MenuItem onClick={handleSubscriptionClick}>
                        <ListItemIcon>
                            <PersonAdd fontSize='small' />
                        </ListItemIcon>
                        Subscription
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <Logout fontSize='small' style={{ marginLeft: '3.5px' }} />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </React.Fragment>
        </>
    )
}

Header.propTypes = {
    handleLeftDrawerToggle: PropTypes.func
}

export default Header
