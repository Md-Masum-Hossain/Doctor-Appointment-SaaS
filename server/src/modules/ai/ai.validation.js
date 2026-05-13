import { z } from 'zod'

export const aiChatSchema = z.object({
  body: z.object({
    message: z
      .string({ required_error: 'Message is required', invalid_type_error: 'Message must be a string' })
      .trim()
      .min(1, 'Message cannot be empty')
      .max(2000, 'Message is too long. Maximum allowed length is 2000 characters'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})