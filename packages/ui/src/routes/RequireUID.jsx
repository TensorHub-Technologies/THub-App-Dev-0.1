import PropTypes from 'prop-types'
import { SET_DARKMODE } from '@/store/actions'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MainLayout from '@/layout/MainLayout'
import { showRegisterModal } from '@/store/actions'

const RequireUID = ({ children }) => {
    const dispatch = useDispatch()
    const showRegisterModalState = useSelector((state) => state.modal.showRegisterModal)
    console.log(showRegisterModalState, 'showRegisterModalState')
    const [isRegistered, setIsRegistered] = useState(false)

    useEffect(() => {
        const url = new URL(window.location.href)
        const params = new URLSearchParams(url.search)
        const urlTheme = params.get('theme')
        const localTheme = localStorage.getItem('isDarkMode')
        const uid = params.get('uid') || localStorage.getItem('userId')
        const hostname = window.location.hostname

        // Handle theme setting
        if (urlTheme === 'dark' || urlTheme === 'lite') {
            const isDarkMode = urlTheme === 'dark'
            dispatch({ type: SET_DARKMODE, isDarkMode })
            localStorage.setItem('isDarkMode', isDarkMode)
        } else if (localTheme !== null) {
            const storedTheme = localTheme === 'true'
            dispatch({ type: SET_DARKMODE, isDarkMode: storedTheme })
        }

        if (hostname !== 'app.thub.tech') {
            if (!uid) {
                console.log('showing modal')
                dispatch(showRegisterModal())
            } else {
                localStorage.setItem('userId', uid)
                sessionStorage.setItem('userId_session', uid)
                console.log(`fetching uid else /api/check-registration?uid=${uid}`)
            }
        } else {
            if (!uid) {
                console.log('redirecting to https://thub.tech')
                window.location.href = 'https://thub.tech'
            }
        }
    }, [dispatch])

    if (!isRegistered && showRegisterModalState) {
        return <MainLayout />
    }

    return children
}
RequireUID.propTypes = {
    children: PropTypes.node.isRequired
}

export default RequireUID
