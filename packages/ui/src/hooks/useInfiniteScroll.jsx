import { useEffect, useRef, useCallback } from 'react'

const useInfiniteScroll = (callback, hasMore, loading) => {
    const observer = useRef(null)
    const sentinelRef = useRef(null)

    const handleObserver = useCallback(
        (entries) => {
            const target = entries[0]
            if (target.isIntersecting && hasMore && !loading) {
                callback()
            }
        },
        [callback, hasMore, loading]
    )

    useEffect(() => {
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(handleObserver, {
            rootMargin: '200px',
            threshold: 1.0
        })

        if (sentinelRef.current) {
            observer.current.observe(sentinelRef.current)
        }

        return () => {
            if (observer.current) observer.current.disconnect()
        }
    }, [handleObserver])

    return { sentinelRef }
}

export default useInfiniteScroll
