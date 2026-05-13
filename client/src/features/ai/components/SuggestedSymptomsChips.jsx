import { motion } from 'framer-motion'

const suggestedSymptoms = [
  'Fever',
  'Headache',
  'Stress',
  'Anxiety',
  'Chest Pain',
  'Cough',
  'Sleep Problems',
]

export function SuggestedSymptomsChips({ onSelectSymptom }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Quick prompts</span>
      {suggestedSymptoms.map((symptom) => (
        <motion.button
          key={symptom}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectSymptom(symptom)}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          {symptom}
        </motion.button>
      ))}
    </motion.div>
  )
}
