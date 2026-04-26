function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
