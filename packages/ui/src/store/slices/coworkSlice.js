import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    sessions: [],
    currentSession: null,
    currentTasks: [],
    liveEvents: [],
    loading: false,
    error: null
}

const coworkSlice = createSlice({
    name: 'cowork',
    initialState,
    reducers: {
        setSessions: (state, action) => {
            state.sessions = action.payload
        },
        setCurrentSession: (state, action) => {
            state.currentSession = action.payload
        },
        setCurrentTasks: (state, action) => {
            state.currentTasks = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        updateTaskStatus: (state, action) => {
            const { taskId, status, output } = action.payload
            const task = state.currentTasks.find((t) => t.id === taskId)
            if (task) {
                task.status = status
                if (output) task.outputArtifact = output
            }
        },
        updateSessionStatus: (state, action) => {
            const { sessionId, status } = action.payload
            if (state.currentSession?.id === sessionId) state.currentSession.status = status
            const s = state.sessions.find((s) => s.id === sessionId)
            if (s) s.status = status
        },
        addLiveEvent: (state, action) => {
            state.liveEvents = [action.payload, ...state.liveEvents].slice(0, 100)
        },
        clearCurrentSession: (state) => {
            state.currentSession = null
            state.currentTasks = []
            state.liveEvents = []
        }
    }
})

export const {
    setSessions,
    setCurrentSession,
    setCurrentTasks,
    setLoading,
    setError,
    updateTaskStatus,
    updateSessionStatus,
    addLiveEvent,
    clearCurrentSession
} = coworkSlice.actions

export default coworkSlice.reducer
