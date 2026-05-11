import { z } from 'zod'

const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource identifier')

const createPaymentSchema = z.object({
  body: z.object({
    appointment: idSchema,
    amount: z.coerce.number().positive('Amount must be a positive number'),
    method: z.enum(['manual', 'stripe', 'sslcommerz']).default('manual'),
    transactionId: z.string().trim().min(3, 'Transaction ID must be at least 3 characters'),
    paymentProof: z.string().trim().url('Payment proof must be a valid URL').optional().or(z.literal('')).nullable().default(null),
    description: z.string().trim().max(500, 'Description cannot be longer than 500 characters').optional().or(z.literal('')).nullable().default(''),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

const paymentIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: idSchema,
  }),
  query: z.object({}).optional(),
})

const verifyPaymentSchema = z.object({
  body: z.object({
    verifiedAt: z.coerce.date().optional().nullable(),
  }).default({}),
  params: z.object({
    id: idSchema,
  }),
  query: z.object({}).optional(),
})

const rejectPaymentSchema = z.object({
  body: z.object({
    rejectionReason: z.string().trim().min(1, 'Rejection reason is required').max(500, 'Rejection reason cannot be longer than 500 characters'),
  }),
  params: z.object({
    id: idSchema,
  }),
  query: z.object({}).optional(),
})

const refundPaymentSchema = z.object({
  body: z.object({
    refundReason: z.string().trim().min(1, 'Refund reason is required').max(500, 'Refund reason cannot be longer than 500 characters'),
  }),
  params: z.object({
    id: idSchema,
  }),
  query: z.object({}).optional(),
})

const paymentListQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(['pending', 'verified', 'failed', 'refunded']).optional(),
    sortBy: z.enum(['createdAt', 'amount']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
})

export {
  createPaymentSchema,
  paymentIdParamSchema,
  verifyPaymentSchema,
  rejectPaymentSchema,
  refundPaymentSchema,
  paymentListQuerySchema,
}
