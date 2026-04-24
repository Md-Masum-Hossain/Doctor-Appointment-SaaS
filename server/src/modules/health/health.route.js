import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'

const healthRouter = Router()

healthRouter.get(
  '/health',
  asyncHandler(async (req, res) => {
    const payload = {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    }

    res.status(200).json(new ApiResponse(200, 'Service is healthy', payload))
  }),
)

export default healthRouter
