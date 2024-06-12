import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, IconButton, Link, Switch, Toolbar, Tooltip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { SET_DARKMODE } from '@/store/actions'
import ProfileSection from './ProfileSection'
import ColorfulLogo from '@/assets/images/THub_icon_colorful_logo.png'
import logo from '@/assets/images/THub_Logo_resize.png'
import Avatar from '@mui/material/Avatar'
import toggle_1 from '@/assets/images/toggle_mode-1.svg'
import toggle_2 from '@/assets/images/toggle_mode-2.svg'

// menu
import * as React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
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
    const [user, setUser] = useState('')
    const [userImg, setuserImg] = useState('')

    const theme = useTheme()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    // menu
    const [anchorEl, setAnchorEl] = React.useState(null)
    const open = Boolean(anchorEl)
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const [userId, setUserId] = useState('')
    const [isDark, setIsDark] = useState(false)
    // console.log(    customization.isDarkMode,"**********"    );
    useEffect(() => {
        let url = new URL(window.location.href)
        let params = new URLSearchParams(url.search)
        const urlTheme = params.get('theme') === 'dark'
        dispatch({ type: SET_DARKMODE, isDarkMode: urlTheme })
        localStorage.setItem('isDarkMode', urlTheme)
    }, [dispatch])

    useEffect(() => {
        let url = new URL(window.location.href)
        let params = new URLSearchParams(url.search)
        const uid = params.get('uid') || ''
        setUserId(uid)
        localStorage.setItem('userId', uid)
        const userId = localStorage.getItem('userId')

        const apiUrl =
            window.location.hostname === 'localhost' ? 'http://localhost:4000/user' : 'https://thub-dev-420204.uc.r.appspot.com/user'

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId
            })
        })
            .then((response) => {
                if (response.ok) {
                    response.json().then((user) => {
                        console.log(user)
                        const name = user[0].name[0]
                        const img = user[0].picture
                        const showName = name.toUpperCase()
                        setUser(showName)
                        setuserImg(img)
                    })
                } else {
                    console.error('Error:', response.statusText)
                }
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }, [])

    const changeDarkMode = () => {
        const newTheme = !isDark
        setIsDark(newTheme)
        dispatch({ type: SET_DARKMODE, isDarkMode: newTheme })
        localStorage.setItem('isDarkMode', newTheme)
    }

    const signOutClicked = () => {
        localStorage.removeItem('username')
        localStorage.removeItem('password')
        navigate('/', { replace: true })
        navigate(0)
    }

    const StyledLink = styled(Link)(({ theme }) => ({
        color: customization?.isDarkMode ? '#fff' : '#000',
        fontSize: '1.25rem', // Adjust font size as needed
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        textDecoration: 'none',

        '&:hover': {
            color: customization?.isDarkMode ? '#e22a90' : '#3c5ba4'
        }
    }))

    return (
        <>
            <Box
                sx={{
                    width: 200,
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
            {/* <MaterialUISwitch checked={isDark} onChange={changeDarkMode} /> */}
            {customization.isDarkMode ? (
                <IconButton checked={true} onClick={changeDarkMode}>
                    <img src={toggle_1} style={{ width: '30px', marginRight: '3px' }} alt='dark' />
                </IconButton>
            ) : (
                <IconButton checked={false} onClick={changeDarkMode}>
                    <img src={toggle_2} style={{ width: '30px', marginRight: '3px' }} alt='lite' />
                </IconButton>
            )}
            <Box sx={{ ml: 2 }}></Box>
            <ProfileSection handleLogout={signOutClicked} username={localStorage.getItem('username') ?? ''} />
            <React.Fragment>
                <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                    <Tooltip title='Account'>
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
                                        color: customization.isDarkMode ? '#FFFFFF' : '#FFFFFF',
                                        background: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                    }}
                                    alt='GS'
                                    src={userImg}
                                ></Avatar>
                            ) : (
                                <Avatar
                                    sx={{ width: 38, height: 38 }}
                                    style={{
                                        color: customization.isDarkMode ? '#FFFFFF' : '#FFFFFF',
                                        background: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                    }}
                                >
                                    {user}
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
                            // border:"2px solid red",
                            // width:"180px"
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
                    <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                            <PersonAdd fontSize='small' />
                        </ListItemIcon>
                        Subscription
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
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
