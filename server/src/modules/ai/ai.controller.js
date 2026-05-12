import { ApiResponse } from '../../utils/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { aiService } from './ai.service.js'

export const getSymptomRecommendation = asyncHandler(async (req, res) => {
  const { symptoms } = req.validated.body
  const result = await aiService.getSymptomRecommendation(symptoms)

  res.status(200).json(new ApiResponse(200, 'Symptom recommendation generated successfully', result))
})