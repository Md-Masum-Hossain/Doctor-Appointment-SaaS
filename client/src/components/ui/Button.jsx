import { motion } from 'framer-motion'

function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
}) {
  const baseStyle =
    'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    primary: 'bg-primary text-white shadow-sm hover:bg-blue-700',
    accent: 'bg-accent text-white shadow-sm hover:bg-teal-600',
    ghost: 'bg-white text-text ring-1 ring-slate-200 hover:bg-slate-50',
  }

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </motion.button>
  )
}

export default Button
