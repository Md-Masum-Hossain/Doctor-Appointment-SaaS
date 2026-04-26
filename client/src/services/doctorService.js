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

export const doctorService = {
  getDoctors: (params) => apiClient.get(`/doctors${toQueryString(params)}`).then(unwrap),
  getDoctorById: (id) => apiClient.get(`/doctors/${id}`).then(unwrap),
  createProfile: (payload) => apiClient.post('/doctors/profile', payload).then(unwrap),
  updateProfile: (payload) => apiClient.patch('/doctors/profile', payload).then(unwrap),
  verifyDoctor: (id, payload) => apiClient.patch(`/doctors/${id}/verify`, payload).then(unwrap),
}
