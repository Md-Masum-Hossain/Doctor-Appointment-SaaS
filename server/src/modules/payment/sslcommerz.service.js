import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Appointment from '../../models/Appointment.js'
import { AppError } from '../../utils/AppError.js'

const supportsTransactions = () => {
  const topologyType = mongoose.connection?.client?.topology?.description?.type
  return topologyType && topologyType !== 'Single'
}

const sslCommerzEndpoints = () => {
  const isLive = String(process.env.SSLCOMMERZ_IS_LIVE || 'false').toLowerCase() === 'true'

  if (isLive) {
    return {
      init: 'https://securepay.sslcommerz.com/gwprocess/v4/api.php',
      validate: 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php',
    }
  }

  return {
    init: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
    validate: 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
  }
}

const appointmentPopulate = [
  {
    path: 'patient',
    select: 'name firstName lastName email phone address city state country',
  },
  {
    path: 'doctor',
    select: 'consultationFee specialization hospitalName chamberAddress user',
    populate: {
      path: 'user',
      select: 'name email phone',
    },
  },
]

const cleanBaseUrl = (baseUrl) => String(baseUrl || '').replace(/\/+$/, '')

const resolveDisplayName = (person, fallback) => {
  if (!person) return fallback

  const nameParts = [person.firstName, person.lastName].filter(Boolean)
  if (nameParts.length > 0) {
    return nameParts.join(' ')
  }

  if (person.name) {
    return person.name
  }

  if (person.user?.name) {
    return person.user.name
  }

  return fallback
}

const normalizeAmount = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return null
  }

  return Number(amount.toFixed(2))
}

const resolveAppointmentAmount = (appointment) => {
  const amount = normalizeAmount(appointment.paymentAmount ?? appointment.doctor?.consultationFee)

  if (amount === null) {
    throw new AppError('Appointment payment amount is missing', 400)
  }

  return amount
}

const resolveTransactionId = (payload = {}) => {
  return payload.tran_id || payload.tranId || payload.transactionId || payload.transaction_id || null
}

const resolveValidationId = (payload = {}) => {
  return payload.val_id || payload.valId || payload.validationId || null
}

const resolveCallbackUrls = (baseUrl) => {
  const rootUrl = cleanBaseUrl(baseUrl)

  if (!rootUrl) {
    throw new AppError('Request origin is required to build SSLCommerz callback URLs', 500)
  }

  return {
    successUrl: `${rootUrl}/api/v1/payments/sslcommerz/success`,
    failUrl: `${rootUrl}/api/v1/payments/sslcommerz/fail`,
    cancelUrl: `${rootUrl}/api/v1/payments/sslcommerz/cancel`,
    validationUrl: `${rootUrl}/api/v1/payments/sslcommerz/validate`,
  }
}

const buildGatewayPayload = ({ appointment, transactionId, amount, callbackUrls }) => {
  const patient = appointment.patient
  const doctor = appointment.doctor

  const customerName = resolveDisplayName(patient, 'Patient')
  const customerEmail = patient?.email || 'patient@example.com'
  const customerPhone = patient?.phone || '01000000000'

  return {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: amount.toFixed(2),
    currency: 'BDT',
    tran_id: transactionId,
    success_url: callbackUrls.successUrl,
    fail_url: callbackUrls.failUrl,
    cancel_url: callbackUrls.cancelUrl,
    ipn_url: callbackUrls.validationUrl,
    shipping_method: 'NO',
    product_name: 'Doctor Appointment Consultation',
    product_category: 'Healthcare',
    product_profile: 'general',
    cus_name: customerName,
    cus_email: customerEmail,
    cus_add1: patient?.address || 'N/A',
    cus_city: patient?.city || 'N/A',
    cus_state: patient?.state || 'N/A',
    cus_postcode: patient?.postalCode || '0000',
    cus_country: patient?.country || 'Bangladesh',
    cus_phone: customerPhone,
    ship_name: customerName,
    ship_add1: patient?.address || 'N/A',
    ship_city: patient?.city || 'N/A',
    ship_state: patient?.state || 'N/A',
    ship_postcode: patient?.postalCode || '0000',
    ship_country: patient?.country || 'Bangladesh',
    value_a: String(appointment._id),
    value_b: String(patient?._id || ''),
    value_c: String(doctor?._id || ''),
    value_d: 'sslcommerz',
    cart: JSON.stringify([
      {
        product: 'Doctor Appointment Consultation',
        amount: amount.toFixed(2),
      },
    ]),
    product_amount: amount.toFixed(2),
    discount_amount: '0',
    convenience_fee: '0',
  }
}

