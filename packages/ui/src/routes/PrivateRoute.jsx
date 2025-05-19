// src/routes/PrivateRoute.jsx
import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('userId')
    const location = useLocation()

    return isAuthenticated ? children : <Navigate to='/' replace state={{ from: location }} />
}

PrivateRoute.propTypes = {
    children: PropTypes.node
}

export default PrivateRoute
