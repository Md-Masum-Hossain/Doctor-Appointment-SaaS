// Symptom to specialization mapping with healthcare logic
const symptomSpecializations = [
  {
    keywords: ['fever', 'cough', 'cold', 'flu', 'sore throat', 'headache', 'body ache'],
    specialization: 'General Medicine',
    priority: 1,
  },
  {
    keywords: ['chest pain', 'palpitation', 'heart', 'shortness of breath', 'irregular heartbeat'],
    specialization: 'Cardiology',
    priority: 1,
  },
  {
    keywords: ['skin rash', 'itching', 'acne', 'eczema', 'psoriasis', 'hives'],
    specialization: 'Dermatology',
    priority: 1,
  },
  {
    keywords: ['tooth pain', 'toothache', 'dental', 'gum', 'cavity', 'dental decay'],
    specialization: 'Dentistry',
    priority: 1,
  },
  {
    keywords: ['eye pain', 'blurred vision', 'eye strain', 'redness in eyes', 'watery eyes'],
    specialization: 'Ophthalmology',
    priority: 1,
  },
  {
    keywords: ['anxiety', 'depression', 'stress', 'panic', 'mental health', 'worried', 'scared'],
    specialization: 'Psychiatry',
    priority: 1,
  },
  {
    keywords: ['joint pain', 'arthritis', 'bone pain', 'fracture', 'sprain', 'muscle pain'],
    specialization: 'Orthopedics',
    priority: 1,
  },
  {
    keywords: ['headache', 'migraine', 'dizziness', 'vertigo', 'numbness', 'tingling'],
    specialization: 'Neurology',
    priority: 2,
  },
  {
    keywords: ['stomach pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'acidity'],
    specialization: 'Gastroenterology',
    priority: 1,
  },
  {
    keywords: ['cough', 'breathing', 'asthma', 'wheezing', 'pneumonia', 'bronchitis'],
    specialization: 'Pulmonology',
    priority: 1,
  },
  {
    keywords: ['ear pain', 'hearing loss', 'tinnitus', 'ear discharge', 'nose', 'sinus'],
    specialization: 'ENT',
    priority: 1,
  },
  {
    keywords: ['period', 'menstrual', 'pregnancy', 'reproductive', 'gynecology', 'uterus'],
    specialization: 'Gynecology',
    priority: 1,
  },
  {
    keywords: ['blood pressure', 'hypertension', 'diabetes', 'cholesterol', 'obesity'],
    specialization: 'Internal Medicine',
    priority: 1,
  },
]

const normalizeSymptomText = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const hasExactKeywordMatch = (normalizedMessage, keyword) => {
  const normalizedKeyword = normalizeSymptomText(keyword)

  if (!normalizedKeyword) return false

  if (normalizedKeyword.includes(' ')) {
    return normalizedMessage.includes(normalizedKeyword)
  }

  return new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`, 'i').test(normalizedMessage)
}

export const getRecommendedSpecializationFromSymptoms = (userMessage) => {
  const normalized = normalizeSymptomText(userMessage)

  // Find all matching specializations
  const matches = symptomSpecializations
    .map((spec) => {
      const matchScore = spec.keywords.reduce((score, keyword) => {
        if (!hasExactKeywordMatch(normalized, keyword)) {
          return score
        }

        // Longer symptom phrases are more specific and should weigh more heavily.
        return score + keyword.split(' ').length
      }, 0)

      return {
        ...spec,
        matchCount: matchScore,
      }
    })
    .filter((match) => match.matchCount > 0)
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount
      return a.priority - b.priority
    })

  return matches.length > 0 ? matches[0].specialization : 'General Medicine'
}

export const getSymptomCategory = (userMessage) => {
  const normalized = normalizeSymptomText(userMessage)

  for (const spec of symptomSpecializations) {
    if (spec.keywords.some((keyword) => normalized.includes(keyword))) {
      return spec.specialization
    }
  }

  return null
}

export const extractSymptomKeywords = (userMessage) => {
  const normalized = normalizeSymptomText(userMessage)
  const found = []

  for (const spec of symptomSpecializations) {
    for (const keyword of spec.keywords) {
      if (normalized.includes(keyword)) {
        found.push({
          keyword,
          specialization: spec.specialization,
        })
      }
    }
  }

  return found
}
