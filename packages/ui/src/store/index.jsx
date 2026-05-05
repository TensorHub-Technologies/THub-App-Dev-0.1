import { createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // Uses localStorage
import reducer from './reducer'

// ==============================|| PERSIST CONFIGURATION ||============================== //

const persistConfig = {
    key: 'root', // Key for storage
    storage, // Use localStorage (default)
    blacklist: ['notifier']
}

const persistedReducer = persistReducer(persistConfig, reducer)

// Create Store with persisted reducer
const store = createStore(persistedReducer)

// Create persistor to manage persistence
const persistor = persistStore(store)

export { store, persistor }
