import { z } from 'zod'

const dateSchema = z.coerce.date()

const slotSchema = z.string().trim().min(1, 'Time slot is required')

const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource identifier')

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: idSchema,
    appointmentDate: dateSchema,
    timeSlot: slotSchema,
    reason: z.string().trim().min(3, 'Reason is required').max(500),
    notes: z.string().trim().max(1000).optional().default(''),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const appointmentIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: idSchema,
  }),
  query: z.object({}).optional(),
})

export const appointmentListQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    status: z.enum(['pending', 'accepted', 'cancelled', 'completed', 'rescheduled']).optional(),
    paymentStatus: z.enum(['unpaid', 'paid', 'refunded']).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
})

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'accepted', 'cancelled', 'completed', 'rescheduled']),
    notes: z.string().trim().max(1000).optional(),
  }),
  params: z.object({
    id: idSchema,
  }),
  query: z.object({}).optional(),
})

export const rescheduleAppointmentSchema = z.object({
  body: z.object({
    appointmentDate: dateSchema,
    timeSlot: slotSchema,
    reason: z.string().trim().min(3).max(500).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
  params: z.object({
    id: idSchema,
  }),
  query: z.object({}).optional(),
})

export const cancelAppointmentSchema = appointmentIdParamSchema
