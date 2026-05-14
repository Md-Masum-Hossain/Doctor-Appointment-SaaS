import { AppError } from '../../utils/AppError.js'
import { getRecommendedSpecializationFromSymptoms } from './ai.symptoms.js'

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

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => sanitizeContent(item))
    .filter(Boolean)
    .slice(0, 4)
}

const buildFallbackGuidance = (userMessage, specialization) => {
  const normalizedMessage = normalizeSearchText(userMessage)

  if (detectEmergency(userMessage)) {
    return {
      reply:
        'What you described could be urgent. Please seek immediate medical attention right away and do not wait for it to improve on its own.',
      tips: ['Call emergency services now.', 'Avoid driving yourself if you feel unwell.', 'Stay with someone if possible.', 'Do not delay urgent care.'],
      possibleCauses: ['a potentially urgent medical condition'],
    }
  }

  if (/\b(sleep|insomnia|sleeping|rest)\b/i.test(normalizedMessage)) {
    return {
      reply:
        'Sleep problems often improve with a steadier bedtime, less screen time before bed, and a calmer evening routine. If it keeps happening, it is worth discussing with a doctor because stress, habits, and medical issues can all play a role.',
      tips: ['Keep a fixed bedtime.', 'Avoid caffeine later in the day.', 'Dim screens before sleep.', 'Use a calm bedtime routine.'],
      possibleCauses: ['stress or anxiety', 'irregular sleep routine', 'late caffeine use', 'poor sleep environment'],
    }
  }

  if (/\b(stress|anxiety|worried|panic|tense)\b/i.test(normalizedMessage)) {
    return {
      reply:
        'Stress or anxiety can feel heavy, but it is often manageable with gentle steps. Slow breathing, short breaks, better sleep, and talking to a professional can help if it is affecting your daily life.',
      tips: ['Try slow breathing for a few minutes.', 'Limit caffeine if it worsens symptoms.', 'Take short breaks during the day.', 'Talk to a mental health professional if it continues.'],
      possibleCauses: ['stress overload', 'poor sleep', 'ongoing anxiety', 'life pressure or burnout'],
    }
  }

  if (/\b(hydration|dehydration|water|thirst)\b/i.test(normalizedMessage)) {
    return {
      reply:
        'Staying hydrated usually supports energy, focus, and recovery. Try sipping water throughout the day instead of waiting until you feel very thirsty.',
      tips: ['Drink small amounts regularly.', 'Increase fluids during heat or illness.', 'Watch for dark urine or dizziness.', 'Seek care if dehydration feels severe.'],
      possibleCauses: ['not drinking enough fluids', 'hot weather', 'high activity level', 'illness-related fluid loss'],
    }
  }

  if (/\b(food|nutrition|diet|eat|appetite)\b/i.test(normalizedMessage)) {
    return {
      reply:
        'Balanced meals can support recovery and general wellness. If appetite is low, small frequent meals and lighter foods may be easier to tolerate.',
      tips: ['Choose simple balanced meals.', 'Eat smaller portions more often.', 'Stay hydrated with meals.', 'See a doctor if appetite loss persists.'],
      possibleCauses: ['irregular meals', 'low appetite from illness', 'stress', 'digestive upset'],
    }
  }

  return {
    reply: `Thank you for sharing that. Based on what you described, ${specialization} is the most relevant specialty to consider. I would focus on rest, hydration, and close symptom monitoring for now, and I would encourage you to speak with a healthcare professional if this is persistent, worsening, or unusual for you.`,
    tips: ['Rest and avoid overexertion.', 'Drink enough fluids.', 'Track whether symptoms change or spread.', 'Seek medical care if symptoms worsen.'],
    possibleCauses: ['a mild or temporary irritation', 'an infection or inflammation', 'stress or fatigue', 'a condition that needs medical evaluation'],
  }
}

export const ensureValidAiPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError('AI response payload has invalid structure', 502)
  }

  const reply = String(payload.reply || '').trim()
  const recommendedSpecialization = String(payload.recommendedSpecialization || '').trim() || 'General Medicine'
  const tips = normalizeStringArray(payload.tips)
  const possibleCauses = normalizeStringArray(payload.possibleCauses)

  if (!reply) {
    throw new AppError('AI response is missing reply text', 502)
  }

  // Validate specialization is reasonable
  const validSpecializations = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Dentistry',
    'Ophthalmology',
    'Psychiatry',
    'Orthopedics',
    'Neurology',
    'Gastroenterology',
    'Pulmonology',
    'ENT',
    'Gynecology',
    'Internal Medicine',
    'Pediatrics',
    'Urology',
  ]

  const finalSpec = validSpecializations.includes(recommendedSpecialization)
    ? recommendedSpecialization
    : 'General Medicine'

  return {
    reply,
    recommendedSpecialization: finalSpec,
    emergency: Boolean(payload.emergency),
    tips,
    possibleCauses,
  }
}

export const generateFallbackResponse = (userMessage) => {
  const specialization = getRecommendedSpecializationFromSymptoms(userMessage)
  const guidance = buildFallbackGuidance(userMessage, specialization)

  return {
    reply: guidance.reply,
    intent: 'symptom_discussion',
    showMedicalUI: true,
    recommendedSpecialization: specialization,
    emergency: false,
    tips: guidance.tips,
    possibleCauses: guidance.possibleCauses,
  }
}
