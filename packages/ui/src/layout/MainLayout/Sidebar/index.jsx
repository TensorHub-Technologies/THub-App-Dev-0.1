import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
// material-ui
import { useTheme } from '@mui/material/styles'
import { Box, Drawer, useMediaQuery } from '@mui/material'

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar'
import { BrowserView, MobileView } from 'react-device-detect'

// project imports
import MenuList from './MenuList'
import LogoSection from '../LogoSection'
import { SHOW_MENU } from '@/store/constant'
import '../../../ui-component/cards/card.css'

// ==============================|| SIDEBAR DRAWER ||============================== //

const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
    const theme = useTheme()
    const matchUpMd = useMediaQuery(theme.breakpoints.up('md'))

    const customization = useSelector((state) => state.customization)

    const [isDark, setIsDark] = useState(customization.isDarkMode)
    const dispatch = useDispatch()
    const drawer = (
        <>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Box sx={{ display: 'flex', p: 2, mx: 'auto' }}>
                    <LogoSection />
                </Box>
            </Box>

            <BrowserView>
                <PerfectScrollbar
                    component='div'
                    className={customization.isDarkMode ? 'gradient-card-global-subtle-dark' : 'gradient-card-global-subtle-light'}
                    style={{
                        height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
                        paddingLeft: '5px',
                        paddingRight: '36px'
                    }}
                >
                    <MenuList />
                </PerfectScrollbar>
            </BrowserView>

            <MobileView>
                <Box sx={{ px: 2 }}>
                    <MenuList />
                </Box>
            </MobileView>
        </>
    )

    const container = window !== undefined ? () => window.document.body : undefined

    return (
        <Box component='nav' sx={{ flexShrink: { md: 0 }, width: '100px' }} aria-label='mailbox folders'>
            <Drawer
                container={container}
                variant={matchUpMd ? 'persistent' : 'temporary'}
                anchor='left'
                open={drawerOpen}
                onClose={drawerToggle}
                sx={{
                    '& .MuiDrawer-paper': {
                        transition: 'width .2s, box-shadow .2s',
                        width: customization.menu_open ? '300px' : '100px',
                        // overflow:"hidden",
                        // width: drawerWidth,
                        background: 'transparent',
                        color: theme.palette.text.primary,
                        borderRight: 'none',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                        // height:"100vh",
                        [theme.breakpoints.up('md')]: {
                            top: '75px'
                        }
                    }
                }}
                onMouseEnter={() => dispatch({ type: SHOW_MENU })}
                onMouseLeave={() => dispatch({ type: SHOW_MENU })}
                ModalProps={{ keepMounted: true }}
                color='inherit'
            >
                {drawer}
            </Drawer>
        </Box>
    )
}

Sidebar.propTypes = {
    drawerOpen: PropTypes.bool,
    drawerToggle: PropTypes.func,
    window: PropTypes.object
}

export default Sidebar
