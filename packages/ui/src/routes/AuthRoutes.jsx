// AuthRoutes.js

import Login from '@/views/auth/Login'
import SignUp from '@/views/auth/SignUp'

const AuthRoutes = {
    path: '/',
    children: [
        {
            index: true,
            element: <Login />
        },
        {
            path: 'signup',
            element: <SignUp />
        }
    ]
}

export default AuthRoutes
