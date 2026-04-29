import mongoose from 'mongoose'

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
)

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      maxlength: [120, 'Specialization cannot be longer than 120 characters'],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: [0, 'Experience years cannot be negative'],
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: [0, 'Consultation fee cannot be negative'],
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1500, 'Bio cannot be longer than 1500 characters'],
    },
    hospitalName: {
      type: String,
      default: '',
      trim: true,
      maxlength: [180, 'Hospital name cannot be longer than 180 characters'],
    },
    chamberAddress: {
      type: String,
      default: '',
      trim: true,
      maxlength: [350, 'Chamber address cannot be longer than 350 characters'],
    },
    availableDays: {
      type: [String],
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      default: [],
    },
    availableSlots: {
      type: [timeSlotSchema],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating average cannot be negative'],
      max: [5, 'Rating average cannot be greater than 5'],
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative'],
    },
    photoUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

doctorProfileSchema.index({ specialization: 1 })
doctorProfileSchema.index({ consultationFee: 1 })
doctorProfileSchema.index({ ratingAverage: -1 })
doctorProfileSchema.index({ chamberAddress: 1 })
doctorProfileSchema.index({ hospitalName: 1 })

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema)

export default DoctorProfile
