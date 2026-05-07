export const AUTH_TOKEN_KEY = 'authToken'
export const AUTH_USER_ID_KEY = 'userId'

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY) || ''

export const getStoredUserId = () => localStorage.getItem(AUTH_USER_ID_KEY) || ''

export const storeAuthSession = (authResponse = {}) => {
    const token = authResponse?.token
    const userId = authResponse?.userId || authResponse?.user?.uid

    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
    if (userId) localStorage.setItem(AUTH_USER_ID_KEY, userId)
}

export const clearAuthSession = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_ID_KEY)
}

export const isAuthenticated = () => Boolean(getAuthToken())
