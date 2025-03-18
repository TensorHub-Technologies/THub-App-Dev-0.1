import { lazy } from 'react'

// project imports
import MainLayout from '@/layout/MainLayout'
import Loadable from '@/ui-component/loading/Loadable'
import RequireUID from './RequireUID'

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
        <RequireUID>
            <MainLayout />
        </RequireUID>
    ),
    children: [
        {
            path: '/',
            element: <Chatflows />
        },
        {
            path: '/workflows',
            element: <Chatflows />
        },
        // {
        //     path: '/agentflows',
        //     element: <Agentflows />
        // },
        {
            path: '/templates',
            element: <Marketplaces />
        },
        {
            path: '/apikey',
            element: <APIKey />
        },
        {
            path: '/tools',
            element: <Tools />
        },
        {
            path: '/assistants',
            element: <Assistants />
        },
        {
            path: '/credentials',
            element: <Credentials />
        },
        {
            path: '/variables',
            element: <Variables />
        },
        {
            path: '/document-stores',
            element: <Documents />
        },
        {
            path: '/document-stores/:id',
            element: <DocumentStoreDetail />
        },
        {
            path: '/document-stores/chunks/:id/:id',
            element: <ShowStoredChunks />
        },
        {
            path: '/document-stores/:id/:name',
            element: <LoaderConfigPreviewChunks />
        },
        {
            path: '/subscription',
            element: <Subscription />
        },
        {
            path: '/subscription/api/payments/payment-success',
            element: <Subscription />
        },
        {
            path: '/subscription/api/payments/payment-failure',
            element: <Subscription />
        },
        {
            path: '/setting',
            element: <Settings />
        }
    ]
}

export default MainRoutes
