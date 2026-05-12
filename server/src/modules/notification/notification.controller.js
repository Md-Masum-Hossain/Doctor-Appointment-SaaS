import { ApiResponse } from '../../utils/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as notificationService from './notification.service.js'

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(req.user._id, req.query)

  res.status(200).json(new ApiResponse(200, 'Notifications fetched successfully', result))
})

export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await notificationService.getUnreadCount(req.user._id)

  res.status(200).json(new ApiResponse(200, 'Unread count fetched successfully', { unreadCount }))
})

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.validated.params
  const notification = await notificationService.markAsRead(id, req.user._id)

  res.status(200).json(new ApiResponse(200, 'Notification marked as read', notification))
})

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id)

  res.status(200).json(new ApiResponse(200, 'All notifications marked as read', result))
})

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.validated.params
  const notification = await notificationService.deleteNotification(id, req.user._id)

  res.status(200).json(new ApiResponse(200, 'Notification deleted successfully', notification))
})
