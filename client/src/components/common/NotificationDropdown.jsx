import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationsQuery, useMarkAsReadMutation, useDeleteNotificationMutation, useUnreadCountQuery } from '../../hooks/useNotificationsQuery'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import LoadingSkeleton from '../ui/LoadingSkeleton'

const notificationTypeIcons = {
  'appointment-booked': '📅',
  'appointment-accepted': '✅',
  'appointment-cancelled': '❌',
  'payment-verified': '💳',
  'doctor-verified': '🏥',
  'review-submitted': '⭐',
}

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { data: unreadData, isLoading: unreadLoading } = useUnreadCountQuery()
  const { data: notificationsData, isLoading, isError, error } = useNotificationsQuery({ page: 1, limit: 5, sortOrder: 'desc' })
  const markAsReadMutation = useMarkAsReadMutation()
  const deleteNotificationMutation = useDeleteNotificationMutation()

  const unreadCount = unreadData?.unreadCount || 0
  const notifications = notificationsData?.items || []

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = (e, notificationId) => {
    e.preventDefault()
    markAsReadMutation.mutate(notificationId)
  }

  const handleDelete = (e, notificationId) => {
    e.preventDefault()
    deleteNotificationMutation.mutate(notificationId)
  }

  const getNotificationColor = (type) => {
    const colors = {
      'appointment-booked': 'text-blue-600',
      'appointment-accepted': 'text-green-600',
      'appointment-cancelled': 'text-red-600',
      'payment-verified': 'text-emerald-600',
      'doctor-verified': 'text-purple-600',
      'review-submitted': 'text-amber-600',
    }
    return colors[type] || 'text-slate-600'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-12 w-96 max-w-full rounded-2xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text">Notifications</h3>
                <Link to="/notifications">
                  <Button size="sm" variant="ghost">
                    View all
                  </Button>
                </Link>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2 px-4 py-4">
                  <LoadingSkeleton rows={3} />
                </div>
              ) : isError ? (
                <div className="px-4 py-4">
                  <p className="text-sm text-rose-600">{error?.response?.data?.message || 'Failed to load notifications'}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-6">
                  <EmptyState
                    title="No notifications"
                    description="You're all caught up!"
                    size="sm"
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`px-4 py-3 transition ${notification.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50 hover:bg-blue-100'}`}
                    >
                      <div className="flex gap-3">
                        <span className="text-lg">{notificationTypeIcons[notification.type] || '🔔'}</span>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${getNotificationColor(notification.type)}`}>
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, notification._id)}
                            className="text-xs font-semibold text-primary hover:text-primary/80"
                          >
                            Mark
                          </button>
                        )}
                      </div>
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={(e) => handleDelete(e, notification._id)}
                          className="text-xs text-slate-500 hover:text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-4 py-2">
              <Link to="/notifications">
                <Button size="sm" variant="ghost" className="w-full">
                  View all notifications
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationDropdown
