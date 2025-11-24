import { useEffect } from 'react'

export function usePrompt(message, when = true) {
    useEffect(() => {
        if (!when) return

        const handler = (event) => {
            event.preventDefault()
            event.returnValue = message
            return message
        }

        window.addEventListener('beforeunload', handler)

        return () => {
            window.removeEventListener('beforeunload', handler)
        }
    }, [when, message])
}
