import { motion } from 'framer-motion'

const toneStyles = {
  primary: {
    ring: 'border-primary/15',
    icon: 'bg-primary/10 text-primary',
  },
  accent: {
    ring: 'border-accent/20',
    icon: 'bg-accent/15 text-teal-700',
  },
  success: {
    ring: 'border-emerald-200',
    icon: 'bg-emerald-100 text-emerald-700',
  },
  warning: {
    ring: 'border-amber-200',
    icon: 'bg-amber-100 text-amber-700',
  },
}

function StatCard({ label, value, helper, icon, tone = 'primary', index = 0 }) {
  const styles = toneStyles[tone] || toneStyles.primary

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`rounded-2xl border bg-white p-5 shadow-sm ${styles.ring}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-text">{value}</p>
          {helper ? <p className="mt-1 text-sm text-slate-600">{helper}</p> : null}
        </div>
        {icon ? (
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${styles.icon}`}>
            {icon}
          </span>
        ) : null}
      </div>
    </motion.article>
  )
}

export default StatCard
