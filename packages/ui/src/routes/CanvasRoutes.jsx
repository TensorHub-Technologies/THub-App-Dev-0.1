import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import MinimalLayout from '@/layout/MinimalLayout'
import ProtectedRoute from './PrivateRoute' // ✅ import it

// canvas routing
const Canvas = Loadable(lazy(() => import('@/views/canvas')))
const MarketplaceCanvas = Loadable(lazy(() => import('@/views/marketplaces/MarketplaceCanvas')))
const CanvasV2 = Loadable(lazy(() => import('@/views/agentflowsv2/Canvas')))
const MarketplaceCanvasV2 = Loadable(lazy(() => import('@/views/agentflowsv2/MarketplaceCanvas')))

const CanvasRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/canvas',
            element: (
                <ProtectedRoute>
                    <Canvas />
                </ProtectedRoute>
            )
        },
        {
            path: '/canvas/:id',
            element: (
                <ProtectedRoute>
                    <Canvas />
                </ProtectedRoute>
            )
        },
        {
            path: '/agentcanvas',
            element: (
                <ProtectedRoute>
                    <Canvas />
                </ProtectedRoute>
            )
        },
        {
            path: '/agentcanvas/:id',
            element: (
                <ProtectedRoute>
                    <Canvas />
                </ProtectedRoute>
            )
        },
        {
            path: '/v2/agentcanvas',
            element: (
                <ProtectedRoute>
                    <CanvasV2 />
                </ProtectedRoute>
            )
        },
        {
            path: '/v2/agentcanvas/:id',
            element: (
                <ProtectedRoute>
                    <CanvasV2 />
                </ProtectedRoute>
            )
        },
        {
            path: '/marketplace/:id',
            element: (
                <ProtectedRoute>
                    <MarketplaceCanvas />
                </ProtectedRoute>
            )
        },
        {
            path: '/v2/marketplace/:id',
            element: (
                <ProtectedRoute>
                    <MarketplaceCanvasV2 />
                </ProtectedRoute>
            )
        }
    ]
}

export default CanvasRoutes
