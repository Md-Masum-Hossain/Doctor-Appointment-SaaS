import { motion } from 'framer-motion'
import Badge from './Badge'

function SectionHeader({ eyebrow, title, description, centered = true, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`${centered ? 'text-center' : ''} ${className}`}
    >
      {eyebrow ? <Badge className="mb-3">{eyebrow}</Badge> : null}
      <h2 className="text-2xl font-bold leading-tight text-text sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 text-sm text-slate-600 sm:text-base">{description}</p> : null}
    </motion.div>
  )
}

export default SectionHeader
