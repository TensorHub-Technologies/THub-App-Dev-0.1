import { lazy } from 'react'

// project imports
import MainLayout from '@/layout/MainLayout'
import Loadable from '@/ui-component/loading/Loadable'
import PrivateRoute from '@/routes/PrivateRoute' // Import the PrivateRoute component

// chatflows routing
const Chatflows = Loadable(lazy(() => import('@/views/chatflows')))

// agents routing
// const Agentflows = Loadable(lazy(() => import('@/views/agentflows')))

// marketplaces routing
const Marketplaces = Loadable(lazy(() => import('@/views/marketplaces')))

// apikey routing
const APIKey = Loadable(lazy(() => import('@/views/apikey')))

// tools routing
const Tools = Loadable(lazy(() => import('@/views/tools')))

// assistants routing
const Assistants = Loadable(lazy(() => import('@/views/assistants')))

// credentials routing
const Credentials = Loadable(lazy(() => import('@/views/credentials')))

// variables routing
const Variables = Loadable(lazy(() => import('@/views/variables')))

// documents routing
const Documents = Loadable(lazy(() => import('@/views/docstore')))
const DocumentStoreDetail = Loadable(lazy(() => import('@/views/docstore/DocumentStoreDetail')))
const ShowStoredChunks = Loadable(lazy(() => import('@/views/docstore/ShowStoredChunks')))
const LoaderConfigPreviewChunks = Loadable(lazy(() => import('@/views/docstore/LoaderConfigPreviewChunks')))

// subscription routing
const Subscription = Loadable(lazy(() => import('@/views/subscription')))

// settings routing
const Settings = Loadable(lazy(() => import('@/views/homesettings')))

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
    path: '/',
    element: (
        <PrivateRoute>
            <MainLayout />
        </PrivateRoute>
    ),
    children: [
        {
            path: '/workflows',
            element: (
                <PrivateRoute>
                    <Chatflows />
                </PrivateRoute>
            )
        },
        {
            path: '/templates',
            element: (
                <PrivateRoute>
                    <Marketplaces />
                </PrivateRoute>
            )
        },
        {
            path: '/apikey',
            element: (
                <PrivateRoute>
                    <APIKey />
                </PrivateRoute>
            )
        },
        {
            path: '/tools',
            element: (
                <PrivateRoute>
                    <Tools />
                </PrivateRoute>
            )
        },
        {
            path: '/assistants',
            element: (
                <PrivateRoute>
                    <Assistants />
                </PrivateRoute>
            )
        },
        {
            path: '/credentials',
            element: (
                <PrivateRoute>
                    <Credentials />
                </PrivateRoute>
            )
        },
        {
            path: '/variables',
            element: (
                <PrivateRoute>
                    <Variables />
                </PrivateRoute>
            )
        },
        {
            path: '/document-stores',
            element: (
                <PrivateRoute>
                    <Documents />
                </PrivateRoute>
            )
        },
        {
            path: '/document-stores/:id',
            element: (
                <PrivateRoute>
                    <DocumentStoreDetail />
                </PrivateRoute>
            )
        },
        {
            path: '/document-stores/chunks/:id/:id',
            element: (
                <PrivateRoute>
                    <ShowStoredChunks />
                </PrivateRoute>
            )
        },
        {
            path: '/document-stores/:id/:name',
            element: (
                <PrivateRoute>
                    <LoaderConfigPreviewChunks />
                </PrivateRoute>
            )
        },
        {
            path: '/subscription',
            element: (
                <PrivateRoute>
                    <Subscription />
                </PrivateRoute>
            )
        },
        {
            path: '/subscription/api/payments/payment-success',
            element: (
                <PrivateRoute>
                    <Subscription />
                </PrivateRoute>
            )
        },
        {
            path: '/subscription/api/payments/payment-failure',
            element: (
                <PrivateRoute>
                    <Subscription />
                </PrivateRoute>
            )
        },
        {
            path: '/setting',
            element: (
                <PrivateRoute>
                    <Settings />
                </PrivateRoute>
            )
        }
    ]
}

export default MainRoutes
