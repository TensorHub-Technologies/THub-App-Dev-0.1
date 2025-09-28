import React from 'react'
import App from '@/App'
import { store } from '@/store'
import { createRoot } from 'react-dom/client'

// style + assets
import '@/assets/scss/style.scss'

// third party - CHANGE: Use createBrowserRouter instead of BrowserRouter
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { SnackbarProvider } from 'notistack'
import ConfirmContextProvider from '@/store/context/ConfirmContextProvider'
import { ReactFlowContext } from '@/store/context/ReactFlowContext'

// MSAL Imports
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from './views/auth/microsoftLogin/config/msalConfig'
import config from '@/config'

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

// Create the router with all your providers wrapped around the App
const router = createBrowserRouter(
    [
        {
            path: '/*', // This catches all routes and lets your App handle internal routing with useRoutes
            element: (
                <MsalProvider instance={msalInstance}>
                    <Provider store={store}>
                        <SnackbarProvider>
                            <ConfirmContextProvider>
                                <ReactFlowContext>
                                    <App />
                                </ReactFlowContext>
                            </ConfirmContextProvider>
                        </SnackbarProvider>
                    </Provider>
                </MsalProvider>
            )
        }
    ],
    {
        basename: config.basename
    }
)

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)
