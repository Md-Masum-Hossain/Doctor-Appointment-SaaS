import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import healthRouter from './modules/health/health.route.js'
import authRouter from './modules/auth/auth.route.js'
import doctorRouter from './modules/doctor/doctor.route.js'
import appointmentRouter from './modules/appointment/appointment.route.js'
import userRouter from './modules/user/user.route.js'
import paymentRouter from './modules/payment/payment.route.js'
import reviewRouter from './modules/review/review.route.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { validateFileUpload } from './utils/fileUpload.js'

const app = express()

const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean)

const isAllowedClientOrigin = (origin) => {
  if (clientUrls.includes(origin)) {
    return true
  }

  if (process.env.NODE_ENV === 'development') {
    return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
  }

  return false
}

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g., Postman, curl)
      if (!origin) return callback(null, true)
      if (isAllowedClientOrigin(origin)) return callback(null, true)
      return callback(new Error('CORS policy: This origin is not allowed'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } })) // 5MB limit

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/doctors', doctorRouter)
app.use('/api/v1/appointments', appointmentRouter)
app.use('/api/v1/payments', paymentRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1', healthRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
