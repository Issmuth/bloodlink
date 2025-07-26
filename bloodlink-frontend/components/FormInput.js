export default function FormInput({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false, 
  options = [], 
  ...props 
}) {
  const inputClasses = `form-input ${error ? 'border-crimson ring-crimson ring-1' : ''}`

  if (type === 'select') {
    return (
      <div className="mb-4">
        <label className="form-label">
          {label} {required && <span className="text-crimson">*</span>}
        </label>
        <select
          value={value}
          onChange={onChange}
          className={inputClasses}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-crimson text-sm mt-1">{error}</p>}
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div className="mb-4">
        <label className="form-label">
          {label} {required && <span className="text-crimson">*</span>}
        </label>
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClasses} min-h-[100px] resize-y`}
          {...props}
        />
        {error && <p className="text-crimson text-sm mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div className="mb-4">
      <label className="form-label">
        {label} {required && <span className="text-crimson">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
        {...props}
      />
      {error && <p className="text-crimson text-sm mt-1">{error}</p>}
    </div>
  )
} 