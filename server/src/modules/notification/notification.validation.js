import { z } from 'zod'

const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource identifier')

const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const getNotificationsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: notificationQuerySchema,
})

export const notificationIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: idSchema,
  }),
  query: z.object({}).optional(),
})

export const markAsReadSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: idSchema,
  }),
  query: z.object({}).optional(),
})

export const markAllAsReadSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})
