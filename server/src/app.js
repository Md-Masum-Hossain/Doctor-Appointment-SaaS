import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import healthRouter from './modules/health/health.route.js'
import authRouter from './modules/auth/auth.route.js'
import doctorRouter from './modules/doctor/doctor.route.js'
import appointmentRouter from './modules/appointment/appointment.route.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

const app = express()

const clientUrls = (process.env.CLIENT_URL || '').split(',').map(u => u.trim()).filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g., Postman, curl)
      if (!origin) return callback(null, true)
      if (clientUrls.includes(origin)) return callback(null, true)
      return callback(new Error('CORS policy: This origin is not allowed'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/doctors', doctorRouter)
app.use('/api/v1/appointments', appointmentRouter)
app.use('/api/v1', healthRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
