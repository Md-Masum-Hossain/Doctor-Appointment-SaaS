import mongoose from 'mongoose'
import User from '../../models/User.js'
import DoctorProfile from '../../models/DoctorProfile.js'
import { AppError } from '../../utils/AppError.js'

const buildUserFilters = (query) => {
  const filters = {}

  if (query.role) {
    filters.role = query.role
  }

  if (query.search) {
    filters.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } },
    ]
  }

  if (query.isBlocked !== undefined) {
    filters.isBlocked = query.isBlocked === 'true'
  }

  if (query.isVerified !== undefined) {
    filters.isVerified = query.isVerified === 'true'
  }

  return filters
}

const buildSort = (sortBy, sortOrder) => ({
  [sortBy]: sortOrder === 'asc' ? 1 : -1,
})

export const userService = {
  async getAllUsers(query) {
    const page = query.page || 1
    const limit = query.limit || 10
    const skip = (page - 1) * limit

    const filters = buildUserFilters(query)
    const sort = buildSort(query.sortBy || 'createdAt', query.sortOrder || 'desc')

    const [items, total] = await Promise.all([
      User.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filters),
    ])

    // Remove sensitive data
    const users = items.map(user => {
      const { password, refreshToken, ...safeUser } = user
      return safeUser
    })

    return {
      items: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  },

  async getUserById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user id', 400)
    }

    const user = await User.findById(id).lean()

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const { password, refreshToken, ...safeUser } = user
    return safeUser
  },

  async deleteUser(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user id', 400)
    }

    const user = await User.findById(id)

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Delete associated doctor profile if user is a doctor
    if (user.role === 'doctor') {
      await DoctorProfile.deleteOne({ user: id })
    }

    await User.findByIdAndDelete(id)
  },

  async blockUser(id, isBlocked = true) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user id', 400)
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isBlocked } },
      { new: true, runValidators: true },
    ).lean()

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const { password, refreshToken, ...safeUser } = user
    return safeUser
  },
}
