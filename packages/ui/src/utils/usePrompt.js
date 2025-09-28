import { useCallback } from 'react'
import { useBlocker } from 'react-router-dom'

// Using the official useBlocker hook from React Router v6.4+
export function usePrompt(message, when = true) {
    const blocker = useBlocker(
        useCallback(() => {
            if (when && !window.confirm(message)) {
                return true // Block the navigation
            }
            return false // Allow navigation
        }, [message, when])
    )
}

// Alternative implementation that returns the blocker state
export function usePromptWithState(message, when = true) {
    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        return when && currentLocation.pathname !== nextLocation.pathname
    })

    // Handle the blocking logic
    if (blocker.state === 'blocked') {
        if (window.confirm(message)) {
            blocker.proceed()
        } else {
            blocker.reset()
        }
    }

    return blocker
}
