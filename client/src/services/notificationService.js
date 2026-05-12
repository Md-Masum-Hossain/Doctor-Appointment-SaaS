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

export const notificationService = {
  getNotifications: (params) => apiClient.get(`/notifications${toQueryString(params)}`).then(unwrap),
  getUnreadCount: () => apiClient.get('/notifications/unread/count').then(unwrap),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`).then(unwrap),
  markAllAsRead: () => apiClient.patch('/notifications/read-all').then(unwrap),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`).then(unwrap),
}
