import { useCallback, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function usePrompt(message, when = true) {
    const navigate = useNavigate()
    const location = useLocation()
    const currentPath = useRef(location.pathname)
    const isNavigating = useRef(false)

    // Update current path when location changes (but not during our controlled navigation)
    useEffect(() => {
        if (!isNavigating.current) {
            currentPath.current = location.pathname
        }
        isNavigating.current = false
    }, [location.pathname])

    // Handle browser back/forward navigation
    useEffect(() => {
        if (!when) return

        const handlePopState = (event) => {
            if (when && !isNavigating.current) {
                const shouldProceed = window.confirm(message)
                if (!shouldProceed) {
                    // Prevent the navigation by pushing the current state back
                    isNavigating.current = true
                    window.history.pushState(null, document.title, currentPath.current)
                    // Force React Router to update to the current path
                    navigate(currentPath.current, { replace: true })
                    event.preventDefault()
                    return false
                }
            }
        }

        // Listen for popstate events (back/forward button)
        window.addEventListener('popstate', handlePopState)

        // Push an initial state to detect back button presses
        window.history.pushState(null, document.title, window.location.pathname)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [when, message, navigate])

    // Handle browser reload/close/tab close
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (when) {
                event.preventDefault()
                event.returnValue = message
                return message
            }
        }

        if (when) {
            window.addEventListener('beforeunload', handleBeforeUnload)
            return () => window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [when, message])

    // Return a custom navigate function that shows confirmation
    const promptedNavigate = useCallback(
        (to, options = {}) => {
            if (when && to !== location.pathname) {
                const shouldProceed = window.confirm(message)
                if (shouldProceed) {
                    isNavigating.current = true
                    navigate(to, options)
                }
            } else {
                isNavigating.current = true
                navigate(to, options)
            }
        },
        [when, message, location.pathname, navigate]
    )

    return promptedNavigate
}
