import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { doctorService } from '../services/doctorService'

export const doctorQueryKeys = {
  all: ['doctors'],
  list: (filters) => ['doctors', 'list', filters],
  detail: (id) => ['doctors', 'detail', id],
}

export const useDoctorsQuery = (filters) =>
  useQuery({
    queryKey: doctorQueryKeys.list(filters),
    queryFn: () => doctorService.getDoctors(filters),
    keepPreviousData: true,
  })

export const useDoctorDetailsQuery = (id) =>
  useQuery({
    queryKey: doctorQueryKeys.detail(id),
    queryFn: () => doctorService.getDoctorById(id),
    enabled: Boolean(id),
  })

export const useCreateDoctorProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: doctorService.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.all })
    },
  })
}

export const useUpdateDoctorProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: doctorService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.all })
    },
  })
}

export const useVerifyDoctorMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isVerified = true }) => doctorService.verifyDoctor(id, { isVerified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.all })
    },
  })
}
