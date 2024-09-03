import { SET_DARKMODE } from '@/store/actions'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const RequireUID = ({ children }) => {
    const customization = useSelector((state) => state.customization)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        const url = new URL(window.location.href)
        const params = new URLSearchParams(url.search)
        const urlTheme = params.get('theme')
        const localTheme = localStorage.getItem('isDarkMode')
        const uid = params.get('uid') || localStorage.getItem('userId')

        // commented for routing to aws
        if (urlTheme === 'dark' || urlTheme === 'lite') {
            const isDarkMode = urlTheme === 'dark'
            dispatch({ type: SET_DARKMODE, isDarkMode })
            localStorage.setItem('isDarkMode', isDarkMode)
        } else if (localTheme !== null) {
            const storedTheme = localTheme === 'true'
            dispatch({ type: SET_DARKMODE, isDarkMode: storedTheme })
        }
        localStorage.setItem('userId', uid)
        sessionStorage.setItem('userId_session', uid)
    }, [navigate])

    return children
}

export default RequireUID
