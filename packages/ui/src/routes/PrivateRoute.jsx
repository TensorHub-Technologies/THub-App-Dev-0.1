import { useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'

const PrivateRoute = ({ children }) => {
    const location = useLocation()

    const params = new URLSearchParams(location.search)
    const uidFromURL = params.get('uid')

    useEffect(() => {
        if (uidFromURL) {
            localStorage.setItem('userId', uidFromURL)
        }
        console.log(uidFromURL, 'UID FROM URL')
    }, [uidFromURL])

    const isAuthenticated = uidFromURL || localStorage.getItem('userId')

    return isAuthenticated ? children : <Navigate to='/' replace state={{ from: location }} />
}

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired
}

export default PrivateRoute
