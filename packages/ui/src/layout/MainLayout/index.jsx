import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'

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
import '../../ui-component/cards/card.css'
import UserInfo from '@/ui-component/userform/UserInfo'

// styles
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    ...theme.typography.mainContent,
    ...(!open && {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        [theme.breakpoints.up('md')]: {
            marginLeft: -(drawerWidth - 20),
            width: `calc(100% - ${drawerWidth}px)`
        },
        [theme.breakpoints.down('md')]: {
            marginLeft: '20px',
            width: `calc(100% - ${drawerWidth}px)`,
            padding: '16px'
        },
        [theme.breakpoints.down('sm')]: {
            marginLeft: '10px',
            width: `calc(100% - ${drawerWidth}px)`,
            padding: '16px',
            marginRight: '10px'
        }
    }),
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        }),

        marginLeft: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        width: `calc(100% - ${drawerWidth}px)`,
        [theme.breakpoints.down('md')]: {
            marginLeft: '20px'
        },
        [theme.breakpoints.down('sm')]: {
            marginLeft: '10px'
        }
    })
}))

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
    const theme = useTheme()
    const matchDownMd = useMediaQuery(theme.breakpoints.down('lg'))
    const customization = useSelector((state) => state.customization)
    const [showModal, setShowModal] = useState(false)
    const showRegisterModalState = useSelector((state) => state.modal.showRegisterModal)
    const showLoginModal = useSelector((state) => state.modal.showLoginModal)
    const userData = useSelector((state) => state.user.userData)
    const tenantId = userData?.uid || localStorage.getItem('userId')
    // Handle left drawer
    const leftDrawerOpened = useSelector((state) => state.customization.opened)
    const dispatch = useDispatch()
    const handleLeftDrawerToggle = () => {
        dispatch({ type: SET_MENU, opened: !leftDrawerOpened })
    }

    useEffect(() => {
        setTimeout(() => dispatch({ type: SET_MENU, opened: !matchDownMd }), 0)
    }, [matchDownMd])

    useEffect(() => {
        if (!userData || Object.keys(userData).length === 0) return
        validateWorkspace()
    }, [userData])

    const validateWorkspace = () => {
        const workspace = userData?.workspace

        // 1️⃣ If login type is azure_ad or github → do NOT show modal
        if (userData.login_type === 'azure_ad' || userData.login_type === 'github') {
            console.log('Azure/GitHub login → no workspace modal needed')
            setShowModal(false)
            return
        }

        // 2️⃣ If workspace exists & is NOT empty → do NOT show modal
        if (workspace && workspace.trim() !== '') {
            console.log('Workspace exists → no modal')
            setShowModal(false)
            return
        }

        // 3️⃣ If workspace is null/undefined/empty → show once per session
        const modalShown = sessionStorage.getItem('modalShown')

        if (!modalShown) {
            console.log('No workspace → showing modal once')
            setShowModal(true)
            sessionStorage.setItem('modalShown', 'true')
        }
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {showModal && <UserInfo showModal={showModal} setShowModal={setShowModal} />}
            {/* header */}
            <AppBar
                enableColorOnDark
                position='fixed'
                color='inherit'
                elevation={0}
                className={customization.isDarkMode ? 'gradient-card-global-subtle-dark' : 'gradient-card-global-subtle-light'}
                sx={{
                    height: '80px',
                    bgcolor: theme.palette.background.default,
                    transition: leftDrawerOpened ? theme.transitions.create('width') : 'none'
                }}
            >
                <Toolbar>
                    <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
                </Toolbar>
            </AppBar>

            <Sidebar drawerOpen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

            {showRegisterModalState && <RegisterationForm />}

            {showLoginModal && <LoginForm />}

            <Main theme={theme} open={leftDrawerOpened}>
                <Outlet />
            </Main>
        </Box>
    )
}

export default MainLayout
