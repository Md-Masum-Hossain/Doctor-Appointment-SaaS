import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { doctorService } from '../services/doctorService'

export const doctorQueryKeys = {
  all: ['doctors'],
  list: (filters) => ['doctors', 'list', filters],
  detail: (id) => ['doctors', 'detail', id],
  myProfile: ['doctors', 'me', 'profile'],
  dashboardStats: ['doctors', 'dashboard', 'stats'],
  dashboardStatsQuery: (filters) => [...doctorQueryKeys.dashboardStats, filters],
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

export const useMyDoctorProfileQuery = () =>
  useQuery({
    queryKey: doctorQueryKeys.myProfile,
    queryFn: doctorService.getMyProfile,
  })

export const useDoctorDashboardStatsQuery = (filters) =>
  useQuery({
    queryKey: doctorQueryKeys.dashboardStatsQuery(filters),
    queryFn: () => doctorService.getDashboardStats(filters),
  })

export const useCreateDoctorProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: doctorService.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.myProfile })
    },
  })
}

export const useUpdateDoctorProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: doctorService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.myProfile })
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
