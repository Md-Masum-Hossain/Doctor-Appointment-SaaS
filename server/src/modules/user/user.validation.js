import { z } from 'zod'

export const getAllUsersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    role: z.enum(['patient', 'doctor', 'admin']).optional(),
    search: z.string().trim().optional(),
    isBlocked: z.enum(['true', 'false']).optional(),
    isVerified: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    sortBy: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
})

export const userIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user id'),
  }),
  query: z.object({}).optional(),
})

export const blockUserSchema = z.object({
  body: z.object({
    isBlocked: z.boolean(),
  }),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user id'),
  }),
  query: z.object({}).optional(),
})
