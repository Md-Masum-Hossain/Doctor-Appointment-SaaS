import { motion } from 'framer-motion'

const suggestedSymptoms = [
  'I feel stressed',
  'I have fever and headache',
  'I cannot sleep well',
  'My chest feels tight',
  'I have a rash',
  'I need help with hydration',
]

export function SuggestedSymptomsChips({ onSelectSymptom }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center gap-2.5"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Try asking</span>
      {suggestedSymptoms.map((symptom) => (
        <motion.button
          key={symptom}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectSymptom(symptom)}
          className="rounded-full border border-slate-200 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          {symptom}
        </motion.button>
      ))}
    </motion.div>
  )
}
