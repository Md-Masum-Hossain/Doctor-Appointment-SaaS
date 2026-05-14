import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex max-w-[18rem] items-center gap-3 rounded-2xl rounded-bl-none border border-slate-200/80 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
          <Sparkles size={14} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-600">Thinking</p>
          <div className="flex items-center space-x-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-blue-400"
                animate={{ y: [0, -6, 0], opacity: [0.55, 1, 0.55] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.12,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
