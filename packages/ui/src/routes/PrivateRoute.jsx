// src/routes/PrivateRoute.jsx
import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
    const url = new URL(window.location.href)
    const uid = url.searchParams.get('uid')
    const isAuthenticated = localStorage.getItem('userId') || uid
    const location = useLocation()

    return isAuthenticated ? children : <Navigate to='/' replace state={{ from: location }} />
}

PrivateRoute.propTypes = {
    children: PropTypes.node
}

export default PrivateRoute
