import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Box, ClickAwayListener, List, ListItemButton, ListItemIcon, ListItemText, Paper, Popper, Typography } from '@mui/material'

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import Transitions from '@/ui-component/extended/Transitions'
import AboutDialog from '@/ui-component/dialog/AboutDialog'
// assets
import { IconMenu2 } from '@tabler/icons-react'

import './index.css'
import { StyledFab } from '@/ui-component/button/StyledFab'

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
            <StyledFab ref={anchorRef} title='About' onClick={settingToggle}>
                <IconMenu2 />
            </StyledFab>
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
                                            <List
                                                component='nav'
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 250,
                                                    bgcolor: 'purple',
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

export default ProfileSection
