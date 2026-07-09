import mongoose from 'mongoose'
import Appointment from '../../models/Appointment.js'
import DoctorProfile from '../../models/DoctorProfile.js'
import User from '../../models/User.js'
import { AppError } from '../../utils/AppError.js'
import { createNotification } from '../notification/notification.service.js'

const doctorPopulate = [
  {
    path: 'user',
    select: 'name email phone avatar role isVerified',
  },
]

const buildSort = (sortBy, sortOrder) => ({
  [sortBy]: sortOrder === 'asc' ? 1 : -1,
})

const buildFilters = (query) => {
  const filters = {}

  if (query.specialization) {
    filters.specialization = { $regex: query.specialization, $options: 'i' }
  }

  if (query.location) {
    filters.$or = [
      { chamberAddress: { $regex: query.location, $options: 'i' } },
      { hospitalName: { $regex: query.location, $options: 'i' } },
    ]
  }

  if (query.minFee !== undefined || query.maxFee !== undefined) {
    filters.consultationFee = {}

    if (query.minFee !== undefined) {
      filters.consultationFee.$gte = query.minFee
    }

    if (query.maxFee !== undefined) {
      filters.consultationFee.$lte = query.maxFee
    }
  }

  if (query.rating !== undefined) {
    filters.ratingAverage = { $gte: query.rating }
  }

  if (query.verified === 'true') {
    filters.isVerified = true
  } else if (query.verified === 'false') {
    filters.isVerified = false
  } else {
    filters.isVerified = true
  }

  return filters
}

const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return {}
  }

  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value
    }
    return acc
  }, {})
}

const buildMonthKey = (date) => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const buildMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1))

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export const doctorService = {
  async getDoctors(query) {
    const page = query.page || 1
    const limit = query.limit || 10
    const skip = (page - 1) * limit

    const filters = buildFilters(query)
    const sort = buildSort(query.sortBy || 'createdAt', query.sortOrder || 'desc')

    const [items, total] = await Promise.all([
      DoctorProfile.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(doctorPopulate)
        .lean(),
      DoctorProfile.countDocuments(filters),
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

  async getMyDoctorProfile(userId) {
    return DoctorProfile.findOne({ user: userId }).populate(doctorPopulate).lean()
  },

  async getDoctorById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid doctor profile id', 400)
    }

    const doctorProfile = await DoctorProfile.findById(id).populate(doctorPopulate).lean()

    if (!doctorProfile) {
      throw new AppError('Doctor profile not found', 404)
    }

    return doctorProfile
  },

  async createDoctorProfile(userId, payload) {
    const existingProfile = await DoctorProfile.findOne({ user: userId })

    if (existingProfile) {
      throw new AppError('Doctor profile already exists', 409)
    }

    const doctorProfile = await DoctorProfile.create({
      user: userId,
      ...sanitizePayload(payload),
    })

    const populated = await doctorProfile.populate(doctorPopulate)

    return populated.toObject()
  },

  async updateDoctorProfile(userId, payload) {
    const updatePayload = sanitizePayload(payload)

    const doctorProfile = await DoctorProfile.findOneAndUpdate(
      { user: userId },
      { $set: updatePayload },
      { new: true, runValidators: true },
    ).populate(doctorPopulate)

    if (!doctorProfile) {
      throw new AppError('Doctor profile not found. Create profile first.', 404)
    }

    return doctorProfile.toObject()
  },

  async getDoctorDashboardStats(userId, query) {
    const doctorProfile = await DoctorProfile.findOne({ user: userId }).select('_id consultationFee').lean()

    if (!doctorProfile) {
      throw new AppError('Doctor profile not found', 404)
    }

    const periodMonths = Number(query?.periodMonths || 6)
    const safePeriodMonths = Number.isFinite(periodMonths) ? Math.min(Math.max(periodMonths, 1), 12) : 6
    const since = new Date()
    since.setUTCDate(1)
    since.setUTCHours(0, 0, 0, 0)
    since.setUTCMonth(since.getUTCMonth() - safePeriodMonths + 1)

    const [completedAppointmentsCount, appointments] = await Promise.all([
      Appointment.countDocuments({ doctor: doctorProfile._id, status: 'completed' }),
      Appointment.find({
        doctor: doctorProfile._id,
        status: 'completed',
        appointmentDate: { $gte: since },
      })
        .select('appointmentDate paymentStatus paymentAmount')
        .sort({ appointmentDate: 1 })
        .lean(),
    ])

    const revenueByMonth = new Map()

    let totalEarnings = 0

    appointments.forEach((appointment) => {
      if (appointment.paymentStatus !== 'paid') {
        return
      }

      const amount = Number(appointment.paymentAmount ?? doctorProfile.consultationFee ?? 0)
      if (!Number.isFinite(amount) || amount <= 0) {
        return
      }

      totalEarnings += amount

      const monthKey = buildMonthKey(new Date(appointment.appointmentDate))
      const current = revenueByMonth.get(monthKey) || { monthKey, label: buildMonthLabel(monthKey), amount: 0, appointments: 0 }

      current.amount += amount
      current.appointments += 1
      revenueByMonth.set(monthKey, current)
    })

    const monthlyRevenue = Array.from(revenueByMonth.values()).sort((left, right) => left.monthKey.localeCompare(right.monthKey))
    const currentMonthKey = buildMonthKey(new Date())
    const currentMonth = revenueByMonth.get(currentMonthKey) || {
      monthKey: currentMonthKey,
      label: buildMonthLabel(currentMonthKey),
      amount: 0,
      appointments: 0,
    }

    return {
      totalEarnings,
      completedAppointments: completedAppointmentsCount,
      revenueStatistics: {
        currentMonth,
        monthly: monthlyRevenue,
      },
    }
  },

  async verifyDoctorProfile(id, isVerified) {
    const doctorProfile = await DoctorProfile.findByIdAndUpdate(
      id,
      { $set: { isVerified } },
      { new: true, runValidators: true },
    ).populate(doctorPopulate)

    if (!doctorProfile) {
      throw new AppError('Doctor profile not found', 404)
    }

    await User.findByIdAndUpdate(doctorProfile.user._id, { $set: { isVerified } })

    // Create notification for doctor verification
    if (isVerified) {
      await createNotification({
        recipientId: doctorProfile.user,
        type: 'doctor-verified',
        title: 'Profile Verified',
        message: 'Congratulations! Your doctor profile has been verified by the admin. You can now accept appointments.',
        relatedResource: {
          resourceType: 'doctor',
          resourceId: doctorProfile._id,
        },
      })
    }

    return doctorProfile.toObject()
  },
}
