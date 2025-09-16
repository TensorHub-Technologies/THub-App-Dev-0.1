// For React Router v6.4+
import { useBlocker } from 'react-router-dom'

export function usePrompt(message, when = true) {
    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        return when && currentLocation.pathname !== nextLocation.pathname
    })

    useEffect(() => {
        if (blocker.state === 'blocked') {
            if (window.confirm(message)) {
                blocker.proceed()
            } else {
                blocker.reset()
            }
        }
    }, [blocker, message])
}
