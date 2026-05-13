import { motion } from 'framer-motion'

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex max-w-[18rem] items-center gap-3 rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <span className="text-xs font-semibold">AI</span>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-600">Thinking</p>
          <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-blue-400"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
