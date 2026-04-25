export const getRefreshCookieName = () => 'refreshToken'

export const getRefreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const maxAge = Number(process.env.REFRESH_COOKIE_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000)

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge,
    path: '/api/v1/auth',
  }
}
