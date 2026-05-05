import { ENQUEUE_SNACKBAR, CLOSE_SNACKBAR, REMOVE_SNACKBAR } from '../actions'

export const initialState = {
    notifications: []
}

const notifierReducer = (state = initialState, action) => {
    switch (action.type) {
        case ENQUEUE_SNACKBAR: {
            const incomingNotification = action.notification
            const shouldPreventDuplicate = incomingNotification?.options?.preventDuplicate !== false
            const duplicateExists = state.notifications.some(
                (notification) =>
                    !notification.dismissed &&
                    (notification.key === incomingNotification.key || notification.dedupeKey === incomingNotification.dedupeKey)
            )

            if (shouldPreventDuplicate && duplicateExists) {
                return state
            }

            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    {
                        ...incomingNotification
                    }
                ]
            }
        }

        case CLOSE_SNACKBAR:
            return {
                ...state,
                notifications: state.notifications.map((notification) =>
                    action.dismissAll || notification.key === action.key ? { ...notification, dismissed: true } : { ...notification }
                )
            }

        case REMOVE_SNACKBAR:
            return {
                ...state,
                notifications: state.notifications.filter((notification) => notification.key !== action.key)
            }

        default:
            return state
    }
}

export default notifierReducer
