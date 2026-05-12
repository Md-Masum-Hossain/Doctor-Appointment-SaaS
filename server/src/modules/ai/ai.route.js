import { Router } from 'express'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { getSymptomRecommendation } from './ai.controller.js'
import { symptomRecommendationSchema } from './ai.validation.js'

const aiRouter = Router()

aiRouter.post('/symptom-recommendation', validateRequest(symptomRecommendationSchema), getSymptomRecommendation)

export default aiRouter