import { Router } from 'express'
import { protect } from '../../middlewares/auth.middleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from './notification.controller.js'
import {
  getNotificationsSchema,
  notificationIdParamSchema,
  markAsReadSchema,
  markAllAsReadSchema,
} from './notification.validation.js'

const notificationRouter = Router()

notificationRouter.use(protect)

notificationRouter.get('/', validateRequest(getNotificationsSchema), getNotifications)
notificationRouter.get('/unread/count', getUnreadCount)
notificationRouter.patch('/:id/read', validateRequest(markAsReadSchema), markAsRead)
notificationRouter.patch('/read-all', validateRequest(markAllAsReadSchema), markAllAsRead)
notificationRouter.delete('/:id', validateRequest(notificationIdParamSchema), deleteNotification)

export default notificationRouter
