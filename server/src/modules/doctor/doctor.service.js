import mongoose from 'mongoose'
import DoctorProfile from '../../models/DoctorProfile.js'
import User from '../../models/User.js'
import { AppError } from '../../utils/AppError.js'

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

    return doctorProfile.toObject()
  },
}
