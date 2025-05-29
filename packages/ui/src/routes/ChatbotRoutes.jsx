import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import MinimalLayout from '@/layout/MinimalLayout'
import ProtectedRoute from './PrivateRoute' // ✅ import

// chatbot routing
const ChatbotFull = Loadable(lazy(() => import('@/views/chatbot')))

const ChatbotRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/chatbot/:id',
            element: (
                <ProtectedRoute>
                    <ChatbotFull />
                </ProtectedRoute>
            )
        }
    ]
}

export default ChatbotRoutes
