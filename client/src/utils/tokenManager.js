let accessToken = null
let onUnauthorized = null

export const getAccessToken = () => accessToken

export const setAccessToken = (token) => {
  accessToken = token || null
}

export const clearAccessToken = () => {
  accessToken = null
}

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

export const notifyUnauthorized = () => {
  if (typeof onUnauthorized === 'function') {
    onUnauthorized()
  }
}
