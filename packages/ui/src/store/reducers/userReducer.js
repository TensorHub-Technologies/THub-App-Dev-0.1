import { SET_USER_DATA, UPDATE_USER_FIELD } from '../actions'

const initialState = {
    userData: {}
}

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_USER_DATA:
            return {
                ...state,
                userData: action.payload
            }
        case UPDATE_USER_FIELD:
            return {
                ...state,
                userData: {
                    ...state.userData,
                    [action.payload.field]: action.payload.value
                }
            }
        default:
            return state
    }
}

export default userReducer
