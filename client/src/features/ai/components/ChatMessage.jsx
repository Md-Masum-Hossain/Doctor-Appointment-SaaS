import { motion } from 'framer-motion'
import { Sparkles, Stethoscope } from 'lucide-react'
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
  const tips = Array.isArray(message.tips) ? message.tips.filter(Boolean) : []
  const possibleCauses = Array.isArray(message.possibleCauses) ? message.possibleCauses.filter(Boolean) : []
  const shouldShowMedicalUI = message.showMedicalUI !== false && (message.emergency || Boolean(message.recommendedSpecialization) || tips.length > 0 || possibleCauses.length > 0)

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
            : 'rounded-bl-md border border-slate-200 bg-white text-text shadow-sm'
        }`}
      >
        {isAiMessage ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assistant reply</p>
                  <p className="text-sm font-semibold text-slate-900">{shouldShowMedicalUI ? (message.recommendedSpecialization || 'General Medicine') : 'Conversation'}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {shouldShowMedicalUI && message.emergency ? (
              <EnhancedEmergencyAlert
                message={replyText || 'Please seek immediate medical attention for these symptoms.'}
              />
            ) : null}

            <div className="space-y-3">
              {replyParagraphs.map((paragraph) => (
                <p key={paragraph} className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {paragraph}
                </p>
              ))}
            </div>

            {shouldShowMedicalUI ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <SectionCard title="Possible causes" items={possibleCauses} tone="blue" />
                <SectionCard title="Wellness tips" items={tips} tone="emerald" />
              </div>
            ) : null}

            {shouldShowMedicalUI && message.recommendedSpecialization ? (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  <Stethoscope size={13} />
                  {message.recommendedSpecialization}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                  Professional guidance only
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-xs opacity-80">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
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
