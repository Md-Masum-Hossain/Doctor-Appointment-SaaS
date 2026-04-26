import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appointmentService } from '../services/appointmentService'

export const appointmentQueryKeys = {
  all: ['appointments'],
  my: (filters) => ['appointments', 'my', filters],
  doctor: (filters) => ['appointments', 'doctor', filters],
  admin: (filters) => ['appointments', 'admin', filters],
}

export const useMyAppointmentsQuery = (filters) =>
  useQuery({
    queryKey: appointmentQueryKeys.my(filters),
    queryFn: () => appointmentService.getMyAppointments(filters),
  })

export const useDoctorAppointmentsQuery = (filters) =>
  useQuery({
    queryKey: appointmentQueryKeys.doctor(filters),
    queryFn: () => appointmentService.getDoctorAppointments(filters),
  })

export const useAdminAppointmentsQuery = (filters) =>
  useQuery({
    queryKey: appointmentQueryKeys.admin(filters),
    queryFn: () => appointmentService.getAdminAppointments(filters),
  })

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: appointmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.all })
    },
  })
}

export const useUpdateAppointmentStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, notes }) => appointmentService.updateStatus(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.all })
    },
  })
}

export const useRescheduleAppointmentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, appointmentDate, timeSlot, reason, notes }) =>
      appointmentService.reschedule(id, { appointmentDate, timeSlot, reason, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.all })
    },
  })
}

export const useCancelAppointmentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => appointmentService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.all })
    },
  })
}
