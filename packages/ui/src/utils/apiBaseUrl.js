const trimTrailingSlash = (url = '') => url.replace(/\/+$/, '')

export const getApiBaseUrl = () => {
    const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
    if (configuredBaseUrl) return trimTrailingSlash(configuredBaseUrl)

    if (typeof window !== 'undefined') {
        const { hostname, origin } = window.location
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `http://${hostname}:3000`
        }

        return trimTrailingSlash(origin)
    }

    return ''
}

export const apiBaseUrl = getApiBaseUrl()
