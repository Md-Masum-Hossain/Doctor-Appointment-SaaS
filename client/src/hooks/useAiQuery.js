import { useMutation } from '@tanstack/react-query'
import { aiService } from '../services/aiService'

export const useSymptomRecommendationMutation = () =>
  useMutation({
    mutationFn: aiService.getSymptomRecommendation,
  })