export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.originalUrl}`,
  })
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
}
