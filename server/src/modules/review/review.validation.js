import { z } from 'zod'

const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource identifier')

const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const createReviewSchema = z.object({
  body: z.object({
    appointmentId: idSchema,
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().min(3, 'Comment is required').max(2000),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const reviewIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: idSchema,
  }),
  query: z.object({}).optional(),
})

export const doctorReviewsParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    doctorId: idSchema,
  }),
  query: reviewQuerySchema,
})

export const myReviewsQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: reviewQuerySchema,
})
