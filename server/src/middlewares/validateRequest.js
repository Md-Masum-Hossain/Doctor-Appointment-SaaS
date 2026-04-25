export const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
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
