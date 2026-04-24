import { motion } from 'framer-motion'

function HomePage() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-2 text-2xl font-semibold text-text">Project Foundation Ready</h2>
      <p className="text-slate-600">
        Frontend routing, query provider, Axios client, and Zustand stores are configured.
      </p>
    </motion.section>
  )
}

export default HomePage
