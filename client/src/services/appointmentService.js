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

export const appointmentService = {
  create: (payload) => apiClient.post('/appointments', payload).then(unwrap),
  getMyAppointments: (params) => apiClient.get(`/appointments/my${toQueryString(params)}`).then(unwrap),
  getDoctorAppointments: (params) => apiClient.get(`/appointments/doctor${toQueryString(params)}`).then(unwrap),
  getAdminAppointments: (params) => apiClient.get(`/appointments/admin${toQueryString(params)}`).then(unwrap),
  updateStatus: (id, payload) => apiClient.patch(`/appointments/${id}/status`, payload).then(unwrap),
  reschedule: (id, payload) => apiClient.patch(`/appointments/${id}/reschedule`, payload).then(unwrap),
  cancel: (id) => apiClient.delete(`/appointments/${id}/cancel`).then(unwrap),
}
