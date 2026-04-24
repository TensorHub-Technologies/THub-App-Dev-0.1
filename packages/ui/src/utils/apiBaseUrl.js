const trimTrailingSlash = (url = '') => url.replace(/\/+$/, '')
const API_BASE_DEBUG_PREFIX = '[api-base-url]'

export const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const { hostname, origin, protocol } = window.location
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            const localApiBaseUrl = `${protocol}//${hostname}:3000`
            console.log(`${API_BASE_DEBUG_PREFIX} resolved localhost api base url`, {
                hostname,
                apiBaseUrl: localApiBaseUrl
            })
            return localApiBaseUrl
        }

        const derivedApiBaseUrl = trimTrailingSlash(origin)
        console.log(`${API_BASE_DEBUG_PREFIX} resolved browser-origin api base url`, {
            hostname,
            origin,
            apiBaseUrl: derivedApiBaseUrl
        })
        return derivedApiBaseUrl
    }

    return ''
}

export const apiBaseUrl = getApiBaseUrl()
