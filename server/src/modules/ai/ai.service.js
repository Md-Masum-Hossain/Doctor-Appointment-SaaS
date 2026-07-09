import { GoogleGenerativeAI } from '@google/generative-ai'
import { AppError } from '../../utils/AppError.js'
import { buildAiSystemPrompt } from './ai.prompt.js'
import { detectIntent } from './utils/detectIntent.js'
import {
  detectEmergency,
  extractLatestUserMessage,
  normalizeConversationMessages,
  parseGeminiJsonResponse,
  withTimeout,
  sanitizeGeminiResponse,
  composeConversationText,
} from './ai.utils.js'
import { generateFollowUpQuestions, formatFollowUpQuestions } from './utils/followUpQuestions.js'

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
const GEMINI_MODEL_CANDIDATES = Array.from(
  new Set([
    process.env.GEMINI_MODEL,
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
  ].filter(Boolean)),
)
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 15000)
const GEMINI_TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE || 0.7)

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new AppError('Gemini API key is not configured', 500)
  }

  const client = new GoogleGenerativeAI(apiKey)
  return {
    getModel: (modelName) => client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: GEMINI_TEMPERATURE,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 900,
      },
    }),
  }
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

const buildConversationPrompt = ({ intent, emergencyDetected, messages, latestUserMessage }) => {
  const systemPrompt = buildAiSystemPrompt({ intent, emergencyDetected })
  const conversationText = composeConversationText(messages)

  return `${systemPrompt}

CONVERSATION TRANSCRIPT:
${conversationText || `User: ${latestUserMessage}`}

LATEST USER MESSAGE:
${latestUserMessage}

Return only valid JSON.`
}

const buildConversationalFallbackResponse = ({ intent, latestUserMessage, emergencyDetected }) => {
  const isMedicalIntent = ['symptom_discussion', 'wellness_question', 'emergency_symptom'].includes(intent)
  const lowerMessage = String(latestUserMessage || '').toLowerCase()

  let safeReply = "I'm here with you. Tell me more about what's going on, and I'll do my best to help."

  // Emergency handling - stay calm but direct
  if (emergencyDetected || /\b(chest pain|shortness of breath|breathing difficulty|fainting|seizure|stroke|slurred speech|face drooping|anaphylaxis|swollen lips|swelling throat)\b/i.test(lowerMessage)) {
    safeReply = 'Your symptoms need urgent medical attention right now. Please call emergency services or get to the nearest emergency department immediately. They can properly evaluate and help you.'
  }
  // Greeting
  else if (intent === 'greeting') {
    const greetings = [
      'Hi there! 👋 How can I help you today?',
      'Hello! What brings you in today?',
      'Hey! What can I do for you?',
      "Hi! What's on your mind?",
    ]
    safeReply = greetings[Math.floor(Math.random() * greetings.length)]
  }
  // Gratitude
  else if (intent === 'gratitude') {
    const responses = [
      'Happy to help! Take care of yourself.',
      "You're welcome! Feel free to reach out anytime.",
      'My pleasure! Wishing you well.',
      "You're welcome 😊 Let me know if you need anything else.",
    ]
    safeReply = responses[Math.floor(Math.random() * responses.length)]
  }
  // Goodbye
  else if (intent === 'goodbye') {
    const responses = [
      "Take care! I'm here whenever you need me.",
      'Goodbye! Stay well.',
      'See you later! Take good care.',
      'All the best! Feel free to come back anytime.',
    ]
    safeReply = responses[Math.floor(Math.random() * responses.length)]
  }
  // Language request
  else if (intent === 'language_request') {
    safeReply = 'নিশ্চিত! 😊 আপনি চাইলে বাংলায় কথা বলতে পারেন। আপনাকে কীভাবে সাহায্য করতে পারি?'
  }
  // Casual conversation
  else if (intent === 'casual_conversation') {
    const responses = [
      "That's interesting! Tell me more.",
      'I see. What else would you like to share?',
      'Got it. How can I help with that?',
      'Interesting. What else is on your mind?',
    ]
    safeReply = responses[Math.floor(Math.random() * responses.length)]
  }
  // Medical intents
  else if (isMedicalIntent) {
    // Check for specific symptom patterns
    if (/\b(stress|anxiety|worried|panic|tense|overwhelmed|depressed)\b/i.test(lowerMessage)) {
      const responses = [
        'I hear you. Stress and worry are tough. Have you tried simple breathing exercises or taking a short break? Sometimes that helps reset your mind.',
        "That sounds heavy. When things feel overwhelming, even a few minutes of rest or deep breathing can help. What usually works for you?",
        "It's normal to feel this way sometimes. Gentle movement, fresh air, or even talking about it can make a difference. How are you feeling right now?",
      ]
      safeReply = responses[Math.floor(Math.random() * responses.length)]
    }
    // Fever and cold-like symptoms
    else if (/\b(fever|headache|cough|cold|flu|sore throat|body ache)\b/i.test(lowerMessage)) {
      const responses = [
        'That sounds like it could be a viral illness or maybe dehydration. Rest and fluids are usually the best start. How long has this been going on?',
        "Those symptoms often come together. Make sure you're staying hydrated and getting rest. If it doesn't improve in a few days, see a doctor.",
        "I understand. These could be signs of a cold or flu. Drink plenty of water, rest up, and monitor how you feel. Let me know if it gets worse.",
      ]
      safeReply = responses[Math.floor(Math.random() * responses.length)]
      
      // Add follow-up questions if needed
      const { questions } = generateFollowUpQuestions(latestUserMessage)
      if (questions.length > 0) {
        safeReply += `\n\n${formatFollowUpQuestions(questions)}`
      }
    }
    // Skin issues
    else if (/\b(rash|itching|acne|eczema|hives|skin|dermatitis)\b/i.test(lowerMessage)) {
      const responses = [
        'Skin issues can come from many sources - irritation, allergies, or inflammation. Try to avoid what might trigger it and watch for changes.',
        "That can be annoying. Keep the area clean and avoid things that seem to make it worse. If it persists, a dermatologist can help.",
        "I understand. Skin concerns often improve with time and care. Monitor it and see a specialist if it doesn't settle down.",
      ]
      safeReply = responses[Math.floor(Math.random() * responses.length)]
    }
    // Dental
    else if (/\b(tooth|gum|dental|teeth|mouth)\b/i.test(lowerMessage)) {
      const responses = [
        "Dental pain can get worse quickly, so it's worth addressing. Try to avoid very hot or cold foods and see a dentist soon if it persists.",
        "Tooth pain usually needs professional attention. In the meantime, avoid hot or cold foods if they make it worse.",
        "That's worth taking seriously. A dentist can figure out what's happening and how to help.",
      ]
      safeReply = responses[Math.floor(Math.random() * responses.length)]
    }
    // Generic medical response
    else {
      const responses = [
        "That's worth paying attention to. Rest, stay hydrated, and keep an eye on how you're feeling.",
        "I understand. Those symptoms are worth monitoring. See a doctor if they don't improve or get worse.",
        "That sounds uncomfortable. Make sure you're taking care of yourself - rest and fluids help. Let me know if you need anything else.",
      ]
      safeReply = responses[Math.floor(Math.random() * responses.length)]
      
      // Add follow-up questions if needed
      const { questions } = generateFollowUpQuestions(latestUserMessage)
      if (questions.length > 0) {
        safeReply += `\n\n${formatFollowUpQuestions(questions)}`
      }
    }
  }

  const medicalInsights = null

  return sanitizeGeminiResponse(
    {
      reply: safeReply,
      intent,
      medicalInsights,
    },
    intent,
    {
      userMessage: latestUserMessage,
      emergencyDetected,
    },
  )
}

