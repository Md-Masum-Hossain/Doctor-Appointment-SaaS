import Payment from '../../models/Payment.js'
import Appointment from '../../models/Appointment.js'
import { AppError } from '../../utils/AppError.js'
import mongoose from 'mongoose'

const supportsTransactions = () => {
  const topologyType = mongoose.connection?.client?.topology?.description?.type
  return topologyType && topologyType !== 'Single'
}

class PaymentService {
  /**
   * Create payment for an appointment
   */
  async createPayment(patientId, payload) {
    const session = supportsTransactions() ? await mongoose.startSession() : null

    if (session) {
      session.startTransaction()
    }

    try {
      // Validate appointment exists and belongs to patient
      const appointmentQuery = Appointment.findById(payload.appointment).populate('doctor', '_id consultationFee')
      if (session) {
        appointmentQuery.session(session)
      }
      const appointment = await appointmentQuery

      if (!appointment) {
        throw new AppError('Appointment not found', 404)
      }

      if (appointment.patient.toString() !== String(patientId)) {
        throw new AppError('You are not authorized to create payment for this appointment', 403)
      }

      if (appointment.status === 'cancelled') {
        throw new AppError('Cannot create payment for a cancelled appointment', 400)
      }

      // Check if payment already exists for this appointment
      const existingPayment = await Payment.findOne({ appointment: payload.appointment }).session(session)
      if (existingPayment && existingPayment.status !== 'failed') {
        throw new AppError('Payment already exists for this appointment', 400)
      }

      // Validate amount matches doctor's consultation fee
      if (payload.amount !== appointment.doctor.consultationFee) {
        throw new AppError(`Amount must match doctor's fee of ${appointment.doctor.consultationFee}`, 400)
      }

      // Check for duplicate transaction ID
      const duplicateTransaction = await Payment.findOne({ transactionId: payload.transactionId }).session(session)
      if (duplicateTransaction) {
        throw new AppError('This transaction ID has already been used', 400)
      }

      // Create payment
      const payment = new Payment({
        appointment: payload.appointment,
        patient: patientId,
        doctor: appointment.doctor._id,
        amount: payload.amount,
        method: payload.method || 'manual',
        transactionId: payload.transactionId,
        paymentProof: payload.paymentProof || null,
        description: payload.description || '',
        status: 'pending',
      })

      if (session) {
        await payment.save({ session })
      } else {
        await payment.save()
      }

      // Populate references
      await payment.populate([
        { path: 'appointment', select: 'appointmentDate timeSlot' },
        { path: 'patient', select: 'firstName lastName email phone' },
        { path: 'doctor', select: 'user specialization' },
      ])

      if (session) {
        await session.commitTransaction()
      }
      return payment
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

  /**
   * Get payments by patient
   */
  async getPatientPayments(patientId, query) {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = query

    const skip = (page - 1) * limit
    const filter = { patient: patientId }

    if (status) {
      filter.status = status
    }

    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate([
          { path: 'appointment', select: 'appointmentDate timeSlot reason' },
          { path: 'doctor', select: 'user specialization' },
        ])
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ])

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get payments for admin
   */
  async getAdminPayments(query) {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = query

    const skip = (page - 1) * limit
    const filter = {}

    if (status) {
      filter.status = status
    }

    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate([
          { path: 'appointment', select: 'appointmentDate timeSlot' },
          { path: 'patient', select: 'firstName lastName email phone' },
          { path: 'doctor', select: 'user specialization' },
          { path: 'verifiedBy', select: 'firstName lastName email' },
        ])
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ])

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Verify payment (admin only)
   */
  async verifyPayment(paymentId, adminId) {
    const session = supportsTransactions() ? await mongoose.startSession() : null

    if (session) {
      session.startTransaction()
    }

    try {
      const paymentQuery = Payment.findById(paymentId)
      if (session) {
        paymentQuery.session(session)
      }
      const payment = await paymentQuery

      if (!payment) {
        throw new AppError('Payment not found', 404)
      }

      if (payment.status !== 'pending') {
        throw new AppError(`Cannot verify a ${payment.status} payment`, 400)
      }

      // Update payment
      payment.status = 'verified'
      payment.verifiedBy = adminId
      payment.verifiedAt = new Date()

      if (session) {
        await payment.save({ session })
      } else {
        await payment.save()
      }

      // Update appointment payment status
      await Appointment.findByIdAndUpdate(payment.appointment, { paymentStatus: 'paid' }, session ? { session } : undefined)

      // Populate for response
      await payment.populate([
        { path: 'appointment', select: 'appointmentDate timeSlot' },
        { path: 'patient', select: 'firstName lastName email phone' },
        { path: 'doctor', select: 'user specialization' },
        { path: 'verifiedBy', select: 'firstName lastName email' },
      ])

      if (session) {
        await session.commitTransaction()
      }
      return payment
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

  /**
   * Reject payment (admin only)
   */
  async rejectPayment(paymentId, adminId, rejectionReason) {
    const session = supportsTransactions() ? await mongoose.startSession() : null

    if (session) {
      session.startTransaction()
    }

    try {
      const paymentQuery = Payment.findById(paymentId)
      if (session) {
        paymentQuery.session(session)
      }
      const payment = await paymentQuery

      if (!payment) {
        throw new AppError('Payment not found', 404)
      }

      if (payment.status !== 'pending') {
        throw new AppError(`Cannot reject a ${payment.status} payment`, 400)
      }

      payment.status = 'failed'
      payment.rejectionReason = rejectionReason
      payment.verifiedBy = adminId
      payment.verifiedAt = new Date()

      if (session) {
        await payment.save({ session })
      } else {
        await payment.save()
      }

      // Appointment payment status remains unpaid
      await payment.populate([
        { path: 'appointment', select: 'appointmentDate timeSlot' },
        { path: 'patient', select: 'firstName lastName email phone' },
        { path: 'doctor', select: 'user specialization' },
        { path: 'verifiedBy', select: 'firstName lastName email' },
      ])

      if (session) {
        await session.commitTransaction()
      }
      return payment
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

  /**
   * Refund payment (admin only)
   */
  async refundPayment(paymentId, adminId, refundReason) {
    const session = supportsTransactions() ? await mongoose.startSession() : null

    if (session) {
      session.startTransaction()
    }

    try {
      const paymentQuery = Payment.findById(paymentId)
      if (session) {
        paymentQuery.session(session)
      }
      const payment = await paymentQuery

      if (!payment) {
        throw new AppError('Payment not found', 404)
      }

      if (payment.status !== 'verified') {
        throw new AppError('Only verified payments can be refunded', 400)
      }

      payment.status = 'refunded'
      payment.refundReason = refundReason
      payment.refundedAt = new Date()

      if (session) {
        await payment.save({ session })
      } else {
        await payment.save()
      }

      // Update appointment payment status
      await Appointment.findByIdAndUpdate(payment.appointment, { paymentStatus: 'refunded' }, session ? { session } : undefined)

      await payment.populate([
        { path: 'appointment', select: 'appointmentDate timeSlot' },
        { path: 'patient', select: 'firstName lastName email phone' },
        { path: 'doctor', select: 'user specialization' },
        { path: 'verifiedBy', select: 'firstName lastName email' },
      ])

      if (session) {
        await session.commitTransaction()
      }
      return payment
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

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId, userId, userRole) {
    const payment = await Payment.findById(paymentId).populate([
      { path: 'appointment', select: 'appointmentDate timeSlot' },
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', select: 'user specialization' },
      { path: 'verifiedBy', select: 'firstName lastName email' },
    ])

    if (!payment) {
      throw new AppError('Payment not found', 404)
    }

    // Authorization check
    if (userRole !== 'admin' && payment.patient.toString() !== String(userId)) {
      throw new AppError('You are not authorized to view this payment', 403)
    }

    return payment
  }

  /**
   * Get payment stats for dashboard
   */
  async getPaymentStats(adminId = null) {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ])

    const result = {
      pending: { count: 0, totalAmount: 0 },
      verified: { count: 0, totalAmount: 0 },
      failed: { count: 0, totalAmount: 0 },
      refunded: { count: 0, totalAmount: 0 },
    }

    stats.forEach(stat => {
      result[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount,
      }
    })

    return result
  }
}

export const paymentService = new PaymentService()
