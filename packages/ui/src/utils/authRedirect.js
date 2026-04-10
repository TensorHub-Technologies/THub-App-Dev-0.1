const DEFAULT_AUTH_REDIRECT_PATH = '/workflows?theme=dark'

const normalizeRedirectPath = (redirect = '') => {
    if (!redirect || !redirect.startsWith('/')) {
        return DEFAULT_AUTH_REDIRECT_PATH
    }

    return redirect
}

export const getPostAuthRedirectPath = () => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect') || ''

    return normalizeRedirectPath(redirect)
}

export const redirectAfterAuth = (fallbackPath = DEFAULT_AUTH_REDIRECT_PATH) => {
    const redirectPath = getPostAuthRedirectPath() || fallbackPath
    window.location.assign(`${window.location.origin}${redirectPath}`)
}

export const buildLoginRedirectPath = (redirectPath = DEFAULT_AUTH_REDIRECT_PATH) => {
    const safeRedirectPath = normalizeRedirectPath(redirectPath)

    if (safeRedirectPath === '/') {
        return '/'
    }

    return `/?redirect=${encodeURIComponent(safeRedirectPath)}`
}

export { DEFAULT_AUTH_REDIRECT_PATH }
