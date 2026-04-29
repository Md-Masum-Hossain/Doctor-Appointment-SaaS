import { AppError } from './AppError.js'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const validateFileUpload = (fileFieldName = 'photo') => (req, res, next) => {
  if (!req.files || !req.files[fileFieldName]) {
    return next()
  }

  const file = req.files[fileFieldName]

  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new AppError(`Invalid file type. Allowed: JPEG, PNG, WebP`, 400)
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(`File size exceeds 5MB limit`, 400)
  }

  // Store file in request for later processing
  req.uploadedFile = {
    buffer: file.data,
    fileName: file.name,
    mimetype: file.mimetype,
  }

  next()
}
