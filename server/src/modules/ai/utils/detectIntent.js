import { detectEmergency, extractLatestUserMessage, normalizeConversationMessages } from '../ai.utils.js'
import { FOLLOW_UP_HINTS, INTENT_KEYWORDS } from './intentKeywords.js'
import { MEDICAL_INTENTS } from './responseMode.js'

const normalizeIntentText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s\u0980-\u09FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const hasKeywordMatch = (text, keyword) => {
  const normalizedText = normalizeIntentText(text)
  const normalizedKeyword = normalizeIntentText(keyword)

  if (!normalizedText || !normalizedKeyword) {
    return false
  }

  if (normalizedKeyword.includes(' ')) {
    return normalizedText.includes(normalizedKeyword)
  }

  return new RegExp(`(^|\\s)${escapeRegExp(normalizedKeyword)}(\\s|$)`, 'i').test(normalizedText)
}

const countKeywordHits = (text, keywords) => keywords.reduce((count, keyword) => count + (hasKeywordMatch(text, keyword) ? 1 : 0), 0)

const isFollowUpStyle = (text) => {
  const normalizedText = normalizeIntentText(text)

  if (!normalizedText) {
    return false
  }

  const wordCount = normalizedText.split(' ').filter(Boolean).length

  if (wordCount <= 3 && FOLLOW_UP_HINTS.some((hint) => hasKeywordMatch(normalizedText, hint))) {
    return true
  }

  return FOLLOW_UP_HINTS.some((hint) => hasKeywordMatch(normalizedText, hint))
}

const getContextIntent = (messages) => {
  const normalizedMessages = normalizeConversationMessages(messages)
  const priorUserMessages = normalizedMessages.filter((message) => message.role === 'user')

  if (!priorUserMessages.length) {
    return null
  }

  const priorText = priorUserMessages.slice(0, -1).map((message) => message.content).join(' ')

  if (countKeywordHits(priorText, INTENT_KEYWORDS.symptomDiscussion) > 0) {
    return 'symptom_discussion'
  }

  if (countKeywordHits(priorText, INTENT_KEYWORDS.wellnessQuestion) > 0) {
    return 'wellness_question'
  }

  return null
}

const detectLatestIntent = (latestUserMessage) => {
  const normalized = normalizeIntentText(latestUserMessage)

  if (!normalized) {
    return 'casual_conversation'
  }

  if (detectEmergency(normalized)) {
    return 'emergency_symptom'
  }

  if (countKeywordHits(normalized, INTENT_KEYWORDS.languageRequest) > 0) {
    return 'language_request'
  }

  if (countKeywordHits(normalized, INTENT_KEYWORDS.gratitude) > 0) {
    return 'gratitude'
  }

  if (countKeywordHits(normalized, INTENT_KEYWORDS.goodbye) > 0) {
    return 'goodbye'
  }

  if (countKeywordHits(normalized, INTENT_KEYWORDS.symptomDiscussion) > 0) {
    return 'symptom_discussion'
  }

  if (countKeywordHits(normalized, INTENT_KEYWORDS.wellnessQuestion) > 0) {
    return 'wellness_question'
  }

  if (countKeywordHits(normalized, INTENT_KEYWORDS.greeting) > 0) {
    const wordCount = normalized.split(' ').filter(Boolean).length

    if (wordCount <= 5) {
      return 'greeting'
    }
  }

  if (countKeywordHits(normalized, INTENT_KEYWORDS.casualConversation) > 0) {
    return 'casual_conversation'
  }

  return 'casual_conversation'
}

export const detectIntent = (input) => {
  if (typeof input === 'string') {
    const latestUserMessage = input.trim()
    const intent = detectLatestIntent(latestUserMessage)

    return {
      intent,
      showMedicalUI: MEDICAL_INTENTS.has(intent),
      latestUserMessage,
      matchedContextIntent: null,
    }
  }

  const payload = input && typeof input === 'object' ? input : {}
  const normalizedMessages = normalizeConversationMessages(payload.messages)
  const latestUserMessage = extractLatestUserMessage(normalizedMessages) || String(payload.message || payload.latestUserMessage || '').trim()
  const latestIntent = detectLatestIntent(latestUserMessage)
  const contextIntent = isFollowUpStyle(latestUserMessage) ? getContextIntent(normalizedMessages) : null
  const resolvedIntent = contextIntent || latestIntent

  return {
    intent: resolvedIntent,
    showMedicalUI: MEDICAL_INTENTS.has(resolvedIntent),
    latestUserMessage,
    matchedContextIntent: contextIntent,
  }
}
