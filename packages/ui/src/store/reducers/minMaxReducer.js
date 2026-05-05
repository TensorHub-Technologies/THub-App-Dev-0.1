import { SET_MINMAX } from '../actions'

const initialState = {
    minMax: true,
    uniqueId: Date.now()
}

const minMaxReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_MINMAX:
            return {
                ...state,
                minMax: action.payload,
                uniqueId: Date.now()
            }
        default:
            return state
    }
}

export default minMaxReducer
