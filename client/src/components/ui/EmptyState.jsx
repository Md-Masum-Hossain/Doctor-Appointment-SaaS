function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <h3 className="text-base font-bold text-text">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export default EmptyState
