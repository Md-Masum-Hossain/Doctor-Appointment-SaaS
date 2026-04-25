import User from '../../models/User.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { AppError } from '../../utils/AppError.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js'
import {
  getRefreshCookieName,
  getRefreshTokenCookieOptions,
} from '../../utils/cookies.js'

const buildTokenPayload = (user) => ({
  sub: user._id.toString(),
  role: user.role,
})

const buildAuthResponse = (user, accessToken) =>
  new ApiResponse(200, 'Authentication successful', {
    user: user.toPublicJSON(),
    accessToken,
  })

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(
    getRefreshCookieName(),
    refreshToken,
    getRefreshTokenCookieOptions(),
  )
}

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(getRefreshCookieName(), {
    ...getRefreshTokenCookieOptions(),
    maxAge: undefined,
  })
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, avatar } = req.validated.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new AppError('Email is already in use', 409)
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'patient',
    avatar: avatar || '',
  })

  const payload = buildTokenPayload(user)
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  user.refreshToken = refreshToken
  await user.save()

  setRefreshTokenCookie(res, refreshToken)

  res.status(201).json(
    new ApiResponse(201, 'Registration successful', {
      user: user.toPublicJSON(),
      accessToken,
    }),
  )
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body

  const user = await User.findOne({ email }).select('+password +refreshToken')

  if (!user) {
    throw new AppError('Invalid credentials', 401)
  }

  if (user.isBlocked) {
    throw new AppError('Your account is blocked', 403)
  }

  const isPasswordMatch = await user.comparePassword(password)
  if (!isPasswordMatch) {
    throw new AppError('Invalid credentials', 401)
  }

  const payload = buildTokenPayload(user)
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  user.refreshToken = refreshToken
  await user.save()

  setRefreshTokenCookie(res, refreshToken)

  res.status(200).json(buildAuthResponse(user, accessToken))
})

export const refreshToken = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies[getRefreshCookieName()]

  if (!tokenFromCookie) {
    throw new AppError('Refresh token is missing', 401)
  }

  let payload
  try {
    payload = verifyRefreshToken(tokenFromCookie)
  } catch {
    throw new AppError('Invalid or expired refresh token', 401)
  }

  const user = await User.findById(payload.sub).select('+refreshToken')

  if (!user || !user.refreshToken || user.refreshToken !== tokenFromCookie) {
    throw new AppError('Refresh token is invalid', 401)
  }

  if (user.isBlocked) {
    throw new AppError('Your account is blocked', 403)
  }

  const nextPayload = buildTokenPayload(user)
  const newAccessToken = signAccessToken(nextPayload)
  const newRefreshToken = signRefreshToken(nextPayload)

  user.refreshToken = newRefreshToken
  await user.save()

  setRefreshTokenCookie(res, newRefreshToken)

  res.status(200).json(buildAuthResponse(user, newAccessToken))
})

export const logout = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies[getRefreshCookieName()]

  if (tokenFromCookie) {
    const user = await User.findOne({ refreshToken: tokenFromCookie }).select('+refreshToken')
    if (user) {
      user.refreshToken = null
      await user.save()
    }
  }

  clearRefreshTokenCookie(res)

  res.status(200).json(new ApiResponse(200, 'Logout successful'))
})

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.status(200).json(new ApiResponse(200, 'Current user fetched', user.toPublicJSON()))
})
