import { Router } from 'express'
import { authorizeRoles, protect } from '../../middlewares/auth.middleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  createPayment,
  getMyPayments,
  getAdminPayments,
  getPaymentById,
  verifyPayment,
  rejectPayment,
  refundPayment,
  getPaymentStats,
  initiateSslCommerzPaymentController,
  handleSslCommerzSuccessController,
  handleSslCommerzFailureController,
  handleSslCommerzCancelController,
  validateSslCommerzPaymentController,
} from './payment.controller.js'
import {
  createPaymentSchema,
  sslcommerzInitiateSchema,
  sslcommerzGatewaySchema,
  sslcommerzValidationSchema,
  paymentIdParamSchema,
  verifyPaymentSchema,
  rejectPaymentSchema,
  refundPaymentSchema,
  paymentListQuerySchema,
} from './payment.validation.js'

const paymentRouter = Router()

// Patient routes
paymentRouter.post('/', protect, authorizeRoles('patient'), validateRequest(createPaymentSchema), createPayment)
paymentRouter.post(
  '/sslcommerz/initiate',
  protect,
  authorizeRoles('patient'),
  validateRequest(sslcommerzInitiateSchema),
  initiateSslCommerzPaymentController,
)
paymentRouter.post('/sslcommerz/validate', validateRequest(sslcommerzValidationSchema), validateSslCommerzPaymentController)
paymentRouter.all('/sslcommerz/success', validateRequest(sslcommerzGatewaySchema), handleSslCommerzSuccessController)
paymentRouter.all('/sslcommerz/fail', validateRequest(sslcommerzGatewaySchema), handleSslCommerzFailureController)
paymentRouter.all('/sslcommerz/cancel', validateRequest(sslcommerzGatewaySchema), handleSslCommerzCancelController)
paymentRouter.get('/my', protect, authorizeRoles('patient'), validateRequest(paymentListQuerySchema), getMyPayments)
paymentRouter.get('/:id', protect, validateRequest(paymentIdParamSchema), getPaymentById)

// Admin routes
paymentRouter.get(
  '/admin/all',
  protect,
  authorizeRoles('admin'),
  validateRequest(paymentListQuerySchema),
  getAdminPayments,
)
paymentRouter.get('/admin/stats', protect, authorizeRoles('admin'), getPaymentStats)
paymentRouter.patch(
  '/:id/verify',
  protect,
  authorizeRoles('admin'),
  validateRequest(verifyPaymentSchema),
  verifyPayment,
)
paymentRouter.patch(
  '/:id/reject',
  protect,
  authorizeRoles('admin'),
  validateRequest(rejectPaymentSchema),
  rejectPayment,
)
paymentRouter.patch(
  '/:id/refund',
  protect,
  authorizeRoles('admin'),
  validateRequest(refundPaymentSchema),
  refundPayment,
)

export default paymentRouter
