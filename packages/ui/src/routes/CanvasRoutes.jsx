import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import MinimalLayout from '@/layout/MinimalLayout'
import PrivateRoute from '@/routes/PrivateRoute'

// canvas routing
const Canvas = Loadable(lazy(() => import('@/views/canvas')))
const MarketplaceCanvas = Loadable(lazy(() => import('@/views/marketplaces/MarketplaceCanvas')))

// ==============================|| CANVAS ROUTING ||============================== //

const CanvasRoutes = {
    path: '/',
    element: (
        <PrivateRoute>
            <MinimalLayout />
        </PrivateRoute>
    ),
    children: [
        {
            path: '/canvas',
            element: (
                <PrivateRoute>
                    {' '}
                    <Canvas />
                </PrivateRoute>
            )
        },
        {
            path: '/canvas/:id',
            element: (
                <PrivateRoute>
                    {' '}
                    <Canvas />
                </PrivateRoute>
            )
        },

        {
            path: '/templates/:id',
            element: (
                <PrivateRoute>
                    {' '}
                    <MarketplaceCanvas />
                </PrivateRoute>
            )
        }
    ]
}

export default CanvasRoutes
