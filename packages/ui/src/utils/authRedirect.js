const DEFAULT_AUTH_REDIRECT_PATH = '/workflows?theme=dark'
const AUTH_REDIRECT_DEBUG_PREFIX = '[auth-redirect]'

const normalizeRedirectPath = (redirect = '') => {
    if (!redirect || !redirect.startsWith('/')) {
        return DEFAULT_AUTH_REDIRECT_PATH
    }

    return redirect
}

export const getPostAuthRedirectPath = () => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect') || ''
    const normalizedRedirect = normalizeRedirectPath(redirect)

    console.log(`${AUTH_REDIRECT_DEBUG_PREFIX} resolved redirect query`, {
        rawRedirect: redirect || null,
        normalizedRedirect,
        currentSearch: window.location.search
    })

    return normalizedRedirect
}

export const resolvePostAuthRedirectPath = (fallbackPath = DEFAULT_AUTH_REDIRECT_PATH) => {
    return getPostAuthRedirectPath() || normalizeRedirectPath(fallbackPath)
}

export const redirectAfterAuth = (options = DEFAULT_AUTH_REDIRECT_PATH) => {
    const isOptionsObject = options && typeof options === 'object'
    const fallbackPath = isOptionsObject ? options.fallbackPath || DEFAULT_AUTH_REDIRECT_PATH : options
    const navigate = isOptionsObject ? options.navigate : undefined
    const replace = isOptionsObject ? options.replace !== false : true

    const redirectPath = resolvePostAuthRedirectPath(fallbackPath)
    const targetUrl = `${window.location.origin}${redirectPath}`

    console.log(`${AUTH_REDIRECT_DEBUG_PREFIX} redirectAfterAuth`, {
        fallbackPath,
        redirectPath,
        targetUrl,
        usingSpaNavigate: typeof navigate === 'function',
        replace,
        currentUrl: window.location.href
    })

    if (typeof navigate === 'function') {
        navigate(redirectPath, { replace })
        return redirectPath
    }

    if (typeof window !== 'undefined') {
        window.location.assign(`${window.location.origin}${redirectPath}`)
        console.log('***', window.location.assign(`${window.location.origin}${redirectPath}`))
    }

    return redirectPath
}

export const buildLoginRedirectPath = (redirectPath = DEFAULT_AUTH_REDIRECT_PATH) => {
    const safeRedirectPath = normalizeRedirectPath(redirectPath)

    if (safeRedirectPath === '/') {
        return '/'
    }

    const loginRedirectPath = `/?redirect=${encodeURIComponent(safeRedirectPath)}`
    console.log(`${AUTH_REDIRECT_DEBUG_PREFIX} buildLoginRedirectPath`, {
        requestedRedirectPath: redirectPath,
        safeRedirectPath,
        loginRedirectPath
    })

    return loginRedirectPath
}

export { DEFAULT_AUTH_REDIRECT_PATH }
