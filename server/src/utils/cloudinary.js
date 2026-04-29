import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL)
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Upload file to Cloudinary from buffer
export const uploadToCloudinary = async (fileBuffer, fileName) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: `doctor-photos/${Date.now()}-${fileName}`,
          folder: 'doctor-appointment-saas/doctor-photos',
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )

      uploadStream.end(fileBuffer)
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`)
  }
}

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return

    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error(`Cloudinary delete failed: ${error.message}`)
    // Don't throw - deletion failure shouldn't break the app
  }
}

export default cloudinary
