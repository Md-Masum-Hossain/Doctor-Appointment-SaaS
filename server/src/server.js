import dotenv from 'dotenv'

// Load environment variables as early as possible so other modules
// (like `app.js`) can read `process.env` during initialization.
dotenv.config()

import { connectDatabase } from './config/db.js'
// Import `app` dynamically to ensure `.env` is loaded first.
const { default: app } = await import('./app.js')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDatabase()

    app.listen(PORT, () => {
      // Keep startup log concise for production diagnostics.
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
