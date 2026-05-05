import axios from 'axios'
import { baseURL } from '@/store/constant'
import { clearAuthSession, getAuthToken } from '@/utils/authStorage'

const apiClient = axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
        'Content-type': 'application/json',
        'x-request-from': 'internal'
    }
})

apiClient.interceptors.request.use(function (config) {
    const username = localStorage.getItem('username')
    const password = localStorage.getItem('password')
    const authToken = getAuthToken()

    config.headers = config.headers || {}

    if (username && password) {
        config.auth = {
            username,
            password
        }
    }

    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`
    }

    return config
})

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status

        if (status === 401 && getAuthToken()) {
            const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
            clearAuthSession()

            window.location.assign(currentUrl === '/' ? '/' : currentUrl)
        }

        return Promise.reject(error)
    }
)

export default apiClient
