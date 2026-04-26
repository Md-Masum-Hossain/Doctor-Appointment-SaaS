import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot be longer than 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'cancelled', 'completed', 'rescheduled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    queueNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Notes cannot be longer than 1000 characters'],
    },
  },
  {
    timestamps: true,
  },
)

appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'accepted', 'rescheduled'] },
    },
  },
)

appointmentSchema.index({ patient: 1, appointmentDate: -1 })
appointmentSchema.index({ doctor: 1, appointmentDate: -1 })

const Appointment = mongoose.model('Appointment', appointmentSchema)

export default Appointment
