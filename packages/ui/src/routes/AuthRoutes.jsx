// AuthRoutes.js

import { ForgotPassword } from '@/views/auth/ForgotPassword'
import Login from '@/views/auth/Login'
import SignUp from '@/views/auth/SignUp'
import AcceptInvite from '@/views/dashboard/AcceptInvite'

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
        },
        {
            path: 'accept-invite',
            element: <AcceptInvite />
        }
    ]
}

export default AuthRoutes
