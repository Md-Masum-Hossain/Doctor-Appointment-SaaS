import { motion } from 'framer-motion'
import { AlertTriangle, Phone } from 'lucide-react'

export function EnhancedEmergencyAlert({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="mb-4 overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle size={24} className="text-rose-600" />
          </motion.div>
        </div>
        <div className="space-y-2 flex-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Immediate care recommended</p>
          <p className="text-sm leading-6 text-rose-900">{message}</p>
          <div className="mt-3 flex gap-2">
            <a
              href="tel:911"
              className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
            >
              <Phone size={14} />
              Call Emergency
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
