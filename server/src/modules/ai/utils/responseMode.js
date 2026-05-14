import { AppError } from '../../../utils/AppError.js'
import { getRecommendedSpecializationFromSymptoms } from '../ai.symptoms.js'

const APPROVED_SPECIALIZATIONS = [
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

export const MEDICAL_INTENTS = new Set(['symptom_discussion', 'wellness_question', 'emergency_symptom'])

const sanitizeText = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => sanitizeText(item)).filter(Boolean).slice(0, 4)
}

export const isMedicalIntent = (intent) => MEDICAL_INTENTS.has(String(intent || '').trim())

export const normalizeMedicalInsights = (medicalInsights) => {
  if (!medicalInsights || typeof medicalInsights !== 'object' || Array.isArray(medicalInsights)) {
    return null
  }

  const recommendedSpecialization = sanitizeText(medicalInsights.recommendedSpecialization)
  const tips = normalizeStringArray(medicalInsights.tips)
  const possibleCauses = normalizeStringArray(medicalInsights.possibleCauses)
  const emergency = Boolean(medicalInsights.emergency)

  const validSpecialization = APPROVED_SPECIALIZATIONS.includes(recommendedSpecialization)
    ? recommendedSpecialization
    : ''

  if (!validSpecialization && !tips.length && !possibleCauses.length && !emergency) {
    return null
  }

  return {
    recommendedSpecialization: validSpecialization,
    possibleCauses,
    tips,
    emergency,
  }
}

export const normalizeAssistantResponse = (payload, fallbackIntent = 'casual_conversation', context = {}) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError('AI response payload has invalid structure', 502)
  }

  const reply = sanitizeText(payload.reply)
  const intent = sanitizeText(payload.intent) || fallbackIntent
  const userMessage = sanitizeText(context.userMessage)

  if (!reply) {
    throw new AppError('AI response is missing reply text', 502)
  }

  const normalizedResponse = {
    reply,
    intent,
    medicalInsights: null,
  }

  const medicalInsightsSource = payload.medicalInsights || {
    recommendedSpecialization: payload.recommendedSpecialization,
    possibleCauses: payload.possibleCauses,
    tips: payload.tips,
    emergency: payload.emergency,
  }

  if (isMedicalIntent(intent)) {
    const medicalInsights = normalizeMedicalInsights(medicalInsightsSource)

    if (medicalInsights) {
      normalizedResponse.medicalInsights = {
        recommendedSpecialization:
          medicalInsights.recommendedSpecialization || getRecommendedSpecializationFromSymptoms(userMessage),
        possibleCauses: medicalInsights.possibleCauses,
        tips: medicalInsights.tips,
        emergency: medicalInsights.emergency,
      }
      return normalizedResponse
    }

    normalizedResponse.medicalInsights = {
      recommendedSpecialization: getRecommendedSpecializationFromSymptoms(userMessage),
      possibleCauses: [],
      tips: [],
      emergency: false,
    }
  }

  return normalizedResponse
}
