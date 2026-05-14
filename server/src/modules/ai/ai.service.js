import { GoogleGenerativeAI } from '@google/generative-ai'
import { AppError } from '../../utils/AppError.js'
import { buildAiSystemPrompt } from './ai.prompt.js'
import { detectIntent } from './utils/detectIntent.js'
import {
  detectEmergency,
  ensureValidAiPayload,
  extractLatestUserMessage,
  buildGeminiHistory,
  normalizeConversationMessages,
  parseGeminiJsonResponse,
  prependEmergencyWarning,
  withTimeout,
  generateFallbackResponse,
} from './ai.utils.js'
import {
  buildEmergencyResponse,
  buildMedicalResponse,
  buildNonMedicalResponse,
} from './utils/responseMode.js'

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 15000)
const GEMINI_TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE || 0.7)

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new AppError('Gemini API key is not configured', 500)
  }

  const client = new GoogleGenerativeAI(apiKey)
  return client.getGenerativeModel({ model: GEMINI_MODEL })
}

const normalizeRequestPayload = (input) => {
  if (typeof input === 'string') {
    return {
      messages: [{ role: 'user', content: input.trim() }],
      latestUserMessage: input.trim(),
    }
  }

  const payload = input && typeof input === 'object' ? input : {}
  const normalizedMessages = normalizeConversationMessages(payload.messages)
  const latestUserMessage = extractLatestUserMessage(normalizedMessages) || String(payload.message || '').trim()

  const messages = normalizedMessages.length
    ? normalizedMessages
    : latestUserMessage
      ? [{ role: 'user', content: latestUserMessage }]
      : []

  return {
    messages,
    latestUserMessage,
  }
}

const buildGenerationConfig = () => ({
  temperature: GEMINI_TEMPERATURE,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 700,
})

const buildFallbackMedicalResponse = (latestUserMessage, intent, emergencyDetected) => {
  const fallback = generateFallbackResponse(latestUserMessage)

  if (intent === 'emergency_symptom' || emergencyDetected) {
    return buildEmergencyResponse({
      intent,
      reply: prependEmergencyWarning(fallback.reply, true),
      recommendedSpecialization: fallback.recommendedSpecialization,
      tips: fallback.tips,
      possibleCauses: fallback.possibleCauses,
    })
  }

  return buildMedicalResponse({
    intent,
    reply: prependEmergencyWarning(fallback.reply, emergencyDetected),
    recommendedSpecialization: fallback.recommendedSpecialization,
    emergency: emergencyDetected || fallback.emergency,
    tips: fallback.tips,
    possibleCauses: fallback.possibleCauses,
  })
}

export const aiService = {
  async generateChatResponse(input) {
    const { messages, latestUserMessage } = normalizeRequestPayload(input)
    const intentDetection = detectIntent({ messages, message: latestUserMessage })
    const intent = intentDetection.intent
    const showMedicalUI = intentDetection.showMedicalUI

    if (!latestUserMessage) {
      throw new AppError('Message cannot be empty', 400)
    }

    if (!showMedicalUI) {
      return buildNonMedicalResponse(intent)
    }

    const userOnlyConversation = messages.filter((message) => message.role === 'user').map((message) => message.content)
    const emergencyDetected = detectEmergency(userOnlyConversation.length ? userOnlyConversation.join(' ') : latestUserMessage)

    if (intent === 'emergency_symptom' || emergencyDetected) {
      return buildFallbackMedicalResponse(latestUserMessage, 'emergency_symptom', true)
    }

    let rawText
    try {
      const model = getGeminiModel()
      const history = buildGeminiHistory(messages)
      const systemInstruction = buildAiSystemPrompt({ intent, showMedicalUI })

      const chat = model.startChat({
        history,
        systemInstruction,
        generationConfig: buildGenerationConfig(),
      })

      const result = await withTimeout(
        chat.sendMessage(latestUserMessage),
        GEMINI_TIMEOUT_MS,
        'Gemini request timed out',
      )

      rawText = result.response?.text?.()
    } catch (error) {
      return buildFallbackMedicalResponse(latestUserMessage, intent, emergencyDetected)
    }

    if (!rawText) {
      return buildFallbackMedicalResponse(latestUserMessage, intent, emergencyDetected)
    }

    let parsed
    try {
      parsed = parseGeminiJsonResponse(rawText)
    } catch {
      return buildFallbackMedicalResponse(latestUserMessage, intent, emergencyDetected)
    }

    const sanitized = ensureValidAiPayload(parsed)

    return buildMedicalResponse({
      intent,
      reply: prependEmergencyWarning(sanitized.reply, emergencyDetected),
      recommendedSpecialization: sanitized.recommendedSpecialization,
      emergency: emergencyDetected || sanitized.emergency,
      tips: sanitized.tips,
      possibleCauses: sanitized.possibleCauses,
    })
  },
}