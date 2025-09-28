import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export function usePrompt(message, when = true) {
    const location = useLocation()
    const navigationType = useNavigationType()
    const unblockRef = useRef()
    const hasAddedHistoryEntry = useRef(false)

    useEffect(() => {
        if (!when) {
            hasAddedHistoryEntry.current = false
            return
        }

        // Handle browser back/forward buttons and page refresh
        const handleBeforeUnload = (event) => {
            if (when) {
                event.preventDefault()
                event.returnValue = message
                return message
            }
        }

        // Handle programmatic navigation within the app
        const handlePopState = (event) => {
            if (when) {
                const shouldNavigate = window.confirm(message)
                if (!shouldNavigate) {
                    // User clicked Cancel - stay on current page
                    // Push the current state back to prevent navigation
                    window.history.pushState(null, '', location.pathname + location.search)
                } else {
                    // User clicked OK - allow navigation by going back again
                    hasAddedHistoryEntry.current = false
                    window.history.back()
                }
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('popstate', handlePopState)

        // Add a history entry only once when the prompt is enabled
        if (when && !hasAddedHistoryEntry.current) {
            window.history.pushState(null, '', location.pathname + location.search)
            hasAddedHistoryEntry.current = true
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('popstate', handlePopState)
        }
    }, [message, when, location.pathname, location.search])

    // Reset the history entry flag when navigating to a new location
    useEffect(() => {
        hasAddedHistoryEntry.current = false
    }, [location.pathname])
}
