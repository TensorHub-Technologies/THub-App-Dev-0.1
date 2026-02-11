import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation } from 'react-router-dom'

// material-ui
import { styled, useTheme } from '@mui/material/styles'
import { AppBar, Box, CssBaseline, Toolbar, useMediaQuery } from '@mui/material'

// project imports
import Header from './Header'
import Sidebar from './Sidebar'
import { drawerWidth } from '@/store/constant'
import { SET_MENU } from '@/store/actions'
import RegisterationForm from '../../views/register/RegisterationForm'
import LoginForm from '@/views/register/LoginForm'
import UserInfo from '@/ui-component/userform/UserInfo'

// styles
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    ...theme.typography.mainContent,
    marginLeft: open ? 0 : `-${drawerWidth - 20}px`,
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
    })
}))

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
    const theme = useTheme()
    const matchDownMd = useMediaQuery(theme.breakpoints.down('lg'))
    const dispatch = useDispatch()
    const location = useLocation()

    const [showModal, setShowModal] = useState(false)

    const userData = useSelector((state) => state.user.userData)
    const customization = useSelector((state) => state.customization)
    const leftDrawerOpened = useSelector((state) => state.customization.opened)
    const showRegisterModalState = useSelector((state) => state.modal.showRegisterModal)
    const showLoginModal = useSelector((state) => state.modal.showLoginModal)

    const handleLeftDrawerToggle = () => {
        dispatch({ type: SET_MENU, opened: !leftDrawerOpened })
    }

    // Drawer auto toggle
    useEffect(() => {
        dispatch({ type: SET_MENU, opened: !matchDownMd })
    }, [matchDownMd, dispatch])

    useEffect(() => {
        if (!userData?.uid) {
            setShowModal(false)
            return
        }

        // reset skip when user logs in fresh
        const skippedThisSession = sessionStorage.getItem('userInfoSkipped')

        // invite accept route → never auto open
        if (location.pathname.startsWith('/accept-invite')) {
            setShowModal(false)
            return
        }

        // invite flow → force open until completed
        if (sessionStorage.getItem('inviteContext') && !userData.profile_completed) {
            setShowModal(true)
            return
        }

        // normal user
        if (!userData.profile_completed && !skippedThisSession) {
            setShowModal(true)
            return
        }

        setShowModal(false)
    }, [userData, location.pathname])

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* UserInfo Modal */}
            {showModal && (
                <UserInfo
                    setShowModal={setShowModal}
                    forceOpen={Boolean(sessionStorage.getItem('inviteContext') && !userData?.profile_completed)}
                />
            )}

            {/* Header */}
            <AppBar
                enableColorOnDark
                position='fixed'
                color='inherit'
                elevation={0}
                className={customization.isDarkMode ? 'gradient-card-global-subtle-dark' : 'gradient-card-global-subtle-light'}
                sx={{
                    height: '80px',
                    bgcolor: theme.palette.background.default
                }}
            >
                <Toolbar>
                    <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Sidebar drawerOpen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

            {/* Auth Modals */}
            {showRegisterModalState && <RegisterationForm />}
            {showLoginModal && <LoginForm />}

            {/* Main Content */}
            <Main theme={theme} open={leftDrawerOpened}>
                <Outlet />
            </Main>
        </Box>
    )
}

export default MainLayout
