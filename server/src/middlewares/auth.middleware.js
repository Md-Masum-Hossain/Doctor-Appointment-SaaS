import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization || ''

  if (!authorization.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401)
  }

  const token = authorization.split(' ')[1]
  let payload

  try {
    payload = verifyAccessToken(token)
  } catch {
    throw new AppError('Invalid or expired access token', 401)
  }

  const user = await User.findById(payload.sub)

  if (!user) {
    throw new AppError('User not found', 401)
  }

  if (user.isBlocked) {
    throw new AppError('Your account is blocked', 403)
  }

  req.user = user.toPublicJSON()
  return next()
})

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Unauthorized', 401))
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient permissions', 403))
  }

  return next()
}
