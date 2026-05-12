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

export const reviewService = {
  create: (payload) => apiClient.post('/reviews', payload).then(unwrap),
  getDoctorReviews: (doctorId, params) => apiClient.get(`/reviews/doctor/${doctorId}${toQueryString(params)}`).then(unwrap),
  getMyReviews: (params) => apiClient.get(`/reviews/my${toQueryString(params)}`).then(unwrap),
  deleteReview: (id) => apiClient.delete(`/reviews/${id}`).then(unwrap),
}
