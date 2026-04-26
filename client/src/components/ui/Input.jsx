function Input({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  className = '',
}) {
  return (
    <label htmlFor={id || name} className={`block text-sm ${className}`}>
      {label ? <span className="mb-1.5 block font-medium text-slate-700">{label}</span> : null}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
      />
    </label>
  )
}

export default Input
