function LoadingSkeleton({ rows = 1, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100" />
      ))}
    </div>
  )
}

export default LoadingSkeleton
