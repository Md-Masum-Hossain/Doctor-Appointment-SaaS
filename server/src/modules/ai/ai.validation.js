import { z } from 'zod'

export const symptomRecommendationSchema = z.object({
  body: z.object({
    symptoms: z.string().trim().min(3, 'Symptoms are required').max(2000),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})