const parseJsonResponse = async (response) => {
  const rawText = await response.text()

  try {
    return JSON.parse(rawText)
  } catch {
    return { raw: rawText }
  }
}

const populateAppointment = async (appointment) => {
  await appointment.populate(appointmentPopulate)
  return appointment
}

const loadAppointmentByTransactionId = async (transactionId, session = null) => {
  const query = Appointment.findOne({ transactionId })
  if (session) {
    query.session(session)
  }

  const appointment = await query.populate(appointmentPopulate)

  if (!appointment) {
    throw new AppError('Appointment not found for this transaction', 404)
  }

  return appointment
}

const rollbackAppointmentPayment = async (appointment, previousState) => {
  appointment.paymentStatus = previousState.paymentStatus
  appointment.paymentMethod = previousState.paymentMethod
  appointment.transactionId = previousState.transactionId
  appointment.paymentAmount = previousState.paymentAmount
  appointment.paidAt = previousState.paidAt
  await appointment.save()
}

const markAppointmentPaymentState = async (appointmentId, updates) => {
  const session = supportsTransactions() ? await mongoose.startSession() : null

  if (session) {
    session.startTransaction()
  }

  try {
    const appointmentQuery = Appointment.findById(appointmentId)
    if (session) {
      appointmentQuery.session(session)
    }

    const appointment = await appointmentQuery
    if (!appointment) {
      throw new AppError('Appointment not found', 404)
    }

    Object.assign(appointment, updates)

    if (session) {
      await appointment.save({ session })
    } else {
      await appointment.save()
    }

    if (session) {
      await session.commitTransaction()
    }

    await populateAppointment(appointment)
    return appointment
  } catch (error) {
    if (session) {
      await session.abortTransaction()
    }
    throw error
  } finally {
    if (session) {
      session.endSession()
    }
  }
}

export const initiateSslCommerzPayment = async ({ patientId, appointmentId, requestBaseUrl }) => {
  if (!process.env.SSLCOMMERZ_STORE_ID || !process.env.SSLCOMMERZ_STORE_PASSWORD) {
    throw new AppError('SSLCommerz credentials are not configured', 500)
  }

  const appointmentQuery = Appointment.findById(appointmentId).populate(appointmentPopulate)
  const appointment = await appointmentQuery

  if (!appointment) {
    throw new AppError('Appointment not found', 404)
  }

  if (appointment.patient._id.toString() !== String(patientId)) {
    throw new AppError('You are not authorized to pay for this appointment', 403)
  }

  if (appointment.status === 'cancelled') {
    throw new AppError('Cannot initiate payment for a cancelled appointment', 400)
  }

  if (appointment.paymentStatus === 'paid' || appointment.status === 'confirmed') {
    throw new AppError('Appointment has already been paid', 400)
  }

  const amount = resolveAppointmentAmount(appointment)
  const transactionId = `DA-${Date.now()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`
  const previousState = {
    paymentStatus: appointment.paymentStatus,
    paymentMethod: appointment.paymentMethod,
    transactionId: appointment.transactionId,
    paymentAmount: appointment.paymentAmount,
    paidAt: appointment.paidAt,
  }

  appointment.paymentStatus = 'pending'
  appointment.paymentMethod = 'sslcommerz'
  appointment.transactionId = transactionId
  appointment.paymentAmount = amount
  appointment.paidAt = null

  await appointment.save()

  const callbackUrls = resolveCallbackUrls(requestBaseUrl)
  const gatewayPayload = buildGatewayPayload({
    appointment,
    transactionId,
    amount,
    callbackUrls,
  })

  const endpoints = sslCommerzEndpoints()
  const response = await fetch(endpoints.init, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(gatewayPayload).toString(),
  })

  const responseData = await parseJsonResponse(response)
  const gatewayPageUrl = responseData.GatewayPageURL || responseData.gatewayPageURL || null

  if (!response.ok || responseData.status !== 'SUCCESS' || !gatewayPageUrl) {
    try {
      await rollbackAppointmentPayment(appointment, previousState)
    } catch {
      // Best-effort rollback only. The gateway response is still the source of truth for the caller.
    }

    throw new AppError(
      responseData.failedreason || responseData.failedReason || 'Failed to initialize SSLCommerz payment',
      502,
    )
  }

  return {
    appointment: await populateAppointment(appointment),
    transactionId,
    paymentAmount: amount,
    currency: 'BDT',
    gatewayPageURL: gatewayPageUrl,
    validationUrl: callbackUrls.validationUrl,
    gatewayResponse: responseData,
  }
}

