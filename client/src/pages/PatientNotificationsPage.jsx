import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/layout/DashboardLayout'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import { useNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation, useDeleteNotificationMutation, useUnreadCountQuery } from '../hooks/useNotificationsQuery'
import useAuthStore from '../store/authStore'
import { getDashboardPathByRole } from '../utils/roleRedirect'
import { getNotificationTargetPath } from '../utils/notificationRedirect'

const notificationTypeIcons = {
  'appointment-booked': '📅',
  'appointment-accepted': '✅',
  'appointment-cancelled': '❌',
  'payment-verified': '💳',
  'doctor-verified': '🏥',
  'review-submitted': '⭐',
}

const notificationTypeBadges = {
  'appointment-booked': 'blue',
  'appointment-accepted': 'green',
  'appointment-cancelled': 'red',
  'payment-verified': 'emerald',
  'doctor-verified': 'purple',
  'review-submitted': 'amber',
}

function PatientNotificationsPage() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const limit = 10
  const { user } = useAuthStore()
  const { data: unreadData } = useUnreadCountQuery()
  const { data: notificationsData, isLoading, isError, error } = useNotificationsQuery({ page, limit, sortOrder: 'desc' })
  const markAsReadMutation = useMarkAsReadMutation()
  const markAllAsReadMutation = useMarkAllAsReadMutation()
  const deleteNotificationMutation = useDeleteNotificationMutation()

  const unreadCount = unreadData?.unreadCount || 0
  const notifications = notificationsData?.items || []
  const total = notificationsData?.total || 0
  const totalPages = notificationsData?.totalPages || 1
  const dashboardPath = getDashboardPathByRole(user?.role)

  const navigation = [
    { to: dashboardPath, label: 'Dashboard' },
    { to: '/notifications', label: 'Notifications' },
  ]

  const handleMarkAsRead = (notificationId, isRead) => {
    if (!isRead) {
      markAsReadMutation.mutate(notificationId)
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleDelete = (notificationId) => {
    deleteNotificationMutation.mutate(notificationId)
  }

  const handleOpenNotification = (notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id)
    }

    navigate(getNotificationTargetPath(notification, user?.role))
  }

  const getNotificationColor = (type) => {
    const colors = {
      'appointment-booked': 'text-blue-600 bg-blue-50',
      'appointment-accepted': 'text-green-600 bg-green-50',
      'appointment-cancelled': 'text-red-600 bg-red-50',
      'payment-verified': 'text-emerald-600 bg-emerald-50',
      'doctor-verified': 'text-purple-600 bg-purple-50',
      'review-submitted': 'text-amber-600 bg-amber-50',
    }
    return colors[type] || 'text-slate-600 bg-slate-50'
  }

  return (
    <DashboardLayout navigation={navigation}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Notifications</h1>
            <p className="mt-1 text-slate-600">Stay updated with your appointments and activities</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="primary" size="sm" onClick={handleMarkAllAsRead} disabled={markAllAsReadMutation.isPending}>
              {markAllAsReadMutation.isPending ? 'Marking...' : `Mark all as read (${unreadCount})`}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <LoadingSkeleton rows={5} />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm text-rose-600">{error?.response?.data?.message || 'Failed to load notifications'}</p>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="You're all caught up! Check back later for updates."
            action={
              <Link to="/patient/appointments">
                <Button variant="primary">View appointments</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <motion.article
                key={notification._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`cursor-pointer rounded-2xl border transition ${notification.isRead ? 'border-slate-200 bg-white hover:bg-slate-50' : 'border-blue-200 bg-blue-50 hover:bg-blue-100'}`}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenNotification(notification)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleOpenNotification(notification)
                  }
                }}
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3 flex-1">
                    <span className="text-2xl">{notificationTypeIcons[notification.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <h3 className="font-semibold text-text">{notification.title}</h3>
                        <Badge
                          variant={notificationTypeBadges[notification.type] || 'slate'}
                          className="w-fit text-xs"
                        >
                          {notification.type.replace('-', ' ')}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="blue" className="w-fit text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{notification.message}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 self-start sm:self-center">
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification._id, notification.isRead)
                        }}
                        disabled={markAsReadMutation.isPending}
                      >
                        Mark read
                      </Button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification._id)
                      }}
                      disabled={deleteNotificationMutation.isPending}
                      className="text-xs text-slate-500 hover:text-rose-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

export default PatientNotificationsPage
