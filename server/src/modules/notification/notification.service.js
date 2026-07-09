import Notification from '../../models/Notification.js'
import { AppError } from '../../utils/AppError.js'

const notificationPopulate = [
  {
    path: 'recipient',
    select: 'name email phone avatar role',
  },
  {
    path: 'relatedResource.resourceId',
    select: 'appointmentDate timeSlot status paymentStatus transactionId paymentAmount',
  },
]

const buildSort = (sortOrder) => ({
  createdAt: sortOrder === 'asc' ? 1 : -1,
})

/**
 * Create notification helper - reusable across modules
 * @param {Object} data - { recipientId, type, title, message, relatedResource, session }
 */
export const createNotification = async (data) => {
  const { recipientId, type, title, message, relatedResource = null, session = null } = data

  const notification = new Notification({
    recipient: recipientId,
    type,
    title,
    message,
    isRead: false,
    ...(relatedResource ? { relatedResource } : {}),
  })

  if (session) {
    await notification.save({ session })
  } else {
    await notification.save()
  }

  return notification
}

/**
 * Get user notifications with pagination
 */
export const getNotifications = async (userId, query) => {
  const page = query.page || 1
  const limit = query.limit || 10
  const skip = (page - 1) * limit
  const sort = buildSort(query.sortOrder || 'desc')

  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .populate(notificationPopulate)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ recipient: userId }),
  ])

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  })

  return {
    items: notifications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    unreadCount,
  }
}

/**
 * Get unread count for a user
 */
export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  })
}

/**
 * Mark single notification as read
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId)

  if (!notification) {
    throw new AppError('Notification not found', 404)
  }

  if (notification.recipient.toString() !== userId.toString()) {
    throw new AppError('Unauthorized to update this notification', 403)
  }

  notification.isRead = true
  await notification.save()

  await notification.populate(notificationPopulate)
  return notification
}

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } },
  )

  return {
    modifiedCount: result.modifiedCount,
  }
}

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId)

  if (!notification) {
    throw new AppError('Notification not found', 404)
  }

  if (notification.recipient.toString() !== userId.toString()) {
    throw new AppError('Unauthorized to delete this notification', 403)
  }

  await Notification.findByIdAndDelete(notificationId)

  return notification
}

