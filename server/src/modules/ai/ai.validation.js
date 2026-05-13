import { z } from 'zod'

const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'model']),
  content: z
    .string({ invalid_type_error: 'Message content must be a string' })
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(4000, 'Message content is too long. Maximum allowed length is 4000 characters'),
})

export const aiChatSchema = z.object({
  body: z.object({
    message: z
      .string({ invalid_type_error: 'Message must be a string' })
      .trim()
      .min(1, 'Message cannot be empty')
      .max(2000, 'Message is too long. Maximum allowed length is 2000 characters')
      .optional(),
    messages: z.array(conversationMessageSchema).min(1).max(20).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
}).refine((data) => Boolean(data.body.message || data.body.messages?.length), {
  message: 'Either message or messages is required',
  path: ['body'],
})