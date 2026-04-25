import { Router } from 'express'
import {
  login,
  logout,
  me,
  refreshToken,
  register,
} from './auth.controller.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { loginSchema, registerSchema } from './auth.validation.js'
import { protect } from '../../middlewares/auth.middleware.js'

const authRouter = Router()

authRouter.post('/register', validateRequest(registerSchema), register)
authRouter.post('/login', validateRequest(loginSchema), login)
authRouter.post('/refresh-token', refreshToken)
authRouter.post('/logout', logout)
authRouter.get('/me', protect, me)

export default authRouter
