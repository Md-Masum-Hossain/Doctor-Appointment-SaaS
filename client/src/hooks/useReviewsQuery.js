import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '../services/reviewService'
import { doctorQueryKeys } from './useDoctorsQuery'
import { appointmentQueryKeys } from './useAppointmentsQuery'

export const reviewQueryKeys = {
  all: ['reviews'],
  doctor: (doctorId, filters) => ['reviews', 'doctor', doctorId, filters],
  my: (filters) => ['reviews', 'my', filters],
}

export const useDoctorReviewsQuery = (doctorId, filters = {}) =>
  useQuery({
    queryKey: reviewQueryKeys.doctor(doctorId, filters),
    queryFn: () => reviewService.getDoctorReviews(doctorId, filters),
    enabled: Boolean(doctorId),
  })

export const useMyReviewsQuery = (filters = {}) =>
  useQuery({
    queryKey: reviewQueryKeys.my(filters),
    queryFn: () => reviewService.getMyReviews(filters),
  })

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.all })
    },
  })
}

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewService.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.all })
    },
  })
}