export const aiService = {
  async generateChatResponse(input) {
    const { messages, latestUserMessage } = normalizeRequestPayload(input)
    const intentDetection = detectIntent({ messages, message: latestUserMessage })
    const intent = intentDetection.intent
    const userOnlyConversation = messages.filter((message) => message.role === 'user').map((message) => message.content)
    const emergencyDetected = detectEmergency(userOnlyConversation.length ? userOnlyConversation.join(' ') : latestUserMessage)

    if (!latestUserMessage) {
      throw new AppError('Message cannot be empty', 400)
    }

    let rawText
    try {
      const prompt = buildConversationPrompt({ intent, emergencyDetected, messages, latestUserMessage })

      const modelClient = getGeminiModel()
      let lastError = null

      for (const modelName of GEMINI_MODEL_CANDIDATES) {
        try {
          const model = modelClient.getModel(modelName)
          const result = await withTimeout(
            model.generateContent(prompt),
            GEMINI_TIMEOUT_MS,
            'Gemini request timed out',
          )

          rawText = result.response?.text?.()

          if (rawText) {
            break
          }
        } catch (error) {
          lastError = error

          const message = String(error?.message || '')
          const isModelNotFound = /404|not found|not supported/i.test(message)

          if (!isModelNotFound) {
            throw error
          }
        }
      }

      if (!rawText && lastError) {
        const lastMessage = String(lastError?.message || '')
        if (/429|quota|rate limit|too many requests|not found|not supported/i.test(lastMessage)) {
          return buildConversationalFallbackResponse({ intent, latestUserMessage, emergencyDetected })
        }

        throw lastError
      }
    } catch (error) {
      const errorMessage = String(error?.message || '')

      if (/api key is not configured|429|quota|rate limit|too many requests|not found|not supported/i.test(errorMessage)) {
        return buildConversationalFallbackResponse({ intent, latestUserMessage, emergencyDetected })
      }

      throw error instanceof AppError ? error : new AppError(error.message || 'Gemini request failed', 502)
    }

    if (!rawText) {
      throw new AppError('Gemini returned an empty response', 502)
    }

    let parsed
    try {
      parsed = parseGeminiJsonResponse(rawText)
    } catch {
      throw new AppError('Gemini returned invalid JSON payload', 502)
    }

    return sanitizeGeminiResponse(parsed, intent, {
      userMessage: latestUserMessage,
      emergencyDetected,
    })
  },
}
