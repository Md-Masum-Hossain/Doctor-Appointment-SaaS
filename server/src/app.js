import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import healthRouter from './modules/health/health.route.js'
import authRouter from './modules/auth/auth.route.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1', healthRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
