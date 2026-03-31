import { useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { getAuthToken } from '@/utils/authStorage'
import Unauthorized from '@/views/errors/Unauthorized'

const PrivateRoute = ({ children }) => {
    const location = useLocation()

    const params = new URLSearchParams(location.search)
    const uidFromURL = params.get('uid')

    if (uidFromURL) {
        localStorage.setItem('userId', uidFromURL)
    }

    const isAuthenticated = Boolean(getAuthToken())
    const redirectPath = `${location.pathname}${location.search}${location.hash}`

    return isAuthenticated ? children : <Unauthorized attemptedPath={redirectPath} />
}

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired
}

export default PrivateRoute
