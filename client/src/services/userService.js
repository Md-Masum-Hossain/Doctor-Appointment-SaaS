import apiClient from './apiClient'

const unwrap = (response) => response.data?.data

const toQueryString = (params = {}) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const userService = {
  getAllUsers: (params) => apiClient.get(`/users${toQueryString(params)}`).then(unwrap),
  getUserById: (id) => apiClient.get(`/users/${id}`).then(unwrap),
  deleteUser: (id) => apiClient.delete(`/users/${id}`).then(unwrap),
  blockUser: (id, isBlocked) =>
    apiClient.patch(`/users/${id}/block`, { isBlocked }).then(unwrap),
}
