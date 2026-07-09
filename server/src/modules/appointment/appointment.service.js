import mongoose from 'mongoose'
import Appointment from '../../models/Appointment.js'
import DoctorProfile from '../../models/DoctorProfile.js'
import { AppError } from '../../utils/AppError.js'
import { createNotification } from '../notification/notification.service.js'

const appointmentPopulate = [
  {
    path: 'patient',
    select: 'name email phone avatar role',
  },
  {
    path: 'doctor',
    select: 'specialization consultationFee hospitalName chamberAddress availableDays availableSlots isVerified ratingAverage ratingCount user',
    populate: {
      path: 'user',
      select: 'name email phone avatar role isVerified',
    },
  },
]

const buildSort = (sortOrder) => ({
  appointmentDate: sortOrder === 'asc' ? 1 : -1,
  timeSlot: sortOrder === 'asc' ? 1 : -1,
  createdAt: -1,
})

const buildListQuery = (match, query) => ({
  match: {
    ...match,
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
  },
  page: query.page || 1,
  limit: query.limit || 10,
  sort: buildSort(query.sortOrder || 'desc'),
})

const normalizeDate = (date) => {
  const normalized = new Date(date)
  normalized.setUTCHours(0, 0, 0, 0)
  return normalized
}

const ensureNoDoubleBooking = async (doctorId, appointmentDate, timeSlot, appointmentId = null) => {
  const match = {
    doctor: doctorId,
    appointmentDate,
    timeSlot,
    status: { $in: ['pending', 'accepted', 'confirmed', 'rescheduled'] },
  }

  if (appointmentId) {
    match._id = { $ne: appointmentId }
  }

  const existingAppointment = await Appointment.findOne(match)

  if (existingAppointment) {
    throw new AppError('This doctor is already booked for the selected date and time slot', 409)
  }
}

const getDoctorProfileForUser = async (userId) => {
  const doctorProfile = await DoctorProfile.findOne({ user: userId })

  if (!doctorProfile) {
    throw new AppError('Doctor profile not found', 404)
  }

  return doctorProfile
}

const sanitizeText = (value) => (typeof value === 'string' ? value.trim() : value)

