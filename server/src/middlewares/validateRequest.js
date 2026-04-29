const normalizeMultipartValue = (value) => {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (!trimmed) return value

  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return value

  try {
    return JSON.parse(trimmed)
  } catch {
    return value
  }
}

export const validateRequest = (schema) => (req, res, next) => {
  const isMultipart = String(req.headers['content-type'] || '').includes('multipart/form-data')
  const body = isMultipart && req.body && typeof req.body === 'object'
    ? Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [key, normalizeMultipartValue(value)]),
    )
    : req.body

  const result = schema.safeParse({
    body,
    params: req.params,
    query: req.query,
  })

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))

    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation failed',
      errors: issues,
    })
  }

  req.validated = result.data
  return next()
}
