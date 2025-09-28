import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function usePrompt(message, when = true) {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (!when) return

        const handleBeforeUnload = (e) => {
            e.preventDefault()
            e.returnValue = message
            return message
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        const unblock = navigate.block((tx) => {
            if (window.confirm(message)) {
                tx.retry()
            }
        })

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            unblock()
        }
    }, [navigate, message, when, location])
}
