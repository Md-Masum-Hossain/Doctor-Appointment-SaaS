import apiClient from './apiClient'

export const paymentService = {
  // Create payment
  createPayment: (paymentData) => {
    return apiClient.post('/payments', paymentData)
  },

  // Initialize SSLCommerz payment
  initializeSslCommerzPayment: (appointmentId) => {
    return apiClient.post('/payments/sslcommerz/initiate', { appointmentId })
  },

  // Validate SSLCommerz payment callback
  validateSslCommerzPayment: (payload) => {
    return apiClient.post('/payments/sslcommerz/validate', payload)
  },

  // Get patient payments
  getMyPayments: (params = {}) => {
    return apiClient.get('/payments/my', { params })
  },

  // Get admin payments
  getAdminPayments: (params = {}) => {
    return apiClient.get('/payments/admin/all', { params })
  },

  // Get payment by ID
  getPaymentById: (id) => {
    return apiClient.get(`/payments/${id}`)
  },

  // Verify payment (admin)
  verifyPayment: (id) => {
    return apiClient.patch(`/payments/${id}/verify`)
  },

  // Reject payment (admin)
  rejectPayment: (id, rejectionReason) => {
    return apiClient.patch(`/payments/${id}/reject`, { rejectionReason })
  },

  // Refund payment (admin)
  refundPayment: (id, refundReason) => {
    return apiClient.patch(`/payments/${id}/refund`, { refundReason })
  },

  // Get payment stats
  getPaymentStats: () => {
    return apiClient.get('/payments/admin/stats')
  },
}
