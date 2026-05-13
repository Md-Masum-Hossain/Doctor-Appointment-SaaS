import { motion } from 'framer-motion'
import { Stethoscope } from 'lucide-react'
import { THEME_COLORS } from '../../../constants/theme'

export function SuggestedSpecializationCard({ specialization }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-2"
    >
      <Stethoscope size={16} className="text-teal-600" />
      <span className="text-sm font-medium text-text">
        Recommended: <span className="text-teal-700">{specialization}</span>
      </span>
    </motion.div>
  )
}