export const appointmentService = {
  async createAppointment(patientId, payload) {
    const doctorProfile = await DoctorProfile.findById(payload.doctorId)

    if (!doctorProfile) {
      throw new AppError('Doctor profile not found', 404)
    }

    const appointmentDate = normalizeDate(payload.appointmentDate)
    await ensureNoDoubleBooking(doctorProfile._id, appointmentDate, payload.timeSlot)

    const queueNumber = (await Appointment.countDocuments({
      doctor: doctorProfile._id,
      appointmentDate,
      status: { $in: ['pending', 'accepted', 'confirmed', 'rescheduled', 'completed'] },
    })) + 1

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorProfile._id,
      appointmentDate,
      timeSlot: payload.timeSlot,
      reason: sanitizeText(payload.reason),
      notes: sanitizeText(payload.notes) || '',
      queueNumber,
      status: 'pending',
      paymentStatus: 'unpaid',
    })

    const populated = await Appointment.findById(appointment._id).populate(appointmentPopulate)
    
    // Create notification for appointment booked
    await createNotification({
      recipientId: doctorProfile.user,
      type: 'appointment-booked',
      title: 'New Appointment Booking',
      message: `${populated.patient.name} has booked an appointment with you on ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.timeSlot}.`,
      relatedResource: {
        resourceType: 'appointment',
        resourceId: appointment._id,
      },
    })

    return populated.toObject()
  },

  async getAppointmentById(id) {
    const appointment = await Appointment.findById(id).populate(appointmentPopulate)

    if (!appointment) {
      throw new AppError('Appointment not found', 404)
    }

    return appointment
  },

  async listAppointments(match, query) {
    const { match: listMatch, page, limit, sort } = buildListQuery(match, query)
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Appointment.find(listMatch).sort(sort).skip(skip).limit(limit).populate(appointmentPopulate).lean(),
      Appointment.countDocuments(listMatch),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  },

  async getMyAppointments(patientId, query) {
    return this.listAppointments({ patient: patientId }, query)
  },

  async getDoctorAppointments(userId, query) {
    const doctorProfile = await getDoctorProfileForUser(userId)
    return this.listAppointments({ doctor: doctorProfile._id }, query)
  },

  async getAdminAppointments(query) {
    return this.listAppointments({}, query)
  },

  async updateAppointmentStatus(id, userId, role, payload) {
    const appointment = await this.getAppointmentById(id)

    if (role === 'doctor') {
      const doctorProfile = await getDoctorProfileForUser(userId)

      if (appointment.doctor._id.toString() !== doctorProfile._id.toString()) {
        throw new AppError('Forbidden: appointment does not belong to you', 403)
      }
    }

    const allowedTransitions = {
      accepted: ['pending', 'rescheduled'],
      confirmed: ['pending', 'accepted', 'rescheduled'],
      cancelled: ['pending', 'accepted', 'confirmed', 'rescheduled'],
      completed: ['accepted', 'confirmed'],
      pending: [],
      rescheduled: ['pending', 'accepted', 'confirmed'],
    }

    if (!allowedTransitions[payload.status].includes(appointment.status)) {
      throw new AppError(`Cannot change appointment from ${appointment.status} to ${payload.status}`, 409)
    }

    appointment.status = payload.status
    if (payload.notes !== undefined) {
      appointment.notes = sanitizeText(payload.notes) || ''
    }

    if (payload.status === 'cancelled') {
      appointment.paymentStatus = appointment.paymentStatus === 'paid' ? 'refunded' : appointment.paymentStatus
    }

    await appointment.save()
    await appointment.populate(appointmentPopulate)

    // Create notifications based on status change
    if (payload.status === 'accepted') {
      await createNotification({
        recipientId: appointment.patient._id,
        type: 'appointment-accepted',
        title: 'Appointment Accepted',
        message: `Your appointment with Dr. ${appointment.doctor.user.name} on ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.timeSlot} has been accepted.`,
        relatedResource: {
          resourceType: 'appointment',
          resourceId: appointment._id,
        },
      })
    } else if (payload.status === 'cancelled') {
      const notifyRecipient = role === 'doctor' ? appointment.patient._id : appointment.doctor.user._id
      const cancelledByMsg = role === 'doctor' ? 'Doctor' : 'Patient'
      
      await createNotification({
        recipientId: notifyRecipient,
        type: 'appointment-cancelled',
        title: 'Appointment Cancelled',
        message: `Your appointment on ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.timeSlot} has been cancelled by the ${cancelledByMsg}.`,
        relatedResource: {
          resourceType: 'appointment',
          resourceId: appointment._id,
        },
      })
    }

    return appointment.toObject()
  },

  async rescheduleAppointment(id, patientId, payload) {
    const appointment = await this.getAppointmentById(id)

    if (appointment.patient._id.toString() !== patientId.toString()) {
      throw new AppError('Forbidden: you can only reschedule your own appointments', 403)
    }

    if (!['pending', 'accepted', 'rescheduled'].includes(appointment.status)) {
      throw new AppError('This appointment cannot be rescheduled', 409)
    }

    const appointmentDate = normalizeDate(payload.appointmentDate)
    await ensureNoDoubleBooking(appointment.doctor._id, appointmentDate, payload.timeSlot, appointment._id)

    appointment.appointmentDate = appointmentDate
    appointment.timeSlot = payload.timeSlot
    appointment.status = 'rescheduled'
    if (payload.reason !== undefined) {
      appointment.reason = sanitizeText(payload.reason)
    }
    if (payload.notes !== undefined) {
      appointment.notes = sanitizeText(payload.notes) || ''
    }

    await appointment.save()
    await appointment.populate(appointmentPopulate)

    return appointment.toObject()
  },

  async cancelAppointment(id, patientId, role) {
    const appointment = await this.getAppointmentById(id)

    if (role === 'patient' && appointment.patient._id.toString() !== patientId.toString()) {
      throw new AppError('Forbidden: you can only cancel your own appointments', 403)
    }

    if (role === 'doctor') {
      const doctorProfile = await getDoctorProfileForUser(patientId)
      if (appointment.doctor._id.toString() !== doctorProfile._id.toString()) {
        throw new AppError('Forbidden: appointment does not belong to you', 403)
      }
    }

    if (appointment.status === 'cancelled') {
      throw new AppError('Appointment is already cancelled', 409)
    }

    appointment.status = 'cancelled'
    if (appointment.paymentStatus === 'paid') {
      appointment.paymentStatus = 'refunded'
    }

    await appointment.save()
    await appointment.populate(appointmentPopulate)

    // Create notification for appointment cancellation
    const notifyRecipient = role === 'patient' ? appointment.doctor.user._id : appointment.patient._id
    const cancelledByMsg = role === 'patient' ? 'Patient' : 'Doctor'
    
    await createNotification({
      recipientId: notifyRecipient,
      type: 'appointment-cancelled',
      title: 'Appointment Cancelled',
      message: `Your appointment on ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.timeSlot} has been cancelled by the ${cancelledByMsg}.`,
      relatedResource: {
        resourceType: 'appointment',
        resourceId: appointment._id,
      },
    })

    return appointment.toObject()
  },
}
