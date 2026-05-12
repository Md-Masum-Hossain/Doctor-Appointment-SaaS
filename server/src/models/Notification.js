import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['appointment-booked', 'appointment-accepted', 'appointment-cancelled', 'payment-verified', 'doctor-verified', 'review-submitted'],
      required: [true, 'Notification type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [255, 'Title cannot be longer than 255 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot be longer than 1000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedResource: {
      resourceType: {
        type: String,
        enum: ['appointment', 'payment', 'doctor', 'review'],
        required: false,
      },
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  },
)

notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
