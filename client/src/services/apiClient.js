import axios from 'axios'
import {
  clearAccessToken,
  getAccessToken,
  notifyUnauthorized,
  setAccessToken,
} from '../utils/tokenManager'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const isUnauthorized = error.response?.status === 401
    const isAuthEndpoint = originalRequest.url?.includes('/auth/')
    const isRefreshCall = originalRequest.url?.includes('/auth/refresh-token')

    // Only attempt to refresh token if:
    // 1. Response is 401
    // 2. This is NOT an auth endpoint (login, register, etc.)
    // 3. This is NOT already a retry attempt
    if (isUnauthorized && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await refreshClient.post('/auth/refresh-token')
        const refreshedToken = response.data?.data?.accessToken

        if (!refreshedToken) {
          throw new Error('Missing refreshed access token')
        }

        setAccessToken(refreshedToken)
        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        clearAccessToken()
        notifyUnauthorized()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
