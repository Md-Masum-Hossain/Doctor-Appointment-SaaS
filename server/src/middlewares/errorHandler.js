export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.originalUrl}`,
  })
}

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'

  if (err.name === 'ValidationError') {
    statusCode = 400
  }

  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid resource identifier'
  }

  if (err.code === 11000) {
    statusCode = 409
    const duplicateField = Object.keys(err.keyValue || {})[0]
    message = duplicateField
      ? `${duplicateField} already exists`
      : 'Duplicate resource'
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Invalid or expired token'
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
}
