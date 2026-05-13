import { asyncHandler } from '../../utils/asyncHandler.js'
import { aiService } from './ai.service.js'

export const chatWithAi = asyncHandler(async (req, res) => {
  const { message } = req.validated.body
  const result = await aiService.generateChatResponse(message)

  res.status(200).json({
    success: true,
    message: 'AI response generated successfully',
    data: result,
  })
})