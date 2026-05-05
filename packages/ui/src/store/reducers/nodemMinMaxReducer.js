import { SET_NODEMINMAX } from '../actions'

const initialState = {
    nodeMinMax: true
}

const NodeMinMaxReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_NODEMINMAX:
            return {
                ...state,
                nodeMinMax: action.payload
            }
        default:
            return state
    }
}

export default NodeMinMaxReducer
