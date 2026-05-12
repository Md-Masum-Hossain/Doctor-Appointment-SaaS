import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
      unique: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be greater than 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot be longer than 2000 characters'],
    },
  },
  {
    timestamps: true,
  },
)

reviewSchema.index({ doctor: 1, createdAt: -1 })
reviewSchema.index({ patient: 1, createdAt: -1 })

const Review = mongoose.model('Review', reviewSchema)

export default Review
