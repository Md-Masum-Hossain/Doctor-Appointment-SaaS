import { GoogleGenerativeAI } from '@google/generative-ai'
import { AppError } from '../../utils/AppError.js'
import { AI_SYSTEM_PROMPT } from './ai.prompt.js'
import {
  detectEmergency,
  ensureValidAiPayload,
  parseGeminiJsonResponse,
  prependEmergencyWarning,
  withTimeout,
} from './ai.utils.js'

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 15000)

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new AppError('Gemini API key is not configured', 500)
  }

  const client = new GoogleGenerativeAI(apiKey)
  return client.getGenerativeModel({ model: GEMINI_MODEL })
}

const buildGeminiPrompt = (message) => `${AI_SYSTEM_PROMPT}\n\nUser message: ${message}`

export const aiService = {
  async generateChatResponse(message) {
    const emergencyDetected = detectEmergency(message)
    const model = getGeminiModel()

    let rawText
    try {
      const result = await withTimeout(
        model.generateContent({
          contents: [{ role: 'user', parts: [{ text: buildGeminiPrompt(message) }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
        GEMINI_TIMEOUT_MS,
        'Gemini request timed out',
      )

      rawText = result.response?.text?.()
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      throw new AppError('Failed to generate AI response', 502)
    }

    const parsed = parseGeminiJsonResponse(rawText)
    const sanitized = ensureValidAiPayload(parsed)

    return {
      reply: prependEmergencyWarning(sanitized.reply, emergencyDetected),
      recommendedSpecialization: sanitized.recommendedSpecialization,
      emergency: emergencyDetected,
    }
  },
}