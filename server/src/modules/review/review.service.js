import mongoose from 'mongoose'
import Appointment from '../../models/Appointment.js'
import DoctorProfile from '../../models/DoctorProfile.js'
import Review from '../../models/Review.js'
import { AppError } from '../../utils/AppError.js'

const reviewPopulate = [
  {
    path: 'patient',
    select: 'name email phone avatar role',
  },
  {
    path: 'doctor',
    select: 'specialization consultationFee hospitalName chamberAddress ratingAverage ratingCount user',
    populate: {
      path: 'user',
      select: 'name email phone avatar role',
    },
  },
  {
    path: 'appointment',
    select: 'appointmentDate timeSlot status paymentStatus',
  },
]

const supportsTransactions = () => {
  const topologyType = mongoose.connection?.client?.topology?.description?.type
  return topologyType && topologyType !== 'Single'
}

const buildSort = (sortOrder) => ({
  createdAt: sortOrder === 'asc' ? 1 : -1,
})

const buildListQuery = (match, query) => ({
  match,
  page: query.page || 1,
  limit: query.limit || 10,
  sort: buildSort(query.sortOrder || 'desc'),
})

const recalculateDoctorRating = async (doctorId, session = null) => {
  const aggregation = Review.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    {
      $group: {
        _id: '$doctor',
        ratingAverage: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ])

  if (session) {
    aggregation.session(session)
  }

  const [stats] = await aggregation

  const updatePayload = {
    ratingAverage: stats?.ratingAverage || 0,
    ratingCount: stats?.ratingCount || 0,
  }

  await DoctorProfile.findByIdAndUpdate(
    doctorId,
    { $set: updatePayload },
    session ? { session, runValidators: true } : { runValidators: true },
  )
}

const getAppointmentForReview = async (appointmentId, session = null) => {
  const appointmentQuery = Appointment.findById(appointmentId).populate({
    path: 'doctor',
    select: '_id',
  })

  if (session) {
    appointmentQuery.session(session)
  }

  const appointment = await appointmentQuery

  if (!appointment) {
    throw new AppError('Appointment not found', 404)
  }

  return appointment
}

export const reviewService = {
  async createReview(patientId, payload) {
    const session = supportsTransactions() ? await mongoose.startSession() : null

    if (session) {
      session.startTransaction()
    }

    try {
      const appointment = await getAppointmentForReview(payload.appointmentId, session)

      if (appointment.patient.toString() !== String(patientId)) {
        throw new AppError('You can only review your own appointments', 403)
      }

      if (appointment.status !== 'completed') {
        throw new AppError('You can only review a completed appointment', 409)
      }

      const existingReviewQuery = Review.findOne({ appointment: appointment._id })
      if (session) {
        existingReviewQuery.session(session)
      }
      const existingReview = await existingReviewQuery

      if (existingReview) {
        throw new AppError('A review already exists for this appointment', 409)
      }

      const review = await Review.create([
        {
          patient: patientId,
          doctor: appointment.doctor._id,
          appointment: appointment._id,
          rating: payload.rating,
          comment: payload.comment,
        },
      ], session ? { session } : undefined)

      await recalculateDoctorRating(appointment.doctor._id, session)

      const populatedReview = await Review.findById(review[0]._id).populate(reviewPopulate)

      if (session) {
        await session.commitTransaction()
      }

      return populatedReview.toObject()
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
  },

  async getDoctorReviews(doctorId, query) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new AppError('Invalid doctor profile id', 400)
    }

    const doctorProfile = await DoctorProfile.findById(doctorId).lean()

    if (!doctorProfile) {
      throw new AppError('Doctor profile not found', 404)
    }

    const { match, page, limit, sort } = buildListQuery({ doctor: doctorId }, query)
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Review.find(match).sort(sort).skip(skip).limit(limit).populate(reviewPopulate).lean(),
      Review.countDocuments(match),
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

  async getMyReviews(patientId, query) {
    const { match, page, limit, sort } = buildListQuery({ patient: patientId }, query)
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Review.find(match).sort(sort).skip(skip).limit(limit).populate(reviewPopulate).lean(),
      Review.countDocuments(match),
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

  async deleteReview(reviewId) {
    const session = supportsTransactions() ? await mongoose.startSession() : null

    if (session) {
      session.startTransaction()
    }

    try {
      const reviewQuery = Review.findById(reviewId)
      if (session) {
        reviewQuery.session(session)
      }
      const review = await reviewQuery

      if (!review) {
        throw new AppError('Review not found', 404)
      }

      await review.deleteOne(session ? { session } : undefined)
      await recalculateDoctorRating(review.doctor, session)

      if (session) {
        await session.commitTransaction()
      }

      return review.toObject()
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
  },
}
