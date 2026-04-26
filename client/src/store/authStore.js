import { create } from 'zustand'
import { authService } from '../services/authService'
import {
  clearAccessToken,
  setAccessToken,
  setUnauthorizedHandler,
} from '../utils/tokenManager'

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Request failed'

const getFieldErrors = (error) => {
  const errors = error?.response?.data?.errors
  if (!Array.isArray(errors)) return {}

  return errors.reduce((acc, err) => {
    // Extract field name from path (e.g., "body.password" -> "password")
    const fieldName = err.path.split('.').pop()
    acc[fieldName] = err.message
    return acc
  }, {})
}

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  fieldErrors: {},
  setUser: (user, accessToken = null) => {
    setAccessToken(accessToken)
    set({
      user,
      accessToken,
      isAuthenticated: Boolean(user),
      error: null,
      fieldErrors: {},
    })
  },
  clearError: () => set({ error: null, fieldErrors: {} }),
  clearAuth: () => {
    clearAccessToken()
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    })
  },
  register: async (payload) => {
    set({ isLoading: true, error: null, fieldErrors: {} })

    try {
      const data = await authService.register(payload)
      setAccessToken(data.accessToken)

      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })

      return data.user
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      set({ 
        error: getErrorMessage(error), 
        fieldErrors,
        isLoading: false 
      })
      return null
    }
  },
  login: async (payload) => {
    set({ isLoading: true, error: null, fieldErrors: {} })

    try {
      const data = await authService.login(payload)
      setAccessToken(data.accessToken)

      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })

      return data.user
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      set({ 
        error: getErrorMessage(error), 
        fieldErrors,
        isLoading: false 
      })
      return null
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null })

    try {
      await authService.logout()
    } catch {
      // Always clear client auth state even if server logout fails.
    }

    clearAccessToken()
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    })
  },
  initializeAuth: async () => {
    set({ isLoading: true, error: null })

    try {
      const data = await authService.refreshToken()
      setAccessToken(data.accessToken)

      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
      })
    } catch {
      clearAccessToken()
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      })
    }
  },
}))

setUnauthorizedHandler(() => {
  const state = useAuthStore.getState()
  state.clearAuth()
})

export default useAuthStore
