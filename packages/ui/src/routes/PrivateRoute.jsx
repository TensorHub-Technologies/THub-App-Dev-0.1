import { useLocation, Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'

const PrivateRoute = ({ children }) => {
    const location = useLocation()

    const params = new URLSearchParams(location.search)
    const uid = params.get('uid')

    const isAuthenticated = localStorage.getItem('userId') || uid

    return isAuthenticated ? children : <Navigate to='/' replace state={{ from: location }} />
}

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired
}

export default PrivateRoute
