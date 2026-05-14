import { AppError } from '../../utils/AppError.js'
import { normalizeAssistantResponse } from './utils/responseMode.js'

const EMERGENCY_WARNING_TEXT =
  '⚠️ EMERGENCY ALERT: Your symptoms may indicate an urgent medical condition. Please seek immediate medical attention by calling emergency services or visiting the nearest emergency department.'

const emergencyKeywordPatterns = [
  // Critical symptoms
  /\bchest pain\b/i,
  /\bchest tightness\b/i,
  /\bpressure in chest\b/i,
  /\bcrushing chest pain\b/i,
  /\bbreathing difficulty\b/i,
  /\bbreathing problem\b/i,
  /\bshortness of breath\b/i,
  /\bcan't breathe\b/i,
  /\bunable to breathe\b/i,
  /\bsevere bleeding\b/i,
  /\bheavy bleeding\b/i,
  /\buncontrollable bleeding\b/i,
  /\bvomiting blood\b/i,
  /\bblack stool\b/i,
  /\bstroke\b/i,
  /\bone-sided weakness\b/i,
  /\bface drooping\b/i,
  /\bunconscious\b/i,
  /\bpassed out\b/i,
  /\bfainting\b/i,
  /\bseizure\b/i,
  /\bconvulsion\b/i,
  /\bsevere headache\b/i,
  /\bworst headache\b/i,
  /\bsuddenly blind\b/i,
  /\bsevere dizziness\b/i,
  /\bslurred speech\b/i,
  /\bfacial drooping\b/i,
  /\bsevere allergic\b/i,
  /\banaphylaxis\b/i,
  /\bswelling throat\b/i,
  /\bswollen lips\b/i,
  /\bchoking\b/i,
  /\bpoisoning\b/i,
  /\bbeing poisoned\b/i,
  /\bsevere burn\b/i,
  /\bsevere dehydration\b/i,
  /\bsevere pain\b/i,
  /\bintense pain\b/i,
]

const normalizeSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const sanitizeContent = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeRole = (role) => {
  const value = normalizeSearchText(role)

  if (value === 'assistant' || value === 'model') {
    return 'model'
  }

  return 'user'
}

export const normalizeConversationMessages = (messages) => {
  if (!Array.isArray(messages)) {
    return []
  }

  return messages
    .map((message) => {
      const role = normalizeRole(message?.role)
      const content = sanitizeContent(message?.content ?? message?.text)

      if (!content) {
        return null
      }

      return { role, content }
    })
    .filter(Boolean)
}

export const extractLatestUserMessage = (messages) => {
  const normalized = normalizeConversationMessages(messages)

  for (let index = normalized.length - 1; index >= 0; index -= 1) {
    if (normalized[index].role === 'user') {
      return normalized[index].content
    }
  }

  return normalized.at(-1)?.content || ''
}

export const buildGeminiHistory = (messages) => {
  const normalized = normalizeConversationMessages(messages)
  const latestUserIndex = normalized.map((message) => message.role).lastIndexOf('user')

  if (latestUserIndex <= 0) {
    return []
  }

  const priorMessages = normalized.slice(0, latestUserIndex)
  const history = []

  for (const message of priorMessages) {
    const role = message.role === 'model' ? 'model' : 'user'

    if (!history.length && role === 'model') {
      continue
    }

    const lastEntry = history[history.length - 1]

    if (lastEntry && lastEntry.role === role) {
      lastEntry.parts[0].text = `${lastEntry.parts[0].text}\n\n${message.content}`.trim()
      continue
    }

    history.push({
      role,
      parts: [{ text: message.content }],
    })
  }

  return history
}

export const composeConversationText = (messages) =>
  normalizeConversationMessages(messages)
    .map((message) => `${message.role === 'model' ? 'Assistant' : 'User'}: ${message.content}`)
    .join('\n')

export const detectEmergency = (messageOrMessages) => {
  const input = Array.isArray(messageOrMessages)
    ? composeConversationText(messageOrMessages)
    : String(messageOrMessages || '')

  return emergencyKeywordPatterns.some((pattern) => pattern.test(input))
}

export const prependEmergencyWarning = (reply, emergency) => {
  if (!emergency) return reply
  return `${EMERGENCY_WARNING_TEXT}\n\n${reply}`.trim()
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

  // Try direct parse first
  const parsed = safeJsonParse(rawText)
  if (parsed && typeof parsed === 'object' && 'reply' in parsed) {
    return parsed
  }

  // Try extracting JSON from markdown blocks
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    const extracted = safeJsonParse(codeBlockMatch[1])
    if (extracted && typeof extracted === 'object' && 'reply' in extracted) {
      return extracted
    }
  }

  // Try extracting JSON object pattern
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    const extracted = safeJsonParse(jsonMatch[0])
    if (extracted && typeof extracted === 'object' && 'reply' in extracted) {
      return extracted
    }
  }

  throw new AppError('Gemini returned invalid JSON payload', 502)
}

export const sanitizeGeminiResponse = (payload, fallbackIntent, context = {}) =>
  normalizeAssistantResponse(payload, fallbackIntent, context)
