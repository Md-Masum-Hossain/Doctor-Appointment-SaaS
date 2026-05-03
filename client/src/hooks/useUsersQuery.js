import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'

export const userQueryKeys = {
  all: ['users'],
  list: (filters) => ['users', 'list', filters],
  detail: (id) => ['users', 'detail', id],
}

export const useUsersQuery = (filters) =>
  useQuery({
    queryKey: userQueryKeys.list(filters),
    queryFn: () => userService.getAllUsers(filters),
    keepPreviousData: true,
  })

export const useUserDetailsQuery = (id) =>
  useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: Boolean(id),
  })

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
    },
  })
}

export const useBlockUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isBlocked }) => userService.blockUser(id, isBlocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
    },
  })
}
