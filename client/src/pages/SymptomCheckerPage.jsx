import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import DoctorCard from '../components/common/DoctorCard'
import EmptyState from '../components/ui/EmptyState'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import { useSymptomRecommendationMutation } from '../hooks/useAiQuery'

const quickExamples = [
  'Fever and cough',
  'Chest pain and shortness of breath',
  'Skin rash and itching',
  'Tooth pain and swelling',
  'Eye pain and blurred vision',
]

function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('')
  const recommendationMutation = useSymptomRecommendationMutation()
  const result = recommendationMutation.data

  const handleSubmit = (event) => {
    event.preventDefault()
    recommendationMutation.mutate(symptoms)
  }

  const handleExampleClick = (example) => {
    setSymptoms(example)
  }

  return (
    <div className="relative overflow-hidden bg-slate-50 py-12 sm:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_30%)]" />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mx-auto max-w-5xl space-y-8"
        >
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">Phase 10</Badge>
              <Badge className="border-slate-200 bg-slate-50 text-slate-700">AI placeholder</Badge>
            </div>

            <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-text sm:text-5xl">
                  Symptom checker with doctor recommendations
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Describe your symptoms and get a simple rule-based specialization recommendation plus matching doctors from the database.
                  This is a clean placeholder architecture that can later connect to OpenAI or Gemini without changing the user flow.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-text">Example symptoms</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {quickExamples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-primary hover:text-primary"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Describe your symptoms</span>
                <textarea
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  rows={6}
                  placeholder="Example: I have fever, cough, and body ache since yesterday."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" variant="primary" isLoading={recommendationMutation.isPending} disabled={!symptoms.trim()}>
                  Analyze symptoms
                </Button>
                <button
                  type="button"
                  onClick={() => setSymptoms('')}
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
                >
                  Clear
                </button>
              </div>
            </form>
          </section>

          <AnimatePresence mode="wait">
            {recommendationMutation.isPending ? (
              <motion.section
                key="loading"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-text">Analyzing symptoms</h2>
                    <p className="mt-1 text-sm text-slate-600">Finding the best specialization and matching doctors.</p>
                  </div>
                  <Badge className="border-blue-200 bg-blue-50 text-blue-700">Processing</Badge>
                </div>
                <LoadingSkeleton rows={3} className="mt-5" />
              </motion.section>
            ) : null}

            {recommendationMutation.isError ? (
              <motion.section
                key="error"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-rose-700">Something went wrong</h2>
                <p className="mt-2 text-sm text-rose-600">
                  {recommendationMutation.error?.response?.data?.message || 'We could not analyze the symptoms right now.'}
                </p>
              </motion.section>
            ) : null}

            {result ? (
              <motion.section
                key="result"
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-text">Recommendation result</h2>
                      <p className="mt-1 text-sm text-slate-600">{result.note}</p>
                    </div>
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      {result.confidence || 'low'} confidence
                    </Badge>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Symptoms</p>
                      <p className="mt-2 text-sm text-text">{result.symptoms}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended specialty</p>
                      <p className="mt-2 text-lg font-semibold text-text">{result.recommendedSpecialization}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Matching doctors</p>
                      <p className="mt-2 text-lg font-semibold text-text">{result.matchingDoctors?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {result.matchingDoctors?.length ? (
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-text">Doctors you can book</h3>
                      <Link to="/doctors" className="text-sm font-medium text-primary hover:text-primary/80">
                        Browse all doctors
                      </Link>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {result.matchingDoctors.map((doctor) => (
                        <DoctorCard key={doctor._id} doctor={doctor} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No matching doctors found"
                    description="Try another symptom description or check the doctors directory."
                    action={
                      <Link to="/doctors">
                        <Button variant="primary">Browse doctors</Button>
                      </Link>
                    }
                  />
                )}
              </motion.section>
            ) : null}
          </AnimatePresence>

          {!result && !recommendationMutation.isPending && !recommendationMutation.isError ? (
            <EmptyState
              title="Waiting for symptoms"
              description="Type a short description of what you are experiencing and we will recommend a specialization and matching doctors."
            />
          ) : null}
        </motion.div>
      </Container>
    </div>
  )
}

export default SymptomCheckerPage