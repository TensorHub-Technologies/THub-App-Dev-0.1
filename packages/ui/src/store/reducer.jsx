import { combineReducers } from 'redux'

// reducer import
import customizationReducer from './reducers/customizationReducer'
import canvasReducer from './reducers/canvasReducer'
import notifierReducer from './reducers/notifierReducer'
import dialogReducer from './reducers/dialogReducer'
import userReducer from './reducers/userReducer'
import minMaxReducer from './reducers/minMaxReducer'
import NodeMinMaxReducer from './reducers/nodemMinMaxReducer'
import modalReducer from './reducers/registerReducer'
import coworkReducer from './slices/coworkSlice'

// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
    customization: customizationReducer,
    canvas: canvasReducer,
    notifier: notifierReducer,
    dialog: dialogReducer,
    user: userReducer,
    minMax: minMaxReducer,
    nodeMinMax: NodeMinMaxReducer,
    modal: modalReducer,
    cowork: coworkReducer
})

export default reducer
