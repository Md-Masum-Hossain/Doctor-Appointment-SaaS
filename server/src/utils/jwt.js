import jwt from 'jsonwebtoken'

const getEnvSecret = (name, fallback) => {
  const value = process.env[name] || fallback

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

const accessTokenSecret = () => getEnvSecret('JWT_ACCESS_SECRET', process.env.NODE_ENV === 'development' ? 'dev-access-secret' : '')
const refreshTokenSecret = () =>
  getEnvSecret('JWT_REFRESH_SECRET', process.env.NODE_ENV === 'development' ? 'dev-refresh-secret' : '')

export const signAccessToken = (payload) => {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  return jwt.sign(payload, accessTokenSecret(), { expiresIn })
}

export const signRefreshToken = (payload) => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  return jwt.sign(payload, refreshTokenSecret(), { expiresIn })
}

export const verifyAccessToken = (token) => jwt.verify(token, accessTokenSecret())

export const verifyRefreshToken = (token) => jwt.verify(token, refreshTokenSecret())
