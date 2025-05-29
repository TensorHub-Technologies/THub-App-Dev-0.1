// AuthRoutes.js

import { ForgotPassword } from '@/views/auth/ForgotPassword'
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
        },
        {
            path: 'forgot-password',
            element: <ForgotPassword />
        }
    ]
}

export default AuthRoutes
