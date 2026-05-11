import { useQuery, useMutation } from '@tanstack/react-query'
import { paymentService } from '../services/paymentService'

export const usePaymentsQuery = (options = {}) => {
  return useQuery({
    queryKey: ['payments', options],
    queryFn: () => paymentService.getMyPayments(options),
  })
}

export const useAdminPaymentsQuery = (options = {}) => {
  return useQuery({
    queryKey: ['payments', 'admin', options],
    queryFn: () => paymentService.getAdminPayments(options),
  })
}

export const usePaymentStats = () => {
  return useQuery({
    queryKey: ['payments', 'stats'],
    queryFn: () => paymentService.getPaymentStats(),
  })
}

export const useCreatePaymentMutation = () => {
  return useMutation({
    mutationFn: (paymentData) => paymentService.createPayment(paymentData),
  })
}

export const useVerifyPaymentMutation = () => {
  return useMutation({
    mutationFn: (paymentId) => paymentService.verifyPayment(paymentId),
  })
}

export const useRejectPaymentMutation = () => {
  return useMutation({
    mutationFn: ({ paymentId, reason }) =>
      paymentService.rejectPayment(paymentId, reason),
  })
}

export const useRefundPaymentMutation = () => {
  return useMutation({
    mutationFn: ({ paymentId, reason }) =>
      paymentService.refundPayment(paymentId, reason),
  })
}
