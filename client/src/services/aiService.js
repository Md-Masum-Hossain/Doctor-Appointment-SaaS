import apiClient from './apiClient'

const unwrap = (response) => response.data?.data

export const aiService = {
  getSymptomRecommendation: (symptoms) =>
    apiClient.post('/ai/symptom-recommendation', { symptoms }).then(unwrap),
}