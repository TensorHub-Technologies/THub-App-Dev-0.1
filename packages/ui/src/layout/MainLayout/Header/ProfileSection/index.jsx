import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

// material-ui
import { useTheme } from '@mui/material/styles'
import {
    Box,
    ButtonBase,
    Avatar,
    ClickAwayListener,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Popper,
    Typography
} from '@mui/material'

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import Transitions from '@/ui-component/extended/Transitions'
import AboutDialog from '@/ui-component/dialog/AboutDialog'
// assets
import { IconMenu2 } from '@tabler/icons-react'

import './index.css'

// ==============================|| PROFILE MENU ||============================== //

const ProfileSection = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const [open, setOpen] = useState(false)
    const [aboutDialogOpen, setAboutDialogOpen] = useState(false)

    const anchorRef = useRef(null)

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return
        }
        setOpen(false)
    }

    const settingToggle = () => {
        setOpen((prevOpen) => !prevOpen)
    }

    const prevOpen = useRef(open)
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus()
        }
        prevOpen.current = open
    }, [open])

    return (
        <>
            <ButtonBase ref={anchorRef} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Avatar
                    variant='rounded'
                    sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.mediumAvatar,
                        transition: 'all .2s ease-in-out',
                        background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                        color: '#fff',
                        '&:hover': {
                            background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                            color: '#fff'
                        },
                        borderRadius: '12px'
                    }}
                    onClick={settingToggle}
                    color='inherit'
                >
                    <IconMenu2 stroke={2} size={24} style={{ background: 'transparent' }} />
                </Avatar>
            </ButtonBase>
            <Popper
                placement='bottom-end'
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 14]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions in={open} {...TransitionProps}>
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                    <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 250px)', overflowX: 'hidden' }}>
                                        <Box sx={{}}>
                                            {/* <Divider /> */}
                                            <List
                                                component='nav'
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 250,
                                                    minWidth: 200,
                                                    backgroundColor: theme.palette.background.paper,
                                                    borderRadius: '10px',
                                                    [theme.breakpoints.down('md')]: {
                                                        minWidth: '100%'
                                                    },
                                                    '& .MuiListItemButton-root': {
                                                        mt: 0.5
                                                    }
                                                }}
                                            >
                                                <ListItemButton
                                                    sx={{
                                                        borderRadius: `${customization.borderRadius}px`,
                                                        '&:hover': {
                                                            backgroundColor: customization.isDarkMode ? '#23262c' : '#fff',
                                                            color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                                            '& .MuiListItemIcon-root': {
                                                                color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                            },
                                                            '& .MuiTypography-root': {
                                                                color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                            }
                                                        }
                                                    }}
                                                    onClick={() => {
                                                        setOpen(false)
                                                        setAboutDialogOpen(true)
                                                    }}
                                                >
                                                    <ListItemIcon>i</ListItemIcon>
                                                    <ListItemText primary={<Typography variant='body2'>About THub</Typography>} />
                                                </ListItemButton>
                                            </List>
                                        </Box>
                                    </PerfectScrollbar>
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
            <AboutDialog show={aboutDialogOpen} onCancel={() => setAboutDialogOpen(false)} />
        </>
    )
}

ProfileSection.propTypes = {
    username: PropTypes.string,
    handleLogout: PropTypes.func.isRequired
}

export default ProfileSection
