import { asyncHandler } from '../../utils/asyncHandler.js'
import { aiService } from './ai.service.js'

export const chatWithAi = asyncHandler(async (req, res) => {
  const result = await aiService.generateChatResponse(req.validated.body)

  res.status(200).json({
    success: true,
    message: 'AI response generated successfully',
    data: result,
  })
})