import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import { removeSnackbar } from '@/store/actions'

let displayed = new Set()
let activeNotifierId = null
let notifierInstanceCounter = 0

const useNotifier = () => {
    const dispatch = useDispatch()
    const notifier = useSelector((state) => state.notifier)
    const { notifications } = notifier

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const instanceIdRef = React.useRef(0)

    if (!instanceIdRef.current) {
        notifierInstanceCounter += 1
        instanceIdRef.current = notifierInstanceCounter
    }

    const storeDisplayed = (id) => {
        displayed.add(id)
    }

    const removeDisplayed = (id) => {
        displayed.delete(id)
    }

    React.useEffect(() => {
        if (activeNotifierId === null) {
            activeNotifierId = instanceIdRef.current
        }

        return () => {
            if (activeNotifierId === instanceIdRef.current) {
                activeNotifierId = null
            }
        }
    }, [])

    React.useEffect(() => {
        if (activeNotifierId !== instanceIdRef.current) {
            return
        }

        notifications.forEach(({ key, message, options = {}, dismissed = false }) => {
            if (dismissed) {
                if (displayed.has(key)) {
                    closeSnackbar(key)
                } else {
                    dispatch(removeSnackbar(key))
                }
                return
            }

            if (displayed.has(key)) return

            enqueueSnackbar(message, {
                key,
                ...options,
                onClose: (event, reason, myKey) => {
                    if (options.onClose) {
                        options.onClose(event, reason, myKey)
                    }
                },
                onExited: (event, myKey) => {
                    // remove this snackbar from redux store
                    dispatch(removeSnackbar(myKey))
                    removeDisplayed(myKey)
                }
            })

            storeDisplayed(key)
        })
    }, [notifications, closeSnackbar, enqueueSnackbar, dispatch])
}

export default useNotifier
