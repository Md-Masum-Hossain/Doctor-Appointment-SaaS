import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, HeartPulse, Sparkles, ShieldCheck, MapPin, Star, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAIChat } from '../hooks/useAIChat'
import { ChatMessage } from '../components/ChatMessage'
import { ChatInput } from '../components/ChatInput'
import { TypingIndicator } from '../components/TypingIndicator'
import { EmptyChatState } from '../components/EmptyChatState'
import { SuggestedSymptomsChips } from '../components/SuggestedSymptomsChips'
import Badge from '../../../components/ui/Badge'
import { doctorService } from '../../../services/doctorService'

export function AIHealthAssistantPage() {
  const { messages, isLoading, sendMessage, clearChat, messagesEndRef } = useAIChat()
  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [draftMessage, setDraftMessage] = useState('')

  const hasMessages = messages.length > 0

  const latestAIMessage = useMemo(
    () => [...messages].reverse().find((msg) => msg.type === 'ai'),
    [messages],
  )

  const latestSpecialization = latestAIMessage?.showMedicalUI ? latestAIMessage?.recommendedSpecialization || null : null

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        () => {
          setLocationError('Location access is off on this device.')
        },
      )
    }
  }, [])

  const fetchDoctorsBySpecialization = useCallback(async (specialization) => {
    setLoadingDoctors(true)

    try {
      const result = await doctorService.getDoctors({
        specialization,
        verified: 'true',
        sortBy: 'ratingAverage',
        sortOrder: 'desc',
        limit: 6,
      })

      const doctorsList = Array.isArray(result?.items) ? result.items : []
      setDoctors(doctorsList)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setDoctors([])
    } finally {
      setLoadingDoctors(false)
    }
  }, [])

  useEffect(() => {
    if (latestSpecialization) {
      fetchDoctorsBySpecialization(latestSpecialization)
      return
    }

    setDoctors([])
  }, [latestSpecialization, fetchDoctorsBySpecialization])

  const handleSendMessage = useCallback(
    (message) => {
      sendMessage(message)
      setDraftMessage('')
    },
    [sendMessage],
  )

  const handleQuickFill = useCallback((symptom) => {
    setDraftMessage(`I have ${symptom.toLowerCase()}`)
  }, [])

  const latestTips = latestAIMessage?.tips || []
  const latestPossibleCauses = latestAIMessage?.possibleCauses || []
  const showMedicalSummary = Boolean(latestAIMessage?.showMedicalUI)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5 flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_25px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles size={12} />
              Human-centered healthcare guidance
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 text-blue-600">
                <HeartPulse size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">AI Health Assistant</h1>
                <p className="text-sm text-slate-600">
                  Calm, context-aware guidance for symptoms, wellness questions, and thoughtful next-step doctor suggestions. I may ask one quick follow-up question when it helps.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              Messages are sent with conversation memory
            </div>
            {hasMessages ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={clearChat}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                title="Clear chat"
              >
                <X size={18} />
              </motion.button>
            ) : null}
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Private conversation</p>
                <p className="mt-1 text-sm text-slate-600">Ask about symptoms, sleep, stress, hydration, or general wellness.</p>
              </div>
              {locationError ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                  {locationError}
                </span>
              ) : userLocation ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <MapPin size={12} />
                  Location enabled
                </span>
              ) : null}
            </div>

            <div className="flex min-h-[70vh] flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                <AnimatePresence mode="wait">
                  {!hasMessages ? (
                    <EmptyChatState key="empty" onSelectPrompt={handleQuickFill} />
                  ) : (
                    <motion.div
                      key="thread"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-1"
                    >
                      {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} isUser={message.type === 'user'} />
                      ))}

                      {isLoading ? <TypingIndicator /> : null}

                      <div ref={messagesEndRef} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6">
                <div className="mb-3">
                  <SuggestedSymptomsChips onSelectSymptom={handleQuickFill} />
                </div>

                <ChatInput
                  value={draftMessage}
                  onChange={setDraftMessage}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  placeholder="Describe your symptoms, sleep, stress, or health question..."
                />
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assistant summary</p>
                  <p className="text-sm font-semibold text-text">What the conversation suggests</p>
                </div>
              </div>

              {showMedicalSummary && latestAIMessage ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Recommended specialty</p>
                    <p className="mt-1 text-xl font-semibold text-blue-900">
                      {latestAIMessage.recommendedSpecialization}
                    </p>
                    <p className="mt-2 text-sm text-blue-800/90">Use this as the best first specialist for the symptoms discussed.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Wellness tips</p>
                      <p className="mt-1 text-2xl font-semibold text-emerald-900">{latestTips.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Possible causes</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{latestPossibleCauses.length}</p>
                    </div>
                  </div>

                  {latestTips.length ? (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Top tips</p>
                      <ul className="mt-3 space-y-2 text-sm text-emerald-900/90">
                        {latestTips.map((tip) => (
                          <li key={tip} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {latestPossibleCauses.length ? (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Possible causes</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {latestPossibleCauses.map((cause) => (
                          <span key={cause} className="rounded-full border border-blue-100 bg-white px-3 py-1 text-xs text-blue-800 shadow-sm">
                            {cause}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    The assistant does not diagnose or prescribe. It helps you understand what to do next and which specialist to consider.
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  Start with a symptom or a wellness question when you want healthcare guidance. Conversational replies will stay simple and uncluttered.
                </div>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested doctors</p>
                  <p className="text-sm font-semibold text-text">Based on the latest specialist recommendation</p>
                </div>
                {latestSpecialization ? (
                  <Badge className="border-blue-100 bg-blue-50 text-blue-700">{latestSpecialization}</Badge>
                ) : null}
              </div>

              <div className="mt-4 space-y-3">
                {loadingDoctors ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <article key={doctor._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold text-text">
                            {doctor.user?.name || 'Doctor'}
                          </h4>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                            {doctor.hospitalName || doctor.chamberAddress || 'Location not listed'}
                          </p>
                        </div>
                        {doctor.isVerified ? (
                          <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700">Verified</Badge>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-slate-50 px-2.5 py-1">Fee BDT {doctor.consultationFee}</span>
                        <span className="rounded-full bg-slate-50 px-2.5 py-1">{doctor.experienceYears} yrs experience</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
                          <Star size={12} className="text-amber-500" fill="currentColor" />
                          {doctor.ratingAverage?.toFixed?.(1) || '0.0'}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                          {doctor.specialization}
                        </p>
                        <Link
                          to={`/doctors/${doctor._id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          View details
                        </Link>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                    No doctors found for this specialty right now. Try another symptom or browse the full doctors directory.
                  </div>
                )}
              </div>
            </motion.section>
          </aside>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-white/70 bg-white/75 px-4 py-3 text-xs text-slate-500 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <p>
              Disclaimer: This assistant provides general wellness guidance only and is not a replacement for professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
