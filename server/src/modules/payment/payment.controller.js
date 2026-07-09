import { ApiResponse } from '../../utils/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { paymentService } from './payment.service.js'
import {
  initiateSslCommerzPayment,
  handleSslCommerzSuccess,
  handleSslCommerzFailure,
  handleSslCommerzCancel,
  validateSslCommerzPayment,
} from './sslcommerz.service.js'

const getRequestBaseUrl = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol
  return `${protocol}://${req.get('host')}`
}

export const createPayment = asyncHandler(async (req, res) => {
  const payload = req.validated.body
  const payment = await paymentService.createPayment(req.user._id, payload)

  res.status(201).json(new ApiResponse(201, 'Payment created successfully', payment))
})

export const getMyPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.getPatientPayments(req.user._id, req.query)
  res.status(200).json(new ApiResponse(200, 'Payments fetched successfully', result))
})

export const getAdminPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.getAdminPayments(req.query)
  res.status(200).json(new ApiResponse(200, 'All payments fetched successfully', result))
})

export const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.validated.params
  const payment = await paymentService.getPaymentById(id, req.user._id, req.user.role)

  res.status(200).json(new ApiResponse(200, 'Payment fetched successfully', payment))
})

export const verifyPayment = asyncHandler(async (req, res) => {
  const { id } = req.validated.params
  const payment = await paymentService.verifyPayment(id, req.user._id)

  res.status(200).json(new ApiResponse(200, 'Payment verified successfully', payment))
})

export const rejectPayment = asyncHandler(async (req, res) => {
  const { id } = req.validated.params
  const { rejectionReason } = req.validated.body
  const payment = await paymentService.rejectPayment(id, req.user._id, rejectionReason)

  res.status(200).json(new ApiResponse(200, 'Payment rejected successfully', payment))
})

export const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.validated.params
  const { refundReason } = req.validated.body
  const payment = await paymentService.refundPayment(id, req.user._id, refundReason)

  res.status(200).json(new ApiResponse(200, 'Payment refunded successfully', payment))
})

export const getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await paymentService.getPaymentStats()
  res.status(200).json(new ApiResponse(200, 'Payment stats fetched successfully', stats))
})

export const initiateSslCommerzPaymentController = asyncHandler(async (req, res) => {
  const { appointmentId } = req.validated.body
  const result = await initiateSslCommerzPayment({
    patientId: req.user._id,
    appointmentId,
    requestBaseUrl: getRequestBaseUrl(req),
  })

  res.status(200).json(new ApiResponse(200, 'SSLCommerz payment initialized successfully', result))
})

export const handleSslCommerzSuccessController = asyncHandler(async (req, res) => {
  const payload = {
    ...req.validated.body,
    ...req.validated.query,
  }
  const result = await handleSslCommerzSuccess(payload)

  res.status(200).json(new ApiResponse(200, 'SSLCommerz payment success processed successfully', result))
})

export const handleSslCommerzFailureController = asyncHandler(async (req, res) => {
  const payload = {
    ...req.validated.body,
    ...req.validated.query,
  }
  const result = await handleSslCommerzFailure(payload)

  res.status(200).json(new ApiResponse(200, 'SSLCommerz payment failure processed successfully', result))
})

export const handleSslCommerzCancelController = asyncHandler(async (req, res) => {
  const payload = {
    ...req.validated.body,
    ...req.validated.query,
  }
  const result = await handleSslCommerzCancel(payload)

  res.status(200).json(new ApiResponse(200, 'SSLCommerz payment cancellation processed successfully', result))
})

export const validateSslCommerzPaymentController = asyncHandler(async (req, res) => {
  const payload = {
    ...req.validated.body,
    ...req.validated.query,
  }
  const result = await validateSslCommerzPayment(payload)

  res.status(200).json(new ApiResponse(200, 'SSLCommerz payment validated successfully', result))
})
