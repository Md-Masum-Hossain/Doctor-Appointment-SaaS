import { ApiResponse } from '../../utils/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { paymentService } from './payment.service.js'

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
