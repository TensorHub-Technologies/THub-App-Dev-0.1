import { useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function usePrompt(message, when = true) {
    const navigate = useNavigate()
    const location = useLocation()
    const currentPath = useRef(location.pathname)
    const isBlocking = useRef(false)

    useEffect(() => {
        currentPath.current = location.pathname
    }, [location.pathname])

    useEffect(() => {
        if (!when) return

        const handleBeforeUnload = (e) => {
            if (when) {
                e.preventDefault()
                e.returnValue = message
                return message
            }
        }

        // Handle browser back/forward and page refresh
        window.addEventListener('beforeunload', handleBeforeUnload)

        // Handle programmatic navigation
        const originalPushState = window.history.pushState
        const originalReplaceState = window.history.replaceState

        window.history.pushState = function (...args) {
            if (when && !isBlocking.current) {
                isBlocking.current = true
                const shouldProceed = window.confirm(message)
                isBlocking.current = false

                if (shouldProceed) {
                    return originalPushState.apply(this, args)
                }
                return
            }
            return originalPushState.apply(this, args)
        }

        window.history.replaceState = function (...args) {
            if (when && !isBlocking.current) {
                isBlocking.current = true
                const shouldProceed = window.confirm(message)
                isBlocking.current = false

                if (shouldProceed) {
                    return originalReplaceState.apply(this, args)
                }
                return
            }
            return originalReplaceState.apply(this, args)
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.history.pushState = originalPushState
            window.history.replaceState = originalReplaceState
        }
    }, [message, when])

    // Return a navigate function that respects the prompt
    const blockedNavigate = useCallback(
        (to, options) => {
            if (when && !isBlocking.current) {
                isBlocking.current = true
                const shouldProceed = window.confirm(message)
                isBlocking.current = false

                if (shouldProceed) {
                    navigate(to, options)
                }
            } else {
                navigate(to, options)
            }
        },
        [navigate, message, when]
    )

    return blockedNavigate
}
