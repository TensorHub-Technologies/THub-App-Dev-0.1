import { useCallback, useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

export function usePrompt(message, when = true) {
    // useBlocker expects a function that returns true when navigation should be blocked
    const blocker = useBlocker(
        useCallback(
            ({ currentLocation, nextLocation }) => {
                // Block navigation when 'when' is true and we're actually navigating somewhere different
                return when && currentLocation.pathname !== nextLocation.pathname
            },
            [when]
        )
    )

    // Handle the confirmation dialog when navigation is blocked
    useEffect(() => {
        if (blocker.state === 'blocked') {
            const shouldProceed = window.confirm(message)
            if (shouldProceed) {
                blocker.proceed()
            } else {
                blocker.reset()
            }
        }
    }, [blocker, message])

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
}
