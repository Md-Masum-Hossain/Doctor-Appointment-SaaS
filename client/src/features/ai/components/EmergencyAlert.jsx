import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { THEME_COLORS } from '../../../constants/theme'

export function EmergencyAlert({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-4"
    >
      <div className="flex gap-3">
        <AlertTriangle size={24} className="mt-0.5 flex-shrink-0 text-red-600" />
        <div className="space-y-1">
          <p className="font-bold text-red-900">⚠️ Emergency Alert</p>
          <p className="text-sm text-red-800">{message}</p>
        </div>
      </div>
    </motion.div>
  )
}
