import { AppError } from '../../utils/AppError.js'

const EMERGENCY_WARNING_TEXT =
  'Emergency warning: Your symptoms may indicate an urgent condition. Please contact local emergency services or go to the nearest emergency department immediately. '

const emergencyKeywordPatterns = [
  /\bchest pain\b/i,
  /\bbreathing difficulty\b/i,
  /\bsevere bleeding\b/i,
  /\bstroke\b/i,
  /\bunconscious\b/i,
  /\bseizure\b/i,
]

export const detectEmergency = (message) => {
  const input = String(message || '')
  return emergencyKeywordPatterns.some((pattern) => pattern.test(input))
}

export const prependEmergencyWarning = (reply, emergency) => {
  if (!emergency) return reply
  return `${EMERGENCY_WARNING_TEXT}${reply}`.trim()
}

export const withTimeout = async (promise, timeoutMs, timeoutMessage) => {
  let timeoutId
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new AppError(timeoutMessage, 504))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    clearTimeout(timeoutId)
  }
}

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export const parseGeminiJsonResponse = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new AppError('Gemini returned an empty response', 502)
  }

  const parsed = safeJsonParse(rawText)
  if (parsed) {
    return parsed
  }

  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new AppError('Gemini returned malformed JSON', 502)
  }

  const extracted = safeJsonParse(jsonMatch[0])
  if (!extracted) {
    throw new AppError('Gemini returned invalid JSON payload', 502)
  }

  return extracted
}

export const ensureValidAiPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError('AI response payload has invalid structure', 502)
  }

  const reply = String(payload.reply || '').trim()
  const recommendedSpecialization = String(payload.recommendedSpecialization || '').trim() || 'General Medicine'

  if (!reply) {
    throw new AppError('AI response is missing reply text', 502)
  }

  return {
    reply,
    recommendedSpecialization,
    emergency: Boolean(payload.emergency),
  }
}