export const validateSslCommerzPayment = async (payload) => {
  const validationId = resolveValidationId(payload)

  if (!validationId) {
    throw new AppError('Validation ID is required', 400)
  }

  if (!process.env.SSLCOMMERZ_STORE_ID || !process.env.SSLCOMMERZ_STORE_PASSWORD) {
    throw new AppError('SSLCommerz credentials are not configured', 500)
  }

  const endpoints = sslCommerzEndpoints()
  const validationUrl = new URL(endpoints.validate)
  validationUrl.searchParams.set('val_id', validationId)
  validationUrl.searchParams.set('store_id', process.env.SSLCOMMERZ_STORE_ID)
  validationUrl.searchParams.set('store_passwd', process.env.SSLCOMMERZ_STORE_PASSWORD)
  validationUrl.searchParams.set('format', 'json')

  const response = await fetch(validationUrl.toString())
  const responseData = await parseJsonResponse(response)
  const validationStatus = String(responseData.status || '').toUpperCase()

  if (!response.ok || !['VALID', 'VALIDATED'].includes(validationStatus)) {
    throw new AppError(responseData.error || responseData.failedreason || 'SSLCommerz validation failed', 400)
  }

  return responseData
}

export const handleSslCommerzSuccess = async (payload) => {
  const transactionId = resolveTransactionId(payload)
  if (!transactionId) {
    throw new AppError('Transaction ID is required', 400)
  }

  const appointment = await loadAppointmentByTransactionId(transactionId)

  if (appointment.paymentStatus === 'paid' && appointment.transactionId === transactionId) {
    return appointment
  }

  const validation = await validateSslCommerzPayment(payload)
  const validatedTransactionId = validation.tran_id || validation.tranId || transactionId

  if (validatedTransactionId !== transactionId) {
    throw new AppError('Transaction mismatch during validation', 400)
  }

  const validatedAmount = normalizeAmount(validation.amount)
  const expectedAmount = resolveAppointmentAmount(appointment)

  if (validatedAmount === null || Math.abs(validatedAmount - expectedAmount) > 0.01) {
    throw new AppError('Validated payment amount does not match the appointment amount', 400)
  }

  if (appointment.status === 'cancelled') {
    throw new AppError('Cancelled appointments cannot be confirmed by payment', 409)
  }

  return markAppointmentPaymentState(appointment._id, {
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'sslcommerz',
    transactionId,
    paymentAmount: validatedAmount,
    paidAt: new Date(),
  })
}

export const handleSslCommerzFailure = async (payload) => {
  const transactionId = resolveTransactionId(payload)
  if (!transactionId) {
    throw new AppError('Transaction ID is required', 400)
  }

  const appointment = await loadAppointmentByTransactionId(transactionId)

  if (appointment.paymentStatus === 'paid' && appointment.transactionId === transactionId) {
    return appointment
  }

  return markAppointmentPaymentState(appointment._id, {
    paymentStatus: 'failed',
    paymentMethod: 'sslcommerz',
    transactionId,
    paidAt: null,
  })
}

export const handleSslCommerzCancel = async (payload) => {
  const transactionId = resolveTransactionId(payload)
  if (!transactionId) {
    throw new AppError('Transaction ID is required', 400)
  }

  const appointment = await loadAppointmentByTransactionId(transactionId)

  if (appointment.paymentStatus === 'paid' && appointment.transactionId === transactionId) {
    return appointment
  }

  return markAppointmentPaymentState(appointment._id, {
    paymentStatus: 'cancelled',
    paymentMethod: 'sslcommerz',
    transactionId,
    paidAt: null,
  })
}
