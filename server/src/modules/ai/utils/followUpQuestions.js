/**
 * Smart follow-up question generation for incomplete symptom information
 * Helps gather context before providing guidance
 */

const SYMPTOM_CONTEXT_QUESTIONS = {
  duration: [
    'How long have you had this?',
    'When did this start?',
    'How many days has this been going on?',
    'Is this something you just noticed today?',
  ],
  accompanying: [
    'Have you noticed any other symptoms?',
    'Are there any other changes you\'ve experienced?',
    'Any fever, cough, or other symptoms?',
    'What else have you noticed?',
  ],
  firstTime: [
    'Is this the first time you\'re experiencing this?',
    'Have you had this before?',
    'Is this new for you?',
  ],
  severity: [
    'How severe is this affecting you?',
    'Is it mild, moderate, or severe?',
    'How much is this bothering you?',
  ],
  trigger: [
    'Did anything specific trigger this?',
    'What were you doing when it started?',
    'Can you think of what might have caused it?',
  ],
}

const normalizeText = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const hasContextInfo = (message, contextType) => {
  const normalized = normalizeText(message)

  switch (contextType) {
    case 'duration':
      return /\b(day|week|month|hour|started|ago|since|begun|begin)\b/.test(normalized)
    case 'accompanying':
      return /\b(also|fever|cough|sore throat|ache|nausea|vomit|sweat)\b/.test(normalized)
    case 'firstTime':
      return /\b(first|before|again|usually|happen|experience|had)\b/.test(normalized)
    case 'severity':
      return /\b(mild|moderate|severe|bad|terrible|little|lot|extreme|intense)\b/.test(normalized)
    case 'trigger':
      return /\b(cause|trigger|after|following|ate|did|happened|when|because)\b/.test(normalized)
    default:
      return false
  }
}

/**
 * Generate follow-up questions for incomplete symptom information
 * @param {string} symptomMessage - User's symptom description
 * @returns {object} - Object with generated questions and context gaps
 */
export const generateFollowUpQuestions = (symptomMessage) => {
  if (!symptomMessage || typeof symptomMessage !== 'string') {
    return { questions: [], gaps: [] }
  }

  const gaps = []
  const contextTypes = ['duration', 'accompanying', 'firstTime', 'severity', 'trigger']

  for (const contextType of contextTypes) {
    if (!hasContextInfo(symptomMessage, contextType)) {
      gaps.push(contextType)
    }
  }

  // Select 1-2 most important questions
  const selectedGaps = gaps.slice(0, 2)
  const questions = selectedGaps.map((gap) => {
    const options = SYMPTOM_CONTEXT_QUESTIONS[gap] || []
    return options[Math.floor(Math.random() * options.length)]
  })

  return {
    questions,
    gaps: selectedGaps,
    hasCompleteInfo: gaps.length === 0,
  }
}

/**
 * Format follow-up questions for natural insertion into response
 * @param {array} questions - Array of question strings
 * @returns {string} - Formatted question text
 */
export const formatFollowUpQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return ''
  }

  if (questions.length === 1) {
    return `May I ask - ${questions[0]}`
  }

  return `May I ask:\n- ${questions.join('\n- ')}`
}

export default {
  generateFollowUpQuestions,
  formatFollowUpQuestions,
}
