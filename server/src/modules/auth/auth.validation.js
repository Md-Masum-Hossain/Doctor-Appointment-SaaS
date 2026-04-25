import { z } from 'zod'

const roleEnum = z.enum(['patient', 'doctor', 'admin'])

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.email(),
    password: z.string().min(6).max(100),
    phone: z.string().trim().min(5).max(30),
    role: roleEnum.optional(),
    avatar: z.url().optional().or(z.literal('')),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
})
