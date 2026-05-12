import rateLimit from 'express-rate-limit'

const isProduction = process.env.NODE_ENV === 'production'

const buildMessage = (label) => ({
  success: false,
  statusCode: 429,
  message: `Too many ${label} attempts. Please try again later.`,
})

export const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage('login'),
})

export const authRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: isProduction ? 5 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage('registration'),
})

export const authRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 60 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage('token refresh'),
})