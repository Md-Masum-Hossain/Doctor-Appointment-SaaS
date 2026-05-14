const NON_MEDICAL_RESPONSES = {
  greeting: 'Hello 😊 How can I help you today?',
  casual_conversation: 'I\'m here and ready to help. What would you like to talk about?',
  language_request: 'হ্যাঁ অবশ্যই 😊 আপনি বাংলায় কথা বলতে পারেন।',
  gratitude: 'You\'re welcome 😊 Take care.',
  goodbye: 'Take care 😊 I\'m here if you need anything later.',
}

export const MEDICAL_INTENTS = new Set(['symptom_discussion', 'wellness_question', 'emergency_symptom'])

export const RESPONSE_MODES = {
  greeting: { intent: 'greeting', showMedicalUI: false, reply: NON_MEDICAL_RESPONSES.greeting },
  casual_conversation: { intent: 'casual_conversation', showMedicalUI: false, reply: NON_MEDICAL_RESPONSES.casual_conversation },
  language_request: { intent: 'language_request', showMedicalUI: false, reply: NON_MEDICAL_RESPONSES.language_request },
  gratitude: { intent: 'gratitude', showMedicalUI: false, reply: NON_MEDICAL_RESPONSES.gratitude },
  goodbye: { intent: 'goodbye', showMedicalUI: false, reply: NON_MEDICAL_RESPONSES.goodbye },
  symptom_discussion: { intent: 'symptom_discussion', showMedicalUI: true },
  wellness_question: { intent: 'wellness_question', showMedicalUI: true },
  emergency_symptom: { intent: 'emergency_symptom', showMedicalUI: true },
}

export const getResponseMode = (intent) => RESPONSE_MODES[intent] || RESPONSE_MODES.casual_conversation

export const buildNonMedicalResponse = (intent) => {
  const mode = getResponseMode(intent)

  return {
    reply: mode.reply,
    intent: mode.intent,
    showMedicalUI: false,
    recommendedSpecialization: '',
    emergency: false,
    tips: [],
    possibleCauses: [],
  }
}

export const buildMedicalResponse = ({ intent, reply, recommendedSpecialization = '', emergency = false, tips = [], possibleCauses = [] }) => ({
  reply,
  intent,
  showMedicalUI: true,
  recommendedSpecialization,
  emergency: Boolean(emergency),
  tips: Array.isArray(tips) ? tips : [],
  possibleCauses: Array.isArray(possibleCauses) ? possibleCauses : [],
})

export const buildEmergencyResponse = ({ intent, reply, recommendedSpecialization = 'General Medicine', tips = [], possibleCauses = [] }) => ({
  reply,
  intent,
  showMedicalUI: true,
  recommendedSpecialization,
  emergency: true,
  tips: Array.isArray(tips) ? tips : [],
  possibleCauses: Array.isArray(possibleCauses) ? possibleCauses : [],
})
