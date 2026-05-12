import mongoose from 'mongoose'

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables.')
  }

  try {
    await mongoose.connect(mongoUri)
  } catch (error) {
    throw error
  }
}
