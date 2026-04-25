import apiClient from './apiClient'

const unwrap = (response) => response.data?.data

export const authService = {
  register: (payload) => apiClient.post('/auth/register', payload).then(unwrap),
  login: (payload) => apiClient.post('/auth/login', payload).then(unwrap),
  refreshToken: () => apiClient.post('/auth/refresh-token').then(unwrap),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me').then(unwrap),
}
