import { useEffect, useRef } from 'react'

export function usePrompt(message, when = true) {
    console.log('Hiii')

    const isBlockingRef = useRef(false)

    useEffect(() => {
        console.log('[usePrompt] Effect triggered. when =', when, ', message =', message)

        if (!when) {
            console.log('[usePrompt] Navigation blocking disabled.')
            isBlockingRef.current = false
            return
        }

        // Handle browser back/forward buttons and page refresh
        const handleBeforeUnload = (event) => {
            console.log('[usePrompt] beforeunload event fired.')
            if (when) {
                console.log('[usePrompt] Blocking unload with message:', message)
                event.preventDefault()
                event.returnValue = message
                return message
            } else {
                console.log('[usePrompt] Skipping unload block since when=false.')
            }
        }

        // Handle back button navigation
        const handlePopState = (event) => {
            console.log('[usePrompt] popstate event fired. isBlockingRef =', isBlockingRef.current)

            if (when && !isBlockingRef.current) {
                console.log('[usePrompt] Blocking back navigation. Showing confirm dialog...')
                isBlockingRef.current = true

                // Show confirmation dialog
                const shouldLeave = window.confirm(message)
                console.log('[usePrompt] User decision =', shouldLeave)

                if (shouldLeave) {
                    console.log('[usePrompt] User confirmed navigation. Going back...')
                    isBlockingRef.current = false
                    window.history.back()
                } else {
                    console.log('[usePrompt] User canceled navigation. Staying on page.')
                    window.history.pushState(null, null, window.location.href)
                    isBlockingRef.current = false
                }
            } else {
                console.log('[usePrompt] Navigation block skipped. when =', when, ', isBlockingRef =', isBlockingRef.current)
            }
        }

        // Add a history entry to intercept back button
        console.log('[usePrompt] Pushing state to history to track back button.')
        window.history.pushState(null, null, window.location.href)

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('popstate', handlePopState)

        return () => {
            console.log('[usePrompt] Cleanup triggered. Removing listeners.')
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('popstate', handlePopState)
            isBlockingRef.current = false
        }
    }, [message, when])
}
