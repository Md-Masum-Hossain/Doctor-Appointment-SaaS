import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../services/notificationService'

export const notificationQueryKeys = {
  all: ['notifications'],
  list: (filters) => ['notifications', 'list', filters],
  unreadCount: ['notifications', 'unread-count'],
}

export const useNotificationsQuery = (filters = {}) =>
  useQuery({
    queryKey: notificationQueryKeys.list(filters),
    queryFn: () => notificationService.getNotifications(filters),
  })

export const useUnreadCountQuery = () =>
  useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount })
    },
  })
}

export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount })
    },
  })
}

export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount })
    },
  })
}
