import { motion } from 'framer-motion'
import { Sparkles, Stethoscope, MessageCircle } from 'lucide-react'
import { EnhancedEmergencyAlert } from './EnhancedEmergencyAlert'

const splitParagraphs = (text) =>
  String(text || '')
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)

const SectionCard = ({ title, items, tone = 'slate' }) => {
  if (!items?.length) return null

  const toneClasses = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  }

  return (
    <div className={`rounded-2xl border p-3 ${toneClasses[tone]}`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-current/10 bg-white/80 px-3 py-1 text-xs leading-5 text-inherit shadow-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ChatMessage({ message, isUser }) {
  if (message.type === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3"
      >
        <p className="text-sm text-rose-700">{message.content}</p>
      </motion.div>
    )
  }

  const isAiMessage = message.type === 'ai'
  const replyText = String(message.reply || message.content || '').replace(/^⚠️ EMERGENCY ALERT:[\s\S]*?\n\n/, '').trim()
  const replyParagraphs = splitParagraphs(replyText)
  const medicalInsights = message.medicalInsights || null
  const tips = Array.isArray(medicalInsights?.tips) ? medicalInsights.tips.filter(Boolean) : []
  const possibleCauses = Array.isArray(medicalInsights?.possibleCauses) ? medicalInsights.possibleCauses.filter(Boolean) : []
  const shouldShowMedicalUI = Boolean(medicalInsights)
  const recommendedSpecialization = medicalInsights?.recommendedSpecialization || ''
  const timestampLabel = message.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-5 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`w-full max-w-[92%] space-y-3 rounded-[1.5rem] px-4 py-4 sm:max-w-[85%] lg:max-w-[72%] ${
          isUser
            ? 'rounded-br-md bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg'
            : 'rounded-bl-md border border-slate-200/80 bg-white text-text shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
        }`}
      >
        {isAiMessage ? (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Sparkles size={15} />
                </div>
                <span>{shouldShowMedicalUI ? 'Assistant' : 'AI assistant'}</span>
                {shouldShowMedicalUI && recommendedSpecialization ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {recommendedSpecialization}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400">{timestampLabel}</p>
            </div>

            {shouldShowMedicalUI && medicalInsights?.emergency ? (
              <EnhancedEmergencyAlert
                message={replyText || 'Please seek immediate medical attention for these symptoms.'}
              />
            ) : null}

            <div className="space-y-4">
              {replyParagraphs.map((paragraph) => (
                <p key={paragraph} className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700 sm:text-[15.5px]">
                  {paragraph}
                </p>
              ))}
            </div>

            {shouldShowMedicalUI ? (
              <div className="rounded-[1.35rem] border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <MessageCircle size={13} />
                  Medical notes
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SectionCard title="Possible causes" items={possibleCauses} tone="blue" />
                  <SectionCard title="Wellness tips" items={tips} tone="emerald" />
                </div>
              </div>
            ) : null}

            {shouldShowMedicalUI && recommendedSpecialization ? (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  <Stethoscope size={13} />
                  {recommendedSpecialization}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                  Professional guidance only
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm leading-7 text-white/95 sm:text-[15px]">{message.content}</p>

            <div className="flex items-center justify-between gap-3 pt-1.5 text-white/85">
              <p className="text-xs opacity-80">
                {timestampLabel}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/90">
                You
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
