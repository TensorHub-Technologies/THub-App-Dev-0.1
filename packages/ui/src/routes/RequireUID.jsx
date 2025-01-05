import { SET_DARKMODE } from '@/store/actions'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const RequireUID = ({ children }) => {
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()

    useEffect(() => {
        const url = new URL(window.location.href)
        const params = new URLSearchParams(url.search)
        const urlTheme = params.get('theme')
        const localTheme = localStorage.getItem('isDarkMode')
        const uid = params.get('uid') || localStorage.getItem('userId')

        // Handle theme setting
        if (urlTheme === 'dark' || urlTheme === 'lite') {
            const isDarkMode = urlTheme === 'dark'
            dispatch({ type: SET_DARKMODE, isDarkMode })
            localStorage.setItem('isDarkMode', isDarkMode)
        } else if (localTheme !== null) {
            const storedTheme = localTheme === 'true'
            dispatch({ type: SET_DARKMODE, isDarkMode: storedTheme })
        }

        // If no UID is found, redirect to thub.tech
        if (!uid) {
            window.location.href = 'https://thub.tech'
        } else {
            localStorage.setItem('userId', uid)
            sessionStorage.setItem('userId_session', uid)
        }
    }, [dispatch])

    return children
}

export default RequireUID
