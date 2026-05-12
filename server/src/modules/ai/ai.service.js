import DoctorProfile from '../../models/DoctorProfile.js'

const specializationRules = [
  {
    keywords: ['fever', 'cough', 'cold', 'flu', 'headache', 'viral'],
    specialization: 'General Medicine',
  },
  {
    keywords: ['chest pain', 'heart', 'palpitation', 'shortness of breath'],
    specialization: 'Cardiology',
  },
  {
    keywords: ['skin rash', 'rash', 'itching', 'acne', 'eczema'],
    specialization: 'Dermatology',
  },
  {
    keywords: ['tooth pain', 'toothache', 'dental', 'gum pain'],
    specialization: 'Dentistry',
  },
  {
    keywords: ['eye pain', 'blurred vision', 'eye', 'vision'],
    specialization: 'Ophthalmology',
  },
]

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const getRecommendedSpecialization = (symptoms) => {
  const normalizedSymptoms = normalizeText(symptoms)

  for (const rule of specializationRules) {
    if (rule.keywords.some((keyword) => normalizedSymptoms.includes(keyword))) {
      return rule.specialization
    }
  }

  return 'General Medicine'
}

const buildDoctorFilter = (specialization) => ({
  specialization: { $regex: `^${specialization}$`, $options: 'i' },
  isVerified: true,
})

export const aiService = {
  async getSymptomRecommendation(symptoms) {
    const recommendedSpecialization = getRecommendedSpecialization(symptoms)

    const doctors = await DoctorProfile.find(buildDoctorFilter(recommendedSpecialization))
      .populate({
        path: 'user',
        select: 'name email phone avatar role isVerified',
      })
      .sort({ ratingAverage: -1, ratingCount: -1, createdAt: -1 })
      .limit(6)
      .lean()

    return {
      symptoms,
      recommendedSpecialization,
      matchingDoctors: doctors,
      confidence: doctors.length > 0 ? 'medium' : 'low',
      note: 'This is a rule-based placeholder. Real AI can be connected later without changing the API contract.',
    }
  },
}