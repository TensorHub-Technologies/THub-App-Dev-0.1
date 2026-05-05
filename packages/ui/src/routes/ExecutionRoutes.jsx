import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import MinimalLayout from '@/layout/MinimalLayout'
import ProtectedRoute from './PrivateRoute'

const PublicExecutionDetails = Loadable(lazy(() => import('@/views/agentexecutions/PublicExecutionDetails')))

const ExecutionRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/execution/:id',
            element: (
                <ProtectedRoute>
                    <PublicExecutionDetails />
                </ProtectedRoute>
            )
        }
    ]
}

export default ExecutionRoutes
