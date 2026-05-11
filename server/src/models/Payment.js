import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
      index: true,
    },
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
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'BDT',
      enum: ['BDT', 'USD'],
    },
    method: {
      type: String,
      enum: ['manual', 'stripe', 'sslcommerz'],
      default: 'manual',
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentProof: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot be longer than 500 characters'],
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, 'Rejection reason cannot be longer than 500 characters'],
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, 'Refund reason cannot be longer than 500 characters'],
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for efficient queries
paymentSchema.index({ patient: 1, createdAt: -1 })
paymentSchema.index({ doctor: 1, createdAt: -1 })
paymentSchema.index({ status: 1, createdAt: -1 })

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment
