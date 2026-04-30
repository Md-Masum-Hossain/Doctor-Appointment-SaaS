import { Router } from 'express'
import { protect, authorizeRoles } from '../../middlewares/auth.middleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  getAllUsers,
  getUserById,
  deleteUser,
  blockUser,
} from './user.controller.js'
import {
  getAllUsersSchema,
  userIdParamSchema,
  blockUserSchema,
} from './user.validation.js'

const userRouter = Router()

// All user management routes require admin authorization
userRouter.use(protect, authorizeRoles('admin'))

userRouter.get('/', validateRequest(getAllUsersSchema), getAllUsers)
userRouter.get('/:id', validateRequest(userIdParamSchema), getUserById)
userRouter.delete('/:id', validateRequest(userIdParamSchema), deleteUser)
userRouter.patch('/:id/block', validateRequest(blockUserSchema), blockUser)

export default userRouter
