import { z } from 'zod'

const dayEnum = z.enum([
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
])

const slotSchema = z.object({
  startTime: z.string().trim().min(1, 'Start time is required'),
  endTime: z.string().trim().min(1, 'End time is required'),
})

const doctorProfilePayloadSchema = z.object({
  specialization: z.string().trim().min(2, 'Specialization is required').max(120),
  qualifications: z.array(z.string().trim().min(1).max(120)).default([]),
  experienceYears: z.coerce.number().min(0).default(0),
  consultationFee: z.coerce.number().min(0).default(0),
  bio: z.string().trim().max(1500).default(''),
  hospitalName: z.string().trim().max(180).default(''),
  chamberAddress: z.string().trim().max(350).default(''),
  availableDays: z.array(dayEnum).default([]),
  availableSlots: z.array(slotSchema).default([]),
  photoUrl: z.string().trim().url('Invalid photo URL').optional().default(''),
})

export const createDoctorProfileSchema = z.object({
  body: doctorProfilePayloadSchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const updateDoctorProfileSchema = z.object({
  body: doctorProfilePayloadSchema.partial(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const verifyDoctorSchema = z.object({
  body: z
    .object({
      isVerified: z.boolean().optional(),
    })
    .optional()
    .default({}),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid doctor profile id'),
  }),
  query: z.object({}).optional(),
})

export const doctorIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid doctor profile id'),
  }),
  query: z.object({}).optional(),
})

export const getDoctorsQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    specialization: z.string().trim().optional(),
    location: z.string().trim().optional(),
    minFee: z.coerce.number().min(0).optional(),
    maxFee: z.coerce.number().min(0).optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    sortBy: z
      .enum(['createdAt', 'consultationFee', 'ratingAverage', 'experienceYears'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    verified: z.enum(['true', 'false']).optional(),
  }),
})
