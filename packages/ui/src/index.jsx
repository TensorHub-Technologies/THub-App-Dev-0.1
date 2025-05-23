import React from 'react'
import App from '@/App'
import { store, persistor } from '@/store'
import { createRoot } from 'react-dom/client'

// style + assets
import '@/assets/scss/style.scss'

// third party
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { SnackbarProvider } from 'notistack'
import ConfirmContextProvider from '@/store/context/ConfirmContextProvider'
import { ReactFlowContext } from '@/store/context/ReactFlowContext'

// MSAL Imports
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from './views/auth/microsoftLogin/config/msalConfig'

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
    <React.StrictMode>
        <MsalProvider instance={msalInstance}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <BrowserRouter>
                        <SnackbarProvider>
                            <ConfirmContextProvider>
                                <ReactFlowContext>
                                    <App />
                                </ReactFlowContext>
                            </ConfirmContextProvider>
                        </SnackbarProvider>
                    </BrowserRouter>
                </PersistGate>
            </Provider>
        </MsalProvider>
    </React.StrictMode>
)
