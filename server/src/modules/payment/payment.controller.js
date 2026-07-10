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

const getClientRedirectUrl = (path, params = {}) => {
  const clientUrl = process.env.CLIENT_URL

  if (!clientUrl) {
    return null
  }

  const redirectUrl = new URL(path, clientUrl.endsWith('/') ? clientUrl : `${clientUrl}/`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      redirectUrl.searchParams.set(key, String(value))
    }
  })

  return redirectUrl.toString()
}

const redirectToClient = (res, path, params = {}) => {
  const redirectUrl = getClientRedirectUrl(path, params)

  if (!redirectUrl) {
    throw new Error('CLIENT_URL is not configured')
  }

  return res.redirect(303, redirectUrl)
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
  try {
    const payload = {
      ...req.validated.body,
      ...req.validated.query,
    }
    const result = await handleSslCommerzSuccess(payload)

    return redirectToClient(res, '/payment/success', {
      paymentStatus: 'success',
      appointmentId: result._id,
      transactionId: result.transactionId,
      message: 'Payment successful. Your appointment is confirmed.',
    })
  } catch (error) {
    return redirectToClient(res, '/payment/failed', {
      paymentStatus: 'failed',
      message: error?.message || 'Payment validation failed. Your appointment is still pending.',
    })
  }
})

export const handleSslCommerzFailureController = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.validated.body,
      ...req.validated.query,
    }
    const result = await handleSslCommerzFailure(payload)

    return redirectToClient(res, '/payment/failed', {
      paymentStatus: 'failed',
      appointmentId: result._id,
      transactionId: result.transactionId,
      message: 'Payment failed. Your appointment is still pending.',
    })
  } catch (error) {
    return redirectToClient(res, '/payment/failed', {
      paymentStatus: 'failed',
      message: error?.message || 'Payment failed. Your appointment is still pending.',
    })
  }
})

export const handleSslCommerzCancelController = asyncHandler(async (req, res) => {
  try {
    const payload = {
      ...req.validated.body,
      ...req.validated.query,
    }
    const result = await handleSslCommerzCancel(payload)

    return redirectToClient(res, '/payment/cancelled', {
      paymentStatus: 'cancelled',
      appointmentId: result._id,
      transactionId: result.transactionId,
      message: 'Payment cancelled. Your appointment remains pending.',
    })
  } catch (error) {
    return redirectToClient(res, '/payment/cancelled', {
      paymentStatus: 'cancelled',
      message: error?.message || 'Payment cancelled. Your appointment remains pending.',
    })
  }
})

export const validateSslCommerzPaymentController = asyncHandler(async (req, res) => {
  const payload = {
    ...req.validated.body,
    ...req.validated.query,
  }
  const result = await validateSslCommerzPayment(payload)

  res.status(200).json(new ApiResponse(200, 'SSLCommerz payment validated successfully', result))
})
