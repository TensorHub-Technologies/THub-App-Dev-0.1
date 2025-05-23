import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import MinimalLayout from '@/layout/MinimalLayout'

// chatbot routing
const ChatbotFull = Loadable(lazy(() => import('@/views/chatbot')))

const ChatbotRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/chatbot/:id',
            element: <ChatbotFull />
        }
    ]
}

export default ChatbotRoutes
