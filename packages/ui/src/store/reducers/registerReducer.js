// reducer.js
import { SHOW_REGISTER_MODAL, HIDE_REGISTER_MODAL, SHOW_LOGIN_MODAL, HIDE_LOGIN_MODAL } from '../actions'

const initialState = {
    showRegisterModal: false,
    showLoginModal: false
}

const modalReducer = (state = initialState, action) => {
    switch (action.type) {
        case SHOW_REGISTER_MODAL:
            return { ...state, showRegisterModal: true }
        case HIDE_REGISTER_MODAL:
            return { ...state, showRegisterModal: false }
        case SHOW_LOGIN_MODAL:
            return { ...state, showLoginModal: true }
        case HIDE_LOGIN_MODAL:
            return { ...state, showLoginModal: false }
        default:
            return state
    }
}

export default modalReducer
