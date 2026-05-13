import { motion } from 'framer-motion'
import { HeartPulse, Sparkles, ShieldCheck, MessageCircleHeart } from 'lucide-react'
import { THEME_COLORS } from '../../../constants/theme'

const starterPrompts = [
  'I feel stressed lately',
  'I have fever and headache',
  'I cannot sleep well',
  'I need help with hydration',
]

export function EmptyChatState({ onSelectPrompt }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-full flex-col items-center justify-center px-4 py-10 sm:py-12"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <HeartPulse size={38} color={THEME_COLORS.primary} />
      </div>

      <div className="mt-6 max-w-2xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <Sparkles size={12} />
          Conversational health guidance
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
          Tell me what you’re feeling. I’ll help you make sense of it.
        </h2>
        <p className="text-sm leading-6 text-slate-600 sm:text-base">
          Ask about symptoms, sleep, stress, hydration, or general wellness. I’ll respond naturally, suggest what may be going on, and point you to the right specialty when needed.
        </p>
      </div>

      <div className="mt-8 w-full max-w-3xl rounded-[1.75rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <MessageCircleHeart size={16} className="text-blue-600" />
          Start a conversation
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {starterPrompts.map((prompt) => (
            <motion.button
              key={prompt}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPrompt?.(prompt)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
        {[
          'Natural conversation',
          'Safe wellness guidance',
          'Specialist suggestions',
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
            {item}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 shadow-sm">
        <ShieldCheck size={14} className="text-emerald-500" />
        Professional guidance only. For emergencies, seek immediate medical care.
      </div>
    </motion.div>
  )
}
