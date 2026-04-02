import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
// import PrivateRoute from '@/routes/PrivateRoute'
import Dashboard from '@/views/dashboard/Dashboard'
import UserInfo from '@/ui-component/userform/UserInfo'

// chatflows routing
const Chatflows = Loadable(lazy(() => import('@/views/chatflows')))

// agents routing
const Agentflows = Loadable(lazy(() => import('@/views/agentflows')))

const Executions = Loadable(lazy(() => import('@/views/agentexecutions')))

// MainLayout routing
const MainLayout = Loadable(lazy(() => import('@/layout/MainLayout')))

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
const VectorStoreConfigure = Loadable(lazy(() => import('@/views/docstore/VectorStoreConfigure')))
const VectorStoreQuery = Loadable(lazy(() => import('@/views/docstore/VectorStoreQuery')))

// Evaluations routing
const EvalEvaluation = Loadable(lazy(() => import('@/views/evaluations/index')))
const EvaluationResult = Loadable(lazy(() => import('@/views/evaluations/EvaluationResult')))
const EvalDatasetRows = Loadable(lazy(() => import('@/views/datasets/DatasetItems')))
const EvalDatasets = Loadable(lazy(() => import('@/views/datasets')))
const Evaluators = Loadable(lazy(() => import('@/views/evaluators')))

// subscription routing
const Subscription = Loadable(lazy(() => import('@/views/subscription')))

// settings routing
const Settings = Loadable(lazy(() => import('@/views/homesettings')))

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/dashboard',
            element: <Dashboard />
        },
        {
            path: '/workflows',
            element: <Chatflows />
        },
        {
            path: '/templates',
            element: <Marketplaces />
        },
        {
            path: 'agentflows',
            element: <Agentflows />
        },
        {
            path: 'executions',
            element: <Executions />
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
            path: '/document-stores/:storeId',
            element: <DocumentStoreDetail />
        },
        {
            path: '/document-stores/chunks/:storeId/:fileId',
            element: <ShowStoredChunks />
        },
        {
            path: '/document-stores/:storeId/:name',
            element: <LoaderConfigPreviewChunks />
        },
        {
            path: '/document-stores/vector/:storeId',
            element: <VectorStoreConfigure />
        },
        {
            path: '/document-stores/vector/:storeId/:docId',
            element: <VectorStoreConfigure />
        },
        {
            path: '/document-stores/query/:storeId',
            element: <VectorStoreQuery />
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
        },
        {
            path: '/user-info',
            element: <UserInfo />
        },
        {
            path: '/datasets',
            element: <EvalDatasets />
        },
        {
            path: '/dataset_rows/:id',
            element: <EvalDatasetRows />
        },
        {
            path: '/evaluations',
            element: <EvalEvaluation />
        },
        {
            path: '/evaluation_results/:id',
            element: <EvaluationResult />
        },
        {
            path: '/evaluators',
            element: <Evaluators />
        }
    ]
}

export default MainRoutes
