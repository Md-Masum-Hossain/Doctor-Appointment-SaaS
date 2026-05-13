import { Router } from 'express'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { chatWithAi } from './ai.controller.js'
import { aiChatSchema } from './ai.validation.js'

const aiRouter = Router()

aiRouter.post('/chat', validateRequest(aiChatSchema), chatWithAi)

export default aiRouter